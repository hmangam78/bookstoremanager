import { IsNumber, IsPositive, IsString } from "class-validator";

export class CustomerOrderDTO {
    @IsString()
    isbn: string;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    customerId: number;
}
