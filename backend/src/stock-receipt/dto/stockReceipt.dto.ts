import { IsNumber, IsArray, IsString, IsPositive, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class StockReceiptDTO {
    @IsString()
    isbn: string;

    @IsNumber()
    @IsPositive()
    stock: number;
}

export class StockReceiptArrayDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockReceiptDTO)
    items: StockReceiptDTO[];
}
