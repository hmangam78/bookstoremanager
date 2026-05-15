import { IsNumber, IsPositive, Max } from "class-validator";

export class CreateSaleDTO {
    @IsNumber()
    @IsPositive({ message: 'bookId must be a positive number' })
    bookId: number;

    @IsNumber()
    quantity: number;

    @IsNumber()
    @IsPositive({ message: 'unitPrice must be greater than 0' })
    unitPrice: number;
}