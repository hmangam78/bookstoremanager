import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Book, Uncatalogued } from 'src/books/entities/bookEntity';
import { StockReceiptArrayDTO, StockReceiptDTO } from './dto/stockReceipt.dto';

@Injectable()
export class StockReceiptService {

    constructor(
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,
        @InjectRepository(Uncatalogued)
        private readonly uncataloguedRepository: Repository<Uncatalogued>,
        private readonly dataSource: DataSource,
    ) {}

    async uploadStock(stockReceiptArray: StockReceiptArrayDTO) {
        return await this.dataSource.transaction(async manager => {
            for (const element of stockReceiptArray.items) {
                // Search by ISBN
                const dataBaseItem = await manager.getRepository(Book).findOne({
                    where: { isbn: element.isbn },
                    lock: { mode: 'pessimistic_write'},
                });

                if (dataBaseItem) {
                    // Update stock and save
                    dataBaseItem.stock += element.stock;
                    await manager.save(dataBaseItem);
                } else {
                    await this.manageUncatalogued(element, manager);
                }
            }
        });
    }

    async manageUncatalogued(element: StockReceiptDTO, manager: EntityManager) {
        const uncataloguedDatabaseItem = await manager.getRepository(Uncatalogued).findOne({
            where: { isbn: element.isbn },
            lock: { mode: 'pessimistic_write' },
        });

        if (uncataloguedDatabaseItem) {
            uncataloguedDatabaseItem.stock += element.stock;
            await manager.save(uncataloguedDatabaseItem);
        } else {
            const uncataloguedItem = manager.getRepository(Uncatalogued).create({
                isbn: element.isbn,
                stock: element.stock,
            });
            await manager.save(uncataloguedItem);
        }
    }
}
