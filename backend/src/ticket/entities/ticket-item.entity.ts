import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Ticket } from "./ticket.entity";
import { Book } from "src/books/entities/bookEntity";

@Entity()
export class TicketItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Book, { onDelete: 'SET NULL'})
    book: Book;

    @ManyToOne(() => Ticket, (ticket) => ticket.items)
    @JoinColumn({ name: 'ticketId' })
    ticket: Ticket

    @Column()
    saleId: number;

    @Column()
    bookId: number;

    @Column()
    quantity: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    total: number;

    @Column({ default: 0 })
    returnedQuantity: number;
}