import { Controller, Post, Body, ValidationPipe, Get, Param } from '@nestjs/common';
import { StockReceiptService } from './stock-receipt.service';
import { StockReceiptOrderDTO } from './dto/stockReceipt.dto';

@Controller('stock-receipt')
export class StockReceiptController {
    constructor(private stockReceiptService: StockReceiptService) {}

    @Post()
    uploadStock(@Body(new ValidationPipe({ transform: true })) stockReceiptOrder: StockReceiptOrderDTO){
        return this.stockReceiptService.uploadStock(stockReceiptOrder);
    }

    @Get()
    getUncatalogued() {
        return this.stockReceiptService.getUncatalogued();
    }

    @Get('isbn/:isbn')
    getUncataloguedByISBN(@Param('isbn') isbn: string) {
        return this.stockReceiptService.getUncataloguedByISBN(isbn);
    }

}
