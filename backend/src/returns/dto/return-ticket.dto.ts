import { ArrayNotEmpty, IsArray, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ReturnTicketDTO {
    @IsString()
    ticketNo: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ReturnItemDTO)
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