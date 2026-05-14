import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BooksService } from 'src/books/books.service';
import { SalesService } from 'src/sales/sales.service';
import { Sale } from 'src/sales/entities/sale.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { NewTicketDTO } from 'src/ticket/dto/ticket.dto';
import { Ticket } from 'src/ticket/entities/ticket.entity';

export interface BasketItem {
    bookId: number;
    isbn: string;
    title: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CheckoutResult {
    sales: Sale[];
    totalAmount: number;
    ticket: Ticket;
}

@Injectable()
export class BasketService {
    private basket: BasketItem[] = [];

    constructor(
        private readonly booksService: BooksService,
        private readonly salesService: SalesService,
        private readonly ticketService: TicketService
    ) {}

    getBasket() {
        return this.basket;
    }

    async addBookToBasket(bookId: number, quantity: number) {
        const book = await this.booksService.getBookById(bookId);
        if (!book) {
            throw new NotFoundException('Book not found');
        }

        if (book.stock < quantity) {
            throw new BadRequestException('Not enough units');
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
            throw new NotFoundException('Item not found in basket');
        }
        
        return this.basket;
    }

    async setQuantity(bookId: number, newQuantity: number) {
        if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
            throw new BadRequestException('Invalid quantity');
        }

        const book = await this.booksService.getBookById(bookId);
        if (!book) throw new NotFoundException('Book not found');
        if (book.stock < newQuantity) throw new BadRequestException('Not enough units');

        const item = this.basket.find((i) => i.bookId === bookId);
        if (!item) {
            throw new NotFoundException('Book not in basket');
        }

        item.quantity = newQuantity;
        item.totalPrice = item.unitPrice * newQuantity;

        return item;
    }

    async checkoutBasket(): Promise<CheckoutResult> {
        if (!this.basket.length) throw new BadRequestException('Basket is empty');

        const items = this.basket.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        }));

        const totalAmount = this.basket.reduce((sum, item) => sum + item.totalPrice, 0);

        const sales = await this.salesService.createBulkSale(items);

        const ticketData: NewTicketDTO = {
            totalAmount,
            ticketNo: 'pending',
            items: sales.map(sale => ({
                bookId: sale.book.id,
                quantity: sale.quantity,
                unitPrice: Number(sale.unitPrice),
                saleId: sale.id,
                total: Number(sale.unitPrice) * sale.quantity,
            })),
        };

        const ticket = await this.ticketService.createTicket(ticketData);

        this.basket.length = 0;
        return { sales, totalAmount, ticket };
    }
}
