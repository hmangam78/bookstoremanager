import { Controller, Get, Post, Delete, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BasketService } from './basket.service';
import { AddToBasketDto } from './dto/add-to-basket.dto';
import { UpdateQuantityDTO } from './dto/update-quantity.dto';

@Controller('basket')
export class BasketController {
    constructor(private basketService: BasketService) {}

    @Get()
    getBasket() {
        return this.basketService.getBasket();
    }

    @Post()
    addItemToBasket(@Body() dto: AddToBasketDto){
        return this.basketService.addBookToBasket(dto.bookId, dto.quantity);
    }

    @Delete()
    clearBasket(){
        return this.basketService.clearBasket();
    }

    @Delete(':bookId')
    removeItemFromBasket(@Param('bookId', ParseIntPipe) bookId: number) {
        return this.basketService.removeItemFromBasket(bookId);
    }

    @Patch(':bookId')
    updateItemQuantity(@Param('bookId', ParseIntPipe) bookId: number, @Body() dto: UpdateQuantityDTO) {
        return this.basketService.setQuantity(bookId, dto.newQuantity);
    }

    @Post('checkout')
    checkout() {
        return this.basketService.checkoutBasket();
    }
}
