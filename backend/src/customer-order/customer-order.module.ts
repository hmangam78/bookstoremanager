import { Module } from '@nestjs/common';
import { CustomerOrderService } from './customer-order.service';
import { CustomerOrderController } from './customer-order.controller';

@Module({
  providers: [CustomerOrderService],
  controllers: [CustomerOrderController]
})
export class CustomerOrderModule {}
