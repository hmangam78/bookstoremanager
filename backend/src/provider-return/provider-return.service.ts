import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Provider, ProviderReturn } from './entities/providerReturnEntity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/entities/bookEntity';
import { CreateProviderReturnDTO } from './dto/providerReturn.dto';

@Injectable()
export class ProviderReturnService {
    constructor(
        @InjectRepository(Provider)
        private readonly providerRepository: Repository<Provider>,

        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(ProviderReturn)
        private readonly providerReturnRepository: Repository<ProviderReturn>,
    ) {}

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
                status: In(['pending']),
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

        // Look up all books by ISBN and group by publisher
        const grouped = new Map<string, { isbn: string, quantity: number }[]>();

        for (const item of returnData.items) {
            const book = await this.bookRepository.findOneBy({ isbn: item.isbn });
            if (!book) {
                throw new NotFoundException(`Book ${item.isbn} not found`);
            }

            if (book.stock < item.quantity) {
                throw new BadRequestException(
                    `Tried to return ${item.quantity} units of isbn ${item.isbn}. Only ${book.stock} available`
                );
            }

            const publisher = book.publisher || 'Sin editorial';
            if (!grouped.has(publisher)) {
                grouped.set(publisher, []);
            }
            grouped.get(publisher)!.push({ isbn: item.isbn, quantity: item.quantity });
        }

        // For each publisher group, find a provider and create a return
        const createdReturns: ProviderReturn[] = [];

        for (const [publisher, items] of grouped) {
            const provider = await this.providerRepository.findOne({
                where: { publishers: In([publisher]) },
            });

            const providerReturn = this.providerReturnRepository.create({
                publisher,
                providerId: provider?.id ?? null,
                provider: provider ?? null,
                items,
                status: 'pending',
            });

            createdReturns.push(await this.providerReturnRepository.save(providerReturn));
        }

        return createdReturns;
    }

    async getAllReturns() {
        return await this.providerReturnRepository.find();
    }

    getReturnsByProvider(providerId: number) {
        return this.providerReturnRepository.find({ where: { providerId } });
    }

    getReturnsByPublisher(publisherId: number) {
        return this.providerReturnRepository.find({ where: { publisherId } });
    }
}
