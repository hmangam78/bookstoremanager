import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketItem } from './entities/ticket-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketItem])],
  controllers: [TicketController],
  providers: [TicketService]
})
export class TicketModule {}
