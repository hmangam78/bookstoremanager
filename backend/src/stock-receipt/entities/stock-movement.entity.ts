import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, } from "typeorm";

@Entity()
export class StockMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    isbn: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ type: 'varchar', nullable: true })
    reference: string;

    @CreateDateColumn()
    createdAt: Date;
}