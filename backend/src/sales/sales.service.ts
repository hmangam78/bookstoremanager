import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Sale } from "./entities/sale.entity";
import { Book } from "src/books/entities/bookEntity";
import { CreateSaleDTO } from "./dto/create-sales.dto";

@Injectable()
export class SalesService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
        @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    ) {}

    //All sales
    findAll() {
        return this.saleRepo.find({ relations: ['book'], order: { createdAt: 'DESC' } });
    }

    //Book historic
    findByBook(bookId: number) {
        return this.saleRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.book', 'book')
            .where('book.id = :bookId', { bookId })
            .orderBy('sale.createdAt', 'DESC')
            .getMany();
    }

    //Sale
    async createSale(dto: CreateSaleDTO) {
        const { bookId, quantity, unitPrice } = dto;
        if (quantity <= 0) throw new BadRequestException('Quantity must be greater than 0');

        return await this.dataSource.transaction(async manager => {
            const book = await manager
                .createQueryBuilder(Book, 'book')
                .setLock('pessimistic_write')
                .where('book.id = :id', {id: bookId })
                .getOne();
            
            if (!book) throw new NotFoundException('Book not found');

            if (book.stock < quantity) throw new BadRequestException('Insufficient stock');

            book.stock = book.stock - quantity;
            await manager.save(book);

            const price = unitPrice ?? (book.price ?? 0);
            const sale = manager.create(Sale, {
                book,
                quantity,
                unitPrice: price,
                total: Number((price * quantity).toFixed(2)),
            });

            return manager.save(sale);
        })
    }

    //Bulk sale, for basket checkout
    async createBulkSale(items: Array<{ bookId: number; quantity: number; unitPrice?: number }>) {
        if (!items.length) throw new BadRequestException('No items to sell');

        return await this.dataSource.transaction(async manager => {
            const sales: Sale[] = [];

            for (const item of items) {
                const { bookId, quantity, unitPrice } = item;

                if (quantity <= 0) throw new BadRequestException(`Invalid quantity for book ${bookId}`);

                const book = await manager
                    .createQueryBuilder(Book, 'book')
                    .setLock('pessimistic_write')
                    .where('book.id = :id', { id: bookId })
                    .getOne();
                
                if (!book) throw new NotFoundException(`Book ${bookId} not found`);
                if (book.stock < quantity) throw new BadRequestException(`Insufficient stock for book ${bookId}`);

                book.stock -= quantity;
                await manager.save(book);

                const price = unitPrice ?? book.price ?? 0;
                const sale = manager.create(Sale, {
                    book,
                    quantity,
                    unitPrice: price,
                    total: Number((price * quantity).toFixed(2)),
                });

                sales.push(await manager.save(sale));
            }

            return sales;
        })
    }
}