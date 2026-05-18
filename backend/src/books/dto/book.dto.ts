import {
    IsArray,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    ArrayNotEmpty,
} from "class-validator";

export class CreateBookDTO {
    @IsString()
    title!: string;

    @IsString()
    author!: string;

    @IsString()
    description!: string;

    @IsString()
    isbn!: string;

    @IsNumber()
    @IsPositive({ message: 'price must be a positive number' })
    price!: number;

    @IsNumber()
    @Min(0, { message: 'stock cannot be negative '})
    stock!: number;

    @IsString()
    format!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    genre!: string[];

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    publisher?: string;

    @IsOptional()
    @IsString()
    distributor?: string;
}

export class UpdateBookDTO {
    @IsOptional()
    @IsString()
    title?: string;
    
    @IsOptional()
    @IsString()
    author?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    isbn?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
    
    @IsOptional()
    @IsNumber()
    @IsPositive({ message: 'price must be a positive number' })
    price?: number;
    
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'stock cannot be negative '})
    stock?: number;

    @IsOptional()
    @IsString()
    format?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    genre?: string[];

    @IsOptional()
    @IsString()
    publisher?: string;

    @IsOptional()
    @IsString()
    distributor?: string;
}