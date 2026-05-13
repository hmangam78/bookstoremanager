import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockReceiptController } from './stock-receipt.controller';
import { StockReceiptService } from './stock-receipt.service';
import { Book, Uncatalogued } from 'src/books/entities/bookEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Uncatalogued])],
  controllers: [StockReceiptController],
  providers: [StockReceiptService]
})
export class StockReceiptModule {}
