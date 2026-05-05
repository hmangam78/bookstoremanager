import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO } from './dto/book.dto';

@Controller('books')
export class BooksController {
    constructor(private bookService: BooksService) {}

    @Get()
    getAllBooks() {
        return this.bookService.getAllBooks();
    }

    @Post()
    createBook(@Body() newBook: CreateBookDTO){
        return this.bookService.createBook(newBook);
    }

    @Delete(':id')
    deleteBook(@Param('id') id: string){
        return this.bookService.deleteBook(id);
    }
}
