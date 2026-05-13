import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Book, Uncatalogued } from './entities/bookEntity';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';
import Fuse from 'fuse.js';

@Injectable()
export class BooksService {

    constructor(
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,
        @InjectRepository(Uncatalogued)
        private readonly uncataloguedRepository: Repository<Uncatalogued>,
        private readonly dataSource: DataSource,
    ) {}

    getAllBooks() {
        return this.booksRepository.find();
    }

    async createBook(data: CreateBookDTO) {
        return await this.dataSource.transaction(async manager => {
            // Delete uncatalogued entry if exists
            const uncataloguedItem = await manager.getRepository(Uncatalogued).findOne({ 
                where: { isbn: data.isbn },
                lock: { mode: 'pessimistic_write' },
            });

            if (uncataloguedItem) {
                await manager.delete(Uncatalogued, uncataloguedItem.id);
            }

            const book = manager.getRepository(Book).create(data);
            return manager.save(book);
        });
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

    async getManyByTitleAuthorTagISBN(query: string) {
        const books = await this.getAllBooks();
        const resultMap = new Map<number, any>();

        // Considerar queries ISBN que contienen dígitos y guiones
        const isPossibleIsbn = /^[\d-]+$/.test(query);

        // Si la query parece un ISBN (dígitos y guiones), incluir coincidencias por subcadena
        // Normalizamos quitando guiones para comparar correctamente.
        if (isPossibleIsbn) {
            const normalized = query.replace(/-/g, '');
            const substringMatches = books.filter(book =>
                ((book.isbn || '').replace(/-/g, '')).includes(normalized)
            );
            substringMatches.forEach((b) => resultMap.set(b.id, b));
        }

        // Si la query es numérica, evitar usar el campo `isbn` en la búsqueda fuzzy
        // para que no empareje otros ISBNs por subcadenas numéricas similares.
        const fuzzyKeys = isPossibleIsbn ? ['title', 'author', 'genre'] : ['title', 'author', 'genre', 'isbn'];

        const fuse = new Fuse(books, {
            keys: fuzzyKeys,
            includeScore: true
        });

        const fuzzyResults = fuse.search(query);
        fuzzyResults.forEach(({ item }) => {
            resultMap.set(item.id, item);
        });

        return Array.from(resultMap.values());
    }

    async getManyByGenre(query: string) {
        const books = await this.getAllBooks();

        const fuse = new Fuse(books, {
            keys: ['genre'],
            includeScore: true
        })

        const result = fuse.search(query);
        return result.map(({ item }) => item);
    }

}
