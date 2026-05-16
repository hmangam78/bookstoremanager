import { Module } from '@nestjs/common';
import { CustomerOrderService } from './customer-order.service';
import { CustomerOrderController } from './customer-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from './entities/customerorderentity';
import { Book } from '../books/entities/bookEntity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrder, Book])],
  providers: [CustomerOrderService],
  controllers: [CustomerOrderController]
})
export class CustomerOrderModule {}
