import { Injectable } from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { SalesService } from 'src/sales/sales.service';

export interface BasketItem {
    bookId: number;
    isbn: string;
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

@Injectable()
export class BasketService {
    private basket: BasketItem[] = [];

    constructor(
        private readonly booksService: BooksService,
        private readonly salesService: SalesService,
    ) {}

    getBasket() {
        return this.basket;
    }

    async addBookToBasket(bookId: number, quantity: number) {
        const book = await this.booksService.getBookById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        if (book.stock < quantity) {
            throw new Error('Not enough units');
        }

        const basketItem = {
            bookId,
            isbn: book.isbn,
            title: book.title,
            quantity,
            unitPrice: book.price,
            totalPrice: book.price * quantity,
        }

        this.basket.push(basketItem);
    }

    clearBasket() {
        this.basket.length = 0;
        return this.basket;
    }

    removeItemFromBasket(bookId: number) {
        const initialLength = this.basket.length;
        this.basket = this.basket.filter((item) => item.bookId !== bookId);
        
        if (this.basket.length === initialLength){
            throw new Error('Item not found in basket');
        }
        
        return this.basket;
    }

    async setQuantity(bookId: number, newQuantity: number) {
        if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
            throw new Error('Invalid quantity');
        }

        const book = await this.booksService.getBookById(bookId);
        if (!book) throw new Error('Book not found');
        if (book.stock < newQuantity) throw new Error('Not enough units');

        const item = this.basket.find((i) => i.bookId === bookId);
        if (!item) {
            throw new Error('Book not in basket');
        }

        item.quantity = newQuantity;
        item.totalPrice = item.unitPrice * newQuantity;

        return item;
    }

    async checkoutBasket() {
        if (!this.basket.length) throw new Error('Basket is empty');

        const items = this.basket.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        }));

        const sales = await this.salesService.createBulkSale(items);

        this.basket.length = 0;
        return sales;
    }
}
