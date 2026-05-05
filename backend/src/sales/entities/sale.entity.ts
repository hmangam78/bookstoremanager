import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Book } from '../../books/entities/bookEntity'

@Entity()
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Book, { onDelete: 'SET NULL' })
    book: Book;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'numeric', precision: 10, scale: 2})
    total: number;

    @CreateDateColumn()
    createdAt: Date;
}