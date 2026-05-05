export class CreateBookDTO {
    title: string;
    author: string;
    description: string;
    isbn: string;
    price: number;
    stock: number;
    format: string;
}

export class UpdateBookDTO {
    title?: string;
    author?: string;
    description?: string;
    isbn?: string;
    price?: number;
    stock?: number;
    format?: string;
}