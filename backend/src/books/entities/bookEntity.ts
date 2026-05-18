import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Provider, Publisher } from "src/provider-return/entities/providerReturnEntity";

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    author!: string;
    
    @Column()
    isbn!: string;
    
    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: {
            to: (value: number) => value,
            from: (value: string | null) => (value === null ? 0 : parseFloat(value)),
        },
    })
    price!: number;
    
    @Column({ type: 'int', default: 0 })
    stock!: number;
    
    @Column()
    description!: string;
    
    @Column()
    format!: string;

    @Column({ type: 'text', array: true, default: [] })
    genre!: string[];

    @Column({ nullable: true, type: 'varchar' })
    imageUrl?: string;

    @ManyToOne(() => Publisher, { nullable: true, eager: true })
    @JoinColumn({ name: 'publisherId' })
    publisher!: Publisher | null;

    @Column({ nullable: true })
    publisherId!: number | null;

    @ManyToOne(() => Provider, { nullable: true, eager: true })
    @JoinColumn({ name: 'providerId' })
    distributor!: Provider | null;

    @Column({ nullable: true })
    providerId!: number | null;
}

@Entity()
export class Uncatalogued {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    isbn!: string;

    @Column({ type: 'int' })
    stock!: number;
}