import { api } from '../lib/api';

export type PublisherSummary = {
    id: number;
    publisherName: string;
};

export type ProviderSummary = {
    id: number;
    name: string;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  genre: string[];
  description: string;
  isbn: string;
  format: string;
  imageUrl?: string;
    publisher?: PublisherSummary | string | null;
    distributor?: ProviderSummary | string | null;
    publisherId?: number | null;
    providerId?: number | null;
};

export type CreateBookInput = {
    title: string;
    author: string;
    description: string;
    isbn: string;
    price: number;
    stock: number;
    format: string;
    genre: string[];
    imageUrl?: string;
    publisher?: string;
    distributor?: string;
};

export type UpdateBookInput = Partial<CreateBookInput>;

export type PaginatedBooks = {
  data: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function getBooks(query?: string) {
    if (query) {
        return api.get<Book[]>("/books/by-title-author-tag-isbn", {
            params: { query },
        });
    }
    return api.get<Book[]>("/books");
}

export function getBooksPaginated(page: number, limit: number = 20, query?: string) {
  return api.get<PaginatedBooks>("/books/paginated", {
    params: { page, limit, ...(query ? { query } : {}) },
  });
}

export function getBookById(id: number) {
    return api.get<Book>(`/books/${id}`);
}

export function getBooksByPublisher(publisherId: number) {
    return api.get<Book[]>("/books/by-publisher", {
        params: { publisherId },
    });
}

export function getBooksByDistributor(providerId: number) {
    return api.get<Book[]>("/books/by-distributor", {
        params: { providerId },
    });
}

export function createBook(book: CreateBookInput) {
    return api.post<Book>("/books", book);
}

export function updateBook(id: number, updates: UpdateBookInput) {
    return api.patch<Book>(`/books/${id}`, updates);
}

export function deleteBook(id: number) {
    return api.delete(`/books/${id}`);
}