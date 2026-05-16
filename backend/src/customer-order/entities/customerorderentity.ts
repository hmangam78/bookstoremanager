import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Customer } from "src/customer/entities/customerEntity";


@Entity()
export class CustomerOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    isbn: string;

    @Column({ type: 'int' })
    quantity: number;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column()
    customerId: number;
}