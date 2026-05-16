import { Controller, Get, Post, Patch, Body, Query, ParseIntPipe, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';

@Controller('customer')
export class CustomerController {
    constructor(
        private readonly customerService: CustomerService
    ) {}

    @Get()
    getAll() {
        return this.customerService.getAllCustomers();
    }

    @Post()
    create(@Body() data: CreateCustomerDTO) {
        return this.customerService.createCustomer(data);
    }

    @Get('by-phone')
    getByPhone(@Query('phone') phone: string) {
        return this.customerService.getCustomerByPhone(phone);
    }

    @Get('by-email')
    getByEmail(@Query('email') email: string) {
        return this.customerService.getCustomerByEmail(email);
    }

    @Get('by-name')
    getByName(@Query('name') name: string) {
        return this.customerService.getCustomerByName(name);
    }

    @Patch('/:id')
    updateCustomer(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCustomerDTO) {
        return this.customerService.updateCustomer(id, data);
    }
}
