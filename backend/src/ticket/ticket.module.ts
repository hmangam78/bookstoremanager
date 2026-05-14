import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketItem } from './entities/ticket-item.entity';
import { Book } from 'src/books/entities/bookEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketItem, Book])],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService]
})
export class TicketModule {}
