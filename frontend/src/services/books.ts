import { api } from '../lib/api';

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
};

export type CreateBookInput = Omit<Book, 'id'>;
export type UpdateBookInput = Partial<Omit<Book, 'id'>>;

export function getBooks(query?: string) {
    if (query) {
        return api.get<Book[]>("/books/by-title-author-tag-isbn", {
            params: { query },
        });
    }
    return api.get<Book[]>("/books");
}

export function getBookById(id: number) {
    return api.get<Book>(`/books/${id}`);
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