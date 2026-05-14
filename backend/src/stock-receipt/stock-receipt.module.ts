import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockReceiptController } from './stock-receipt.controller';
import { StockReceiptService } from './stock-receipt.service';
import { Book, Uncatalogued } from 'src/books/entities/bookEntity';
import { StockReceiptOrderItem } from './entities/stockReceiptOrderItem.entity';
import { StockReceiptOrder } from './entities/stockReceiptOrder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Uncatalogued, StockReceiptOrder, StockReceiptOrderItem])],
  controllers: [StockReceiptController],
  providers: [StockReceiptService]
})
export class StockReceiptModule {}
