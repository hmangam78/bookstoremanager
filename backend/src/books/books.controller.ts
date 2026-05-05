import { Controller, Get, Post, Body, Delete, Param, Patch, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';

@Controller('books')
export class BooksController {

    constructor(private bookService: BooksService) {}

    @Get('by-isbn')
    getOneByISBN(@Query('isbn') isbn: string) {
        return this.bookService.getBookByISBN(isbn);
    }
    
    @Get(':id')
    getOneById(@Param('id') id: string) {
        return this.bookService.getBookById(id);
    }
    
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

    @Patch(':id')
    updateBookData(@Param('id') id: string, @Body() updatedData: UpdateBookDTO) {
        return this.bookService.updateBookData(id, updatedData);
    }
}
