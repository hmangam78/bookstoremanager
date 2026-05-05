import { Injectable } from '@nestjs/common';
import { CreateBookDTO } from './dto/book.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class BooksService {
    private books = [
        {
            id: '1',
            title: 'El capitán Alatriste',
            author: 'Arturo Pérez-Reverte',
            isbn: '91629318629',
            price: 9.95,
            stock: 1,
            description: 'Las aventuras del Capitán Alatriste.',
            format: 'bolsillo'
        }
    ];

    getAllBooks() {
        return this.books;
    }

    createBook(data: CreateBookDTO) {
        const newBook = {
            id: randomUUID(),
            ...data
        }
        this.books.push(newBook);
        return newBook;
    }

    deleteBook(id: string) {
        this.books = this.books.filter((book) => book.id !== id);
    }
}
