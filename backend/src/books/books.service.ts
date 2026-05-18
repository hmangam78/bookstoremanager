import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Book, Uncatalogued } from './entities/bookEntity';
import { CreateBookDTO, UpdateBookDTO } from './dto/book.dto';
import Fuse from 'fuse.js';
import { Provider, Publisher } from 'src/provider-return/entities/providerReturnEntity';

@Injectable()
export class BooksService {

    constructor(
        @InjectRepository(Book)
        private readonly booksRepository: Repository<Book>,
        @InjectRepository(Uncatalogued)
        private readonly uncataloguedRepository: Repository<Uncatalogued>,
        private readonly dataSource: DataSource,
    ) {}

    private normalizeText(value?: string | null) {
        const normalized = value?.trim();
        return normalized ? normalized : null;
    }

    private async ensurePublisher(manager: any, publisherName: string) {
        const normalizedName = this.normalizeText(publisherName);
        if (!normalizedName) {
            return null;
        }

        const repository = manager.getRepository(Publisher);
        let publisher = await repository.findOne({ where: { publisherName: normalizedName } });

        if (!publisher) {
            publisher = repository.create({ publisherName: normalizedName });
            publisher = await repository.save(publisher);
        }

        return publisher;
    }

    private async ensureProvider(manager: any, providerName: string, publisherName?: string | null) {
        const normalizedName = this.normalizeText(providerName);
        if (!normalizedName) {
            return null;
        }

        const repository = manager.getRepository(Provider);
        let provider = await repository.findOne({ where: { name: normalizedName } });

        if (!provider) {
            provider = repository.create({
                name: normalizedName,
                publishers: publisherName ? [publisherName] : [],
            });
            provider = await repository.save(provider);
            return provider;
        }

        if (publisherName && !provider.publishers.includes(publisherName)) {
            provider.publishers = [...provider.publishers, publisherName];
            provider = await repository.save(provider);
        }

        return provider;
    }

    getAllBooks() {
        return this.booksRepository.find();
    }

    async getBooksPaginated(page: number, limit: number, query?: string) {
        if (query) {
            // Use existing fuzzy search for query, then paginate results
            const allResults = await this.getManyByTitleAuthorTagISBN(query);
            const total = allResults.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const data = allResults.slice(start, start + limit);
            return { data, total, page, limit, totalPages };
        }

        const [data, total] = await this.booksRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        const totalPages = Math.ceil(total / limit);
        return { data, total, page, limit, totalPages };
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

            const publisherName = this.normalizeText(data.publisher);
            const providerName = this.normalizeText(data.distributor);

            const publisher = publisherName ? await this.ensurePublisher(manager, publisherName) : null;
            const provider = providerName ? await this.ensureProvider(manager, providerName, publisherName) : null;

            const book = manager.getRepository(Book).create({
                title: data.title,
                author: data.author,
                description: data.description,
                isbn: data.isbn,
                price: data.price,
                stock: data.stock,
                format: data.format,
                genre: data.genre,
                imageUrl: data.imageUrl,
                publisher,
                publisherId: publisher?.id ?? null,
                distributor: provider,
                providerId: provider?.id ?? null,
            });

            return manager.getRepository(Book).save(book);
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

    getAllByPublisher(publisherId: number) {
        return this.booksRepository.find({ where: { publisherId } });
    }

    getAllByDistributor(providerId: number) {
        return this.booksRepository.find({ where: { providerId } });
    }

    async updateBookData(id: number, updatedData: UpdateBookDTO) {
        return await this.dataSource.transaction(async manager => {
            const bookRepository = manager.getRepository(Book);
            const book = await bookRepository.findOne({
                where: { id },
                relations: {
                    publisher: true,
                    distributor: true,
                },
            });

            if (!book) {
                return null;
            }

            if (updatedData.title !== undefined) book.title = updatedData.title;
            if (updatedData.author !== undefined) book.author = updatedData.author;
            if (updatedData.description !== undefined) book.description = updatedData.description;
            if (updatedData.isbn !== undefined) book.isbn = updatedData.isbn;
            if (updatedData.imageUrl !== undefined) book.imageUrl = updatedData.imageUrl;
            if (updatedData.price !== undefined) book.price = updatedData.price;
            if (updatedData.stock !== undefined) book.stock = updatedData.stock;
            if (updatedData.format !== undefined) book.format = updatedData.format;
            if (updatedData.genre !== undefined) book.genre = updatedData.genre;

            if (updatedData.publisher !== undefined) {
                const publisherName = this.normalizeText(updatedData.publisher);
                const publisher = publisherName ? await this.ensurePublisher(manager, publisherName) : null;
                book.publisher = publisher;
                book.publisherId = publisher?.id ?? null;

                if (updatedData.distributor === undefined && book.distributor) {
                    const provider = await this.ensureProvider(manager, book.distributor.name, publisherName);
                    book.distributor = provider;
                    book.providerId = provider?.id ?? null;
                }
            }

            if (updatedData.distributor !== undefined) {
                const providerName = this.normalizeText(updatedData.distributor);
                const currentPublisherName = book.publisher?.publisherName ?? this.normalizeText(updatedData.publisher);
                const provider = providerName ? await this.ensureProvider(manager, providerName, currentPublisherName) : null;
                book.distributor = provider;
                book.providerId = provider?.id ?? null;
            }

            return bookRepository.save(book);
        });
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
