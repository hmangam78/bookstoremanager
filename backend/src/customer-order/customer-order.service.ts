import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerOrder } from './entities/customerorderentity';
import { Repository } from 'typeorm';
import { CustomerOrderDTO } from './dto/customerOrder.dto';

@Injectable()
export class CustomerOrderService {
    constructor(
        @InjectRepository(CustomerOrder)
        private readonly orderRepository: Repository<CustomerOrder>,
    ) {}

    getAll() {
        return this.orderRepository.find();
    }

    getAllByCustomer(customerId: number) {
        return this.orderRepository.find({ where: { customerId  } });
    }

    async createOrderBatch(orderBatchData: CustomerOrderDTO[]) {
        const orders = this.orderRepository.create(orderBatchData);
        return this.orderRepository.save(orders);
    }
}
