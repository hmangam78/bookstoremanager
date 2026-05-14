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

export class StockReceiptOrderDTO {
    @IsString()
    orderNo: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StockReceiptDTO)
    items: StockReceiptDTO[];
}
