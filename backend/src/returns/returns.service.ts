import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReturnTicketDTO } from './dto/return-ticket.dto';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketItem } from 'src/ticket/entities/ticket-item.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Book } from 'src/books/entities/bookEntity';

@Injectable()
export class ReturnsService {

    constructor(
        private readonly dataSource: DataSource,
    ) {}

    async processReturn(returnData: ReturnTicketDTO) {
        return await this.dataSource.transaction(async manager => {
            // Find the ticket
            const ticketRepo = manager.getRepository(Ticket);
            const ticket = await ticketRepo.findOne({
                where: { ticketNo: returnData.ticketNo },
                relations: ['items'],
            });

            if (!ticket){
                throw new NotFoundException(`Ticket ${returnData.ticketNo} not found`);
            }

            const itemsToProcess: TicketItem[] = [];

            // Validate items are in  ticket
            returnData.items.forEach((item) => {
                const itemInTicket = ticket.items.find((ticketItem) => ticketItem.id === item.ticketItemId);
                
                if (!itemInTicket) {
                    throw new BadRequestException(`Item not in ticket`);
                }
                
                if (item.quantity > itemInTicket.quantity - itemInTicket.returnedQuantity){
                    throw new BadRequestException(`Cannot return that quantity`);
                }

                itemsToProcess.push(itemInTicket);
            });

            // Process each return article
            const saleRepo = manager.getRepository(Sale);
            const bookRepo = manager.getRepository(Book);

            for (const itemToReturn of returnData.items) {
                const ticketItem = ticket.items.find(item => item.id === itemToReturn.ticketItemId)!;

                ticketItem.returnedQuantity += itemToReturn.quantity;
                await manager.save(ticketItem);

                const sale = await saleRepo.findOne({
                    where: { id: ticketItem.saleId },
                    relations: ['book'],
                });

                if (sale) {
                    await saleRepo.remove(sale);
                }
                
                const book = await bookRepo.findOneBy({ id: ticketItem.bookId });
                if (book) {
                    book.stock += itemToReturn.quantity;
                    await manager.save(book);
                }
            }

            const allReturned = ticket.items.every(
                item => item.returnedQuantity >= item.quantity
            );

            if (allReturned) {
                ticket.status = 'returned';
            }

            const returnedTotal = returnData.items.reduce((sum, item) => {
                const ticketItem = ticket.items.find(ti => ti.id === item.ticketItemId)!;
                const perUnit = Number(ticketItem.total) / ticketItem.quantity;
                return sum + (perUnit * item.quantity);
            }, 0);

            ticket.totalAmount = Number(ticket.totalAmount) - returnedTotal;
            await ticketRepo.save(ticket);

            return ticket;
        });

    }

}

