import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/bookEntity';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';
import Fuse from 'fuse.js';

@Injectable()
export class BooksService {

    constructor(
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,
    ) {}

    getAllBooks() {
        return this.booksRepository.find();
    }

    createBook(data: CreateBookDTO) {
        return this.booksRepository.save(data);
    }

    deleteBook(id: number) {
        return this.booksRepository.delete(id);
    }

    getBookById(id: number) {
        return this.booksRepository.findOneBy({ id });
    }

    getBookByISBN(isbn: string) {
        return this.booksRepository.findOneBy({ isbn });
    }

    async updateBookData(id: number, updatedData: UpdateBookDTO) {
        await this.booksRepository.update(id, updatedData);
        return this.booksRepository.findOneBy({ id });
    }

    async getManyByTitleOrAuthor(query: string) {
        const books = await this.getAllBooks();

        const fuse = new Fuse(books, {
            keys: ['title', 'author'],
            includeScore: true
        })

        const result = fuse.search(query);
        return result;
    }

    async getManyByGenre(query: string) {
        const books = await this.getAllBooks();

        const fuse = new Fuse(books, {
            keys: ['genre'],
            includeScore: true
        })

        const result = fuse.search(query);
        return result;
    }

}
