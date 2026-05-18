import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Book, Uncatalogued } from 'src/books/entities/bookEntity';
import { StockReceiptDTO, StockReceiptOrderDTO } from './dto/stockReceipt.dto';
import { StockReceiptOrder } from './entities/stockReceiptOrder.entity';
import { StockReceiptOrderItem} from './entities/stockReceiptOrderItem.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class StockReceiptService {

    constructor(
        @InjectRepository(StockMovement)
        private readonly stockMovementRepository: Repository<StockMovement>,
        
        @InjectRepository(Uncatalogued)
        private readonly uncataloguedRepository: Repository<Uncatalogued>,
        private readonly dataSource: DataSource,
    ) {}

    async uploadStock(stockReceiptOrder: StockReceiptOrderDTO) {
        return await this.dataSource.transaction(async manager => {

            // Create the StockReceiptOrder
            const order = manager.getRepository(StockReceiptOrder).create({
                orderNo: stockReceiptOrder.orderNo,
            });
            let savedOrder: StockReceiptOrder;
            try {
                savedOrder = await manager.save(order);
            } catch (error: unknown) {
                if ((error as { code?: string })?.code === '23505') {
                    throw new ConflictException(
                        `El número de pedido "${stockReceiptOrder.orderNo}" ya ha sido capturado.`
                    );
                }
                throw error;
            }

            // Create StockReceiptOrderItems for each line
            const orderItems = stockReceiptOrder.items.map(item =>
                manager.getRepository(StockReceiptOrderItem).create({
                    orderId: savedOrder.id,
                    isbn: item.isbn,
                    stock: item.stock,
                })
            );
            await manager.save(orderItems);

            // Process stock
            for (const element of stockReceiptOrder.items) {
                // Search by ISBN
                const dataBaseItem = await manager
                    .getRepository(Book)
                    .createQueryBuilder('book')
                    .setLock('pessimistic_write')
                    .where('book.isbn = :isbn', { isbn: element.isbn })
                    .getOne();

                if (dataBaseItem) {
                    // Update stock and save
                    dataBaseItem.stock += element.stock;
                    await manager.save(dataBaseItem);
                } else {
                    await this.manageUncatalogued(element, manager);
                }

                await this.recordMovement(manager, element.isbn, element.stock, 'stock captured', stockReceiptOrder.orderNo);
            }
            return savedOrder;
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

    async getUncatalogued() {
        return await this.uncataloguedRepository.find();
    }

    async getUncataloguedByISBN(isbn: string) {
        return await this.uncataloguedRepository.findOneBy({ isbn });
    }

    async getMovementsByISBN(isbn: string) {
        return await this.stockMovementRepository.find({
            where: { isbn },
            order: { createdAt: 'DESC'}
        });
    }

    private async recordMovement(manager, isbn, quantity, type, reference?) {
        const repo = manager.getRepository(StockMovement);
        const newMovement = repo.create( {
            isbn,
            quantity,
            type,
            reference,
        });
        await repo.save(newMovement);
    }
}
