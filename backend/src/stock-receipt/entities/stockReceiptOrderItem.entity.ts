import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { StockReceiptOrder } from "./stockReceiptOrder.entity";

@Entity()
export class StockReceiptOrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => StockReceiptOrder, (order) => order.items)
    @JoinColumn({ name: 'orderId' })
    order: StockReceiptOrder;

    @Column()
    orderId: number;

    @Column()
    isbn: string;

    @Column({ type: 'int' })
    stock: number;
}
