import { Controller, Get, Post, Body, Delete, Param, Patch, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('books')
export class BooksController {

    constructor(private bookService: BooksService) {}

    @Get('by-title-author')
    getManyByTitleOrAuthor(@Query('query') title: string) {
        return this.bookService.getManyByTitleOrAuthor(title);
    }

    @Get('by-isbn')
    getOneByISBN(@Query('isbn') isbn: string) {
        return this.bookService.getBookByISBN(isbn);
    }
    
    @Get(':id')
    getOneById(@Param('id', ParseIntPipe) id: number) {
        return this.bookService.getBookById(id);
    }
    
    @Get()
    getAllBooks() {
        return this.bookService.getAllBooks();
    }

    @Post()
    createBook(@Body() newBook: CreateBookDTO) {
        return this.bookService.createBook(newBook);
    }

    @Delete(':id')
    deleteBook(@Param('id', ParseIntPipe) id: number) {
        return this.bookService.deleteBook(id);
    }

    @Patch(':id')
    updateBookData(@Param('id', ParseIntPipe) id: number, @Body() updatedData: UpdateBookDTO) {
        return this.bookService.updateBookData(id, updatedData);
    }
}
