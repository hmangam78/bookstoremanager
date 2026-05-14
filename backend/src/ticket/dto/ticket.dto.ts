import { IsNumber, IsArray, IsPositive, ValidateNested } from 'class-validator';
import { Type } from "class-transformer";

export class NewTicketDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TicketItemDTO)
    items: TicketItemDTO[];

    @IsNumber()
    @IsPositive()
    totalAmount: number;
}

export class TicketItemDTO {
    @IsNumber()
    @IsPositive()
    bookId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    unitPrice: number;

    @IsNumber()
    @IsPositive()
    saleId: number;
}
