import { IsNumber, IsPositive, Min, Max } from "class-validator"; 

export class AddToBasketDto {
    @IsNumber()
    @IsPositive({ message: 'bookId must be a positive number' })
    bookId: number;

    @IsNumber()
    @IsPositive({ message: 'quantity must be greater than 0' })
    @Max(100, { message: 'quantity cannot exceed 100 units' })
    quantity: number;
}