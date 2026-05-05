import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Book } from 'src/books/entities/bookEntity';

@Module({
    imports: [TypeOrmModule.forFeature([Sale, Book])],
    providers: [SalesService],
    controllers: [SalesController],
})
export class SalesModule {}
