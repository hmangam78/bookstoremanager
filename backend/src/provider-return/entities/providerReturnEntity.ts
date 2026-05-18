import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Provider {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column('text', { array: true, default: [] })
    publishers!: string[];

    @OneToMany(() => ProviderReturn, (ret) => ret.provider)
    returns!: ProviderReturn[];
}

@Entity()
export class Publisher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    publisherName!: string;
}

@Entity()
export class ProviderReturn {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Provider, { eager: true, nullable: true })
    @JoinColumn({ name: 'providerId' })
    provider!: Provider | null;

    @Column({ nullable: true })
    providerId!: number | null;

    @ManyToOne(() => Publisher, { eager: true })
    @JoinColumn({ name: 'publisherId' })
    publisher!: Publisher;

    @Column({ nullable: true })
    publisherId!: number | null;

    @Column('jsonb', { default: [] })
    items!: { isbn: string; quantity: number }[];

    @Column({ default: 'pending' })
    status!: 'pending' | 'sent' | 'completed' | 'cancelled';

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
