import { api } from '../lib/api';

export function getBooks() {
    return api.get("/books");
}