import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TicketItem } from './ticket-item.entity'

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ticketNo: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ type: 'varchar', default: 'completed' })
    status: string;

    @OneToMany(() => TicketItem, (item) => item.ticket, { cascade: ['insert'] })
    items: TicketItem[];
}