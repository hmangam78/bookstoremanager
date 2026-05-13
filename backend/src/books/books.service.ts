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

        const normalizedQuery = query.toLowerCase();

        // 1. Exact substring matches on title (highest priority)
        const titleSubstringMatches = books.filter(book =>
            book.title.toLowerCase().includes(normalizedQuery)
        );
        titleSubstringMatches.forEach(b => resultMap.set(b.id, b));

        // 2. Consider queries ISBN that contain digits and dashes
        const isPossibleIsbn = /^[\d-]+$/.test(query);

        // If the query seems an ISBN, include matches by substring
        if (isPossibleIsbn) {
            const normalized = query.replace(/-/g, '');
            const isbnSubstringMatches = books.filter(book =>
                ((book.isbn || '').replace(/-/g, '')).includes(normalized)
            );
            isbnSubstringMatches.forEach((b) => resultMap.set(b.id, b));
        }

        // 3. Fuzzy search for everything else not already matched
        const fuzzyKeys = isPossibleIsbn ? ['title', 'author', 'genre'] : ['title', 'author', 'genre', 'isbn'];

        const fuse = new Fuse(books, {
            keys: fuzzyKeys,
            includeScore: true,
            minMatchCharLength: 3,
        });

        const fuzzyResults = fuse.search(query);
        fuzzyResults.forEach(({ item, score }) => {
            if (score !== undefined && score < 0.55) {
                // Doesn't overwrite matches
                if (!resultMap.has(item.id)) {
                    resultMap.set(item.id, item);
                }
            }
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
