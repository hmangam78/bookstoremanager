import { Module } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketItem } from 'src/ticket/entities/ticket-item.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Book } from 'src/books/entities/bookEntity';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  imports: [TicketModule, TypeOrmModule.forFeature([ Ticket, TicketItem, Sale, Book])],
  controllers: [ReturnsController],
  providers: [ReturnsService]
})
export class ReturnsModule {}
