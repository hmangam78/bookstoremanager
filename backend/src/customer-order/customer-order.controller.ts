import { Controller, Get, Body, Post, ParseIntPipe, Query, Delete, Param } from '@nestjs/common';
import { CustomerOrderService } from './customer-order.service';
import { CustomerOrderDTO } from './dto/customerOrder.dto';

@Controller('customer-order')
export class CustomerOrderController {
    constructor(
        private readonly customerOrderService: CustomerOrderService,
    ) {}

    @Get()
    getAllOrders() {
        return this.customerOrderService.getAll();
    }

    @Get('by-customerId')
    getOrdersByCustomerId(@Query('customerId', ParseIntPipe) customerId: number) {
        return this.customerOrderService.getAllByCustomer(customerId);
    }

    @Post()
    createOrder(@Body() data: CustomerOrderDTO[]) {
        return this.customerOrderService.createOrderBatch(data);
    }

    @Delete(':orderId')
    deleteOrder(@Param('orderId', ParseIntPipe) orderId: number) {
        return this.customerOrderService.deleteOrder(orderId);
    }
}
