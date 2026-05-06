import { IsNumber, IsPositive, Max } from "class-validator";

export class CreateSaleDTO {
    @IsNumber()
    @IsPositive({ message: 'bookId must be a positive number' })
    bookId: number;

    @IsNumber()
    @IsPositive({ message: 'quantity must be greater than 0'})
    @Max(100, { message: 'quantity cannot exceed 100 units' })
    quantity: number;

    @IsNumber()
    @IsPositive({ message: 'unitPrice must be greater than 0' })
    unitPrice: number;
}