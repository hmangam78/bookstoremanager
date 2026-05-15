import { Injectable } from '@nestjs/common';
import { Book, Uncatalogued } from 'src/books/entities/bookEntity';
import { DataSource, EntityManager } from 'typeorm';
import { AdjustStockDTO } from './dto/adjustStock.dto';
import { StockMovement } from 'src/stock-receipt/entities/stock-movement.entity';
import * as crypto from 'crypto';

@Injectable()
export class InventoryAdjustmentService {

    constructor(
        private readonly dataSource: DataSource,
    ) {}

    async adjustOne(itemData: AdjustStockDTO) {
        return await this.dataSource.transaction(async manager => {
            // Acquire a Postgres advisory lock keyed by a hash of the ISBN.
            // This serializes all transactions adjusting the same ISBN,
            // preventing race conditions between the two findOne calls.
            const lockKey = this.isbnToLockKey(itemData.isbn);
            await manager.query(`SELECT pg_advisory_xact_lock(${lockKey})`);

            const cataloguedItem = await manager.getRepository(Book).findOne({
                where: { isbn: itemData.isbn },
                lock: { mode: 'pessimistic_write' },
            });

            const uncataloguedItem = await manager.getRepository(Uncatalogued).findOne({
                where: { isbn: itemData.isbn },
                lock: { mode: 'pessimistic_write' },
            });

            // Guard against the impossible state: the same ISBN in both tables
            if (cataloguedItem && uncataloguedItem) {
                throw new Error(
                    `Data integrity violation: ISBN ${itemData.isbn} exists in both Book and Uncatalogued tables.`
                );
            }

            if (cataloguedItem) {
                cataloguedItem.stock += itemData.quantity;
                await manager.save(cataloguedItem);
            } else if (uncataloguedItem) {
                uncataloguedItem.stock += itemData.quantity;
                await manager.save(uncataloguedItem);
            } else {
                const newUncataloguedItem = manager.getRepository(Uncatalogued).create({
                    isbn: itemData.isbn,
                    stock: itemData.quantity,
                });

                await manager.save(newUncataloguedItem);
            }
            await this.recordMovement(manager, itemData.isbn, itemData.quantity, 'Inventory adjustment');
        });
    }

    private async recordMovement(manager: EntityManager, isbn: string, quantity: number, type: string, reference?: string) {
        const repo = manager.getRepository(StockMovement);
        const newMovement = repo.create( {
            isbn,
            quantity,
            type,
            reference,
        });
        await repo.save(newMovement);
    }

    /**
     * Converts an ISBN string into a consistent 64-bit bigint for use with
     * pg_advisory_xact_lock. Uses the first 8 bytes of a SHA-256 hash.
     */
    private isbnToLockKey(isbn: string): bigint {
        const hash = crypto.createHash('sha256').update(isbn).digest();
        // Read first 8 bytes as a signed bigint
        const buf = hash.subarray(0, 8);
        let result = BigInt(0);
        for (let i = 0; i < 8; i++) {
            result = (result << BigInt(8)) | BigInt(buf[i]);
        }
        // Ensure it's positive (pg_advisory_xact_lock expects positive int8)
        return result & BigInt('0x7FFFFFFFFFFFFFFF');
    }
}
