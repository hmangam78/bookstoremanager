import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { NewTicketDTO } from './dto/ticket.dto';

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        
        private readonly dataSource: DataSource,
    ) {}

    async getAll() {
        return await this.ticketRepository.find();
    }

    async getOneByTicketNumber(ticketNo: string) {
        return await this.ticketRepository.findOneBy({ ticketNo });
    }

    async createTicket(ticketData: NewTicketDTO) {
        return await this.dataSource.transaction(async manager => {
            const ticketRepo = manager.getRepository(Ticket);
            
            const ticket = ticketRepo.create(ticketData);
            const savedTicket = await ticketRepo.save(ticket);

            const datePart = this.formatDate();
            savedTicket.ticketNo =`${datePart}${savedTicket.id}`;

            return await ticketRepo.save(savedTicket);
            
        })
    }

    private formatDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear());

        const datePart = `${day}${month}${year}`;

        return datePart;
    }
}
