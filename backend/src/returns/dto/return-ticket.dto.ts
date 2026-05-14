import { ArrayNotEmpty, IsArray,  IsNumber, IsPositive, IsString } from "class-validator";

export class ReturnTicketDTO {
    @IsString()
    ticketNo: string;

    @IsArray()
    @ArrayNotEmpty()
    items: ReturnItemDTO[];
}

export class ReturnItemDTO {
    @IsNumber()
    @IsPositive()
    ticketItemId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
}