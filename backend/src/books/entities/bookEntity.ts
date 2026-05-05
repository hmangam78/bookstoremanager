import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    author: string;
    
    @Column()
    isbn: string;
    
    @Column()
    price: number;
    
    @Column({ type: 'int', default: 0 })
    stock: number;
    
    @Column()
    description: string;
    
    @Column()
    format: string;
}