import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Provider, ProviderReturn, Publisher } from './entities/providerReturnEntity';
import { Repository, ArrayContains, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/entities/bookEntity';
import {
    CreateProviderReturnDTO,
    ProviderReturnResponseDTO,
    UpdateProviderReturnDTO,
} from './dto/providerReturn.dto';
import { StockMovement } from 'src/stock-receipt/entities/stock-movement.entity';

@Injectable()
export class ProviderReturnService {
    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,

        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(ProviderReturn)
        private readonly providerReturnRepository: Repository<ProviderReturn>,

        @InjectRepository(StockMovement)
        private readonly stockMovementRepository: Repository<StockMovement>,

        private readonly dataSource: DataSource,
    ) {}

    private mapReturn(providerReturn: ProviderReturn): ProviderReturnResponseDTO {
        return {
            id: providerReturn.id,
            providerId: providerReturn.providerId,
            provider: providerReturn.provider
                ? {
                      id: providerReturn.provider.id,
                      name: providerReturn.provider.name,
                  }
                : null,
            publisherId: providerReturn.publisherId ?? providerReturn.publisher.id,
            publisher: {
                id: providerReturn.publisher.id,
                publisherName: providerReturn.publisher.publisherName,
            },
            items: providerReturn.items,
            status: providerReturn.status,
            createdAt: providerReturn.createdAt,
            updatedAt: providerReturn.updatedAt,
        };
    }

    async createReturn(returnData: CreateProviderReturnDTO) {
        // Check for duplicate ISBNs within the same request
        const requestIsbns = new Set<string>();
        for (const item of returnData.items) {
            if (requestIsbns.has(item.isbn)) {
                throw new BadRequestException(
                    `ISBN ${item.isbn} aparece duplicado en la solicitud`
                );
            }
            requestIsbns.add(item.isbn);
        }

        // Get all previous pending return requests
        const existingReturns = await this.providerReturnRepository.find({
            where: {
                status: 'pending',
            },
        });

        // Collect all ISBNs already in an active return
        const alreadyRequested = new Set<string>();
        for (const ret of existingReturns) {
            for (const item of ret.items) {
                alreadyRequested.add(item.isbn);
            }
        }

        // Check all incoming items against the set
        for (const item of returnData.items) {
            if (alreadyRequested.has(item.isbn)) {
                throw new ConflictException(
                    `El ISBN ${item.isbn} ya está en una devolución activa`
                );
            }
        }

        // Look up all books by ISBN and group by publisher relation
        const grouped = new Map<number, { publisher: Publisher; items: { isbn: string; quantity: number }[] }>();

        for (const item of returnData.items) {
            const book = await this.bookRepository.findOne({
                where: { isbn: item.isbn },
                relations: {
                    publisher: true,
                },
            });
            if (!book) {
                throw new NotFoundException(`Book ${item.isbn} not found`);
            }

            if (book.stock < item.quantity) {
                throw new BadRequestException(
                    `Tried to return ${item.quantity} units of isbn ${item.isbn}. Only ${book.stock} available`
                );
            }

            if (!book.publisher) {
                throw new BadRequestException(`Book ${item.isbn} does not have a publisher assigned`);
            }

            if (!grouped.has(book.publisher.id)) {
                grouped.set(book.publisher.id, {
                    publisher: book.publisher,
                    items: [],
                });
            }

            grouped.get(book.publisher.id)!.items.push({ isbn: item.isbn, quantity: item.quantity });
        }

        // For each publisher group, find a provider and create a return
        const createdReturns: ProviderReturn[] = [];

        for (const { publisher, items } of grouped.values()) {
            const provider = await this.providerRepository.findOne({
                where: { publishers: ArrayContains([publisher.publisherName]) },
            });

            const providerReturn = this.providerReturnRepository.create({
                publisher,
                publisherId: publisher.id,
                providerId: provider?.id ?? null,
                provider: provider ?? null,
                items,
                status: 'pending',
            });

            createdReturns.push(await this.providerReturnRepository.save(providerReturn));
        }

        return createdReturns.map((providerReturn) => this.mapReturn(providerReturn));
    }

    async updateReturn(id: number, returnData: UpdateProviderReturnDTO) {
        const providerReturn = await this.providerReturnRepository.findOne({
            where: { id },
            relations: {
                publisher: true,
                provider: true,
            },
        });

        if (!providerReturn) {
            throw new NotFoundException(`Return ${id} not found`);
        }

        if (providerReturn.status !== 'pending') {
            throw new BadRequestException('Only pending returns can be edited');
        }

        const requestIsbns = new Set<string>();
        for (const item of returnData.items) {
            if (requestIsbns.has(item.isbn)) {
                throw new BadRequestException(`ISBN ${item.isbn} aparece duplicado en la solicitud`);
            }
            requestIsbns.add(item.isbn);
        }

        const existingReturns = await this.providerReturnRepository.find({
            where: {
                status: 'pending',
            },
        });

        const alreadyRequested = new Set<string>();
        for (const ret of existingReturns) {
            if (ret.id === id) {
                continue;
            }

            for (const item of ret.items) {
                alreadyRequested.add(item.isbn);
            }
        }

        const validatedItems: { isbn: string; quantity: number }[] = [];

        for (const item of returnData.items) {
            if (alreadyRequested.has(item.isbn)) {
                throw new ConflictException(`El ISBN ${item.isbn} ya está en una devolución activa`);
            }

            const book = await this.bookRepository.findOne({
                where: { isbn: item.isbn },
                relations: {
                    publisher: true,
                },
            });

            if (!book) {
                throw new NotFoundException(`Book ${item.isbn} not found`);
            }

            if (!book.publisher || book.publisher.id !== providerReturn.publisherId) {
                throw new BadRequestException(`Book ${item.isbn} does not belong to this publisher return`);
            }

            if (book.stock < item.quantity) {
                throw new BadRequestException(
                    `Tried to return ${item.quantity} units of isbn ${item.isbn}. Only ${book.stock} available`
                );
            }

            validatedItems.push({ isbn: item.isbn, quantity: item.quantity });
        }

        providerReturn.items = validatedItems;
        const savedReturn = await this.providerReturnRepository.save(providerReturn);
        return this.mapReturn(savedReturn);
    }

    async cancelReturn(id: number) {
        const providerReturn = await this.providerReturnRepository.findOne({
            where: { id },
        });

        if (!providerReturn) {
            throw new NotFoundException(`Return ${id} not found`);
        }

        if (providerReturn.status !== 'pending') {
            throw new BadRequestException('Only pending returns can be cancelled');
        }

        providerReturn.status = 'cancelled';
        const savedReturn = await this.providerReturnRepository.save(providerReturn);
        return this.mapReturn(savedReturn);
    }

    async sendReturn(id: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const providerReturn = await queryRunner.manager.findOne(ProviderReturn, {
                where: { id },
                relations: {
                    publisher: true,
                    provider: true,
                },
            });

            if (!providerReturn) {
                throw new NotFoundException(`Return ${id} not found`);
            }

            if (providerReturn.status !== 'pending') {
                throw new BadRequestException('Only pending returns can be sent');
            }

            // Update stock within transaction
            for (const item of providerReturn.items) {
                const book = await queryRunner.manager.findOne(Book, {
                    where: { isbn: item.isbn },
                });

                if (!book) {
                    throw new NotFoundException(`Book with ${item.isbn} not found`);
                }

                if (book.stock < item.quantity) {
                    throw new BadRequestException(
                        `Tried to return ${item.quantity} for book ${item.isbn}. Only ${book.stock} available.`
                    );
                }

                book.stock -= item.quantity;
                await queryRunner.manager.save(book);

                const newMovement = queryRunner.manager.create(StockMovement, {
                    isbn: item.isbn,
                    quantity: -item.quantity,
                    type: 'Devolución a proveedor',
                    reference: String(providerReturn.id),
                });
                await queryRunner.manager.save(newMovement);
            }

            // Update return status
            providerReturn.status = 'sent';
            const savedReturn = await queryRunner.manager.save(providerReturn);

            await queryRunner.commitTransaction();
            return this.mapReturn(savedReturn);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateStock(providerReturn) {
        for (const item of providerReturn.items) {
            const book = await this.bookRepository.findOne({ where: { isbn: item.isbn } });
            
            if (!book) {
                throw new NotFoundException(`Book with ${item.isbn} not found`);
            }

            if (book.stock < item.quantity) {
                throw new BadRequestException(`Tried to return ${item.quantity} for book ${item.isbn}. Only ${book.stock} available.`);
            }

            book.stock -= item.quantity;
            await this.bookRepository.save(book);
            await this.recordMovement(item.isbn, -item.quantity, 'Devolución a proveedor', providerReturn.id);
        }
    }

    private async recordMovement(isbn: string, quantity: number, type: string, reference?: string) {
        const newMovement = this.stockMovementRepository.create( {
            isbn,
            quantity,
            type,
            reference,
        });
        await this.stockMovementRepository.save(newMovement);
    }

    async getAllReturns() {
        const providerReturns = await this.providerReturnRepository.find();
        return providerReturns.map((providerReturn) => this.mapReturn(providerReturn));
    }

    async getActiveReturns() {
        const providerReturns = await this.providerReturnRepository.find({
            where: { status: 'pending' },
        });
        return providerReturns.map((providerReturn) => this.mapReturn(providerReturn));
    }

    async getFinishedReturns() {
        const providerReturns = await this.providerReturnRepository.find({
            where: [
                { status: 'sent' },
                { status: 'completed' },
                { status: 'cancelled' },
            ],
            order: { updatedAt: 'DESC' },
        });
        return providerReturns.map((providerReturn) => this.mapReturn(providerReturn));
    }

    getReturnById(id: number) {
        return this.providerReturnRepository.findOne({
            where: { id },
            relations: {
                publisher: true,
                provider: true,
            },
        }).then((providerReturn) => providerReturn ? this.mapReturn(providerReturn) : null);
    }

    getReturnsByProvider(providerId: number) {
        return this.providerReturnRepository.find({ where: { providerId } }).then((providerReturns) =>
            providerReturns.map((providerReturn) => this.mapReturn(providerReturn))
        );
    }

    getReturnsByPublisher(publisherId: number) {
        return this.providerReturnRepository.find({ where: { publisherId } }).then((providerReturns) =>
            providerReturns.map((providerReturn) => this.mapReturn(providerReturn))
        );
    }
}
