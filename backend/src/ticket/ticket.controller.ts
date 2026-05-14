import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { NewTicketDTO } from './dto/ticket.dto';

@Controller('ticket')
export class TicketController {
    constructor(private ticketService: TicketService) {}

    @Get()
    getAll() {
        return this.ticketService.getAll();
    }

    @Get(':ticketNo')
    getOneByTicketNumber(@Param('ticketNo') ticketNo: string){
        return this.ticketService.getOneByTicketNumber(ticketNo);
    }

    @Post()
    createTicket(@Body() ticketData: NewTicketDTO) {
        return this.ticketService.createTicket(ticketData);
    }
}
