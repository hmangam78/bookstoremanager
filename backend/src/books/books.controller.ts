import { Controller, Get, Post, Body, Delete, Param, Patch, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('books')
export class BooksController {

    constructor(private bookService: BooksService) {}

    @Get('paginated')
    getBooksPaginated(
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 20,
        @Query('query') query?: string,
    ) {
        return this.bookService.getBooksPaginated(page, limit, query);
    }

    @Get('by-title-author-tag-isbn')
    getManyByTitleAuthorTagISBN(@Query('query') title: string) {
        return this.bookService.getManyByTitleAuthorTagISBN(title);
    }
    
    @Get('by-genre')
    getManyByGenre(@Query('query') genre: string) {
        return this.bookService.getManyByGenre(genre);
    }

    @Get('isbn/:isbn')
    getOneByISBN(@Param('isbn') isbn: string) {
        const cleanedIsbn = isbn.replace(/-/g, '');
        return this.bookService.getBookByISBN(cleanedIsbn);
    }
    
    @Get('by-publisher')
    getAllByPublisher(@Query('publisherId', ParseIntPipe) publisherId: number) {
        return this.bookService.getAllByPublisher(publisherId);
    }

    @Get('by-distributor')
    getAllByDistributor(@Query('providerId', ParseIntPipe) providerId: number) {
        return this.bookService.getAllByDistributor(providerId);
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
