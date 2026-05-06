import { IsNumber, IsPositive, Min, IsOptional } from "class-validator";

export class CreateBookDTO {
    title: string;
    author: string;
    description: string;
    isbn: string;
    @IsNumber()
    @IsPositive({ message: 'price must be a positive number' })
    price: number;

    @IsNumber()
    @Min(0, { message: 'stock cannot be negative '})
    stock: number;
    format: string;
}

export class UpdateBookDTO {
    @IsOptional()
    title?: string;
    
    @IsOptional()
    author?: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    isbn?: string;
    
    @IsOptional()
    @IsNumber()
    @IsPositive({ message: 'price must be a positive number' })
    price?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'stock cannot be negative '})
    stock?: number;
    format?: string;
}