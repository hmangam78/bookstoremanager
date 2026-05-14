import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { BooksModule } from 'src/books/books.module';
import { SalesModule } from 'src/sales/sales.module';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  providers: [BasketService],
  controllers: [BasketController],
  imports: [BooksModule, SalesModule, TicketModule]
})
export class BasketModule {}
