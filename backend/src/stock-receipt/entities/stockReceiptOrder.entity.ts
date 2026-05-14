import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { StockReceiptOrderItem } from "./stockReceiptOrderItem.entity";

@Entity()
export class StockReceiptOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    orderNo: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => StockReceiptOrderItem, (item) => item.order, { cascade: true })
    items: StockReceiptOrderItem[];
}
