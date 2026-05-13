import { Controller, Post, Body, ValidationPipe, Get } from '@nestjs/common';
import { StockReceiptService } from './stock-receipt.service';
import { StockReceiptArrayDTO } from './dto/stockReceipt.dto';

@Controller('stock-receipt')
export class StockReceiptController {
    constructor(private stockReceiptService: StockReceiptService) {}

    @Post()
    uploadStock(@Body(new ValidationPipe({ transform: true })) stockReceiptArray: StockReceiptArrayDTO){
        return this.stockReceiptService.uploadStock(stockReceiptArray);
    }

    @Get()
    getUncatalogued() {
        return this.stockReceiptService.getUncatalogued();
    }
}
