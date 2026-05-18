import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerOrder } from './entities/customerorderentity';
import { Repository } from 'typeorm';
import { CustomerOrderDTO } from './dto/customerOrder.dto';
import { Book } from '../books/entities/bookEntity';

@Injectable()
export class CustomerOrderService {
    constructor(
        @InjectRepository(CustomerOrder)
        private readonly orderRepository: Repository<CustomerOrder>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) {}

    async getAll() {
        const orders = await this.orderRepository.find({
            relations: ['customer'],
        });

        // Enrich each order with book title and stock
        return Promise.all(
            orders.map(async (order) => {
                const book = await this.bookRepository
                    .createQueryBuilder('book')
                    .select(['book.id', 'book.title', 'book.stock', 'book.isbn'])
                    .where('book.isbn = :isbn', { isbn: order.isbn })
                    .getOne();
                return {
                    ...order,
                    bookTitle: book?.title || null,
                    bookStock: book?.stock ?? null,
                };
            }),
        );
    }

    getAllByCustomer(customerId: number) {
        return this.orderRepository.find({ where: { customerId  } });
    }

    async createOrderBatch(orderBatchData: CustomerOrderDTO[]) {
        const orders = this.orderRepository.create(orderBatchData);
        return this.orderRepository.save(orders);
    }

    async deleteOrder(orderId: number) {
        return this.orderRepository.delete(orderId);
    }
}
