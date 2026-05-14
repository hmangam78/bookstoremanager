import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SalesService } from './sales.service'; 
import { CreateSaleDTO } from './dto/create-sales.dto'; 

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) {}

    @Get()
    findAll(@Query('from') from: string, @Query('to') to: string) {
        if (from && to) {
            return this.salesService.findSalesInPeriod(from, to);
        }
        return this.salesService.findAll();
    }

    @Get('book/:id/sales')
    findSalesByBook(@Param('id', ParseIntPipe) id: number, @Query('from') from: string, @Query('to') to: string) {
        return this.salesService.findSalesByBook(id, from, to);
    }

    @Get('book/:id')
    findByBook(@Param('id', ParseIntPipe) id: number) {
        return this.salesService.findByBook(id);
    }

    @Get('today')
    findTodaySales() {
        return this.salesService.findTodaySales();
    }

    @Get(':saleId')
    findSaleBySaleId(@Param('saleId', ParseIntPipe) saleId: number) {
        return this.salesService.findSalesBySaleId(saleId);
    }
}
