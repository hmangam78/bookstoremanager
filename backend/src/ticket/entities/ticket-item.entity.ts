import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Ticket } from "./ticket.entity";

@Entity()
export class TicketItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.items)
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket

    @Column()
    saleId: number;

    @Column()
    bookId: number;

    @Column()
    quantity: number;

    @Column()
    unitPrice: number;

    @Column()
    total: number;

    @Column({ default: 0 })
    returnedQuantity: number;
}