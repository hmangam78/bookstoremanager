import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customerEntity';
import { CreateCustomerDTO, UpdateCustomerDTO } from './dto/customer.dto';

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) {}

    getAllCustomers() {
        return this.customerRepository.find();
    }

    getCustomerByPhone(phone: string) {
        return this.customerRepository.findOneBy({ phone });
    }

    getCustomerByEmail(email: string) {
        return this.customerRepository.findOneBy({ email });
    }

    getCustomerByName(name: string) {
        return this.customerRepository.findOneBy({ name });
    }

    async createCustomer(data: CreateCustomerDTO) {
        const customer = this.customerRepository.create({
            ...data,
        });
        return this.customerRepository.save(customer);
    }

    async updateCustomer(id: number, data: UpdateCustomerDTO) {
        await this.customerRepository.update(id, data);
        return this.customerRepository.findOneBy({ id });
    }
}
