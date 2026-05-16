import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Provider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column('text', { array: true, default: [] })
    publishers: string[];

    @OneToMany(() => ProviderReturn, (ret) => ret.provider)
    returns: ProviderReturn[];
}

@Entity()
export class ProviderReturn {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Provider, { eager: true, nullable: true })
    @JoinColumn({ name: 'providerId' })
    provider: Provider | null;

    @Column({ nullable: true })
    providerId: number | null;

    @Column()
    publisher: string;

    @Column('jsonb', { default: [] })
    items: { isbn: string; quantity: number }[];

    @Column({ default: 'pending' })
    status: 'pending' | 'completed' | 'cancelled';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
