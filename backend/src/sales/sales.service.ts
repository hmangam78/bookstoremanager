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

    findSalesBySaleId(saleId: number) {
        return this.saleRepo.findOne({
            where: { id: saleId },
            relations: ['book'],
        });
    }

    //Sales in a period
    findSalesInPeriod(from: string, to: string) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        return this.saleRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.book', 'book')
            .where('sale.createdAt BETWEEN :from AND :to', { from: fromDate, to: toDate })
            .orderBy('sale.createdAt', 'DESC')
            .getMany();
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

    //Book sales in period
    findSalesByBook(bookId: number, from: string, to: string) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        // Ensure fromDate is at the start of the day and toDate is at the end of the day
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return this.saleRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.book', 'book')
            .where('book.id = :bookId', { bookId })
            .andWhere('sale.createdAt BETWEEN :from AND :to', { from: fromDate, to: toDate })
            .orderBy('sale.createdAt', 'DESC')
            .getMany();
    }

    //Today's sales
    findTodaySales() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.saleRepo
            .createQueryBuilder('sale')
            .leftJoinAndSelect('sale.book', 'book')
            .where('sale.createdAt BETWEEN :from AND :to', { from: today, to: tomorrow })
            .orderBy('sale.createdAt', 'DESC')
            .getMany();
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