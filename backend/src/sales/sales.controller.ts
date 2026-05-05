import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SalesService } from './sales.service'; 
import { CreateSaleDTO } from './dto/create-sales.dto'; 

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) {}

    @Get()
    findAll() {
        return this.salesService.findAll();
    }

    @Get('book/:id')
    findByBook(@Param('id', ParseIntPipe) id: number) {
        return this.salesService.findByBook(id);
    }

    @Post()
    create(@Body() dto: CreateSaleDTO) {
        return this.salesService.createSale(dto);
    }
}