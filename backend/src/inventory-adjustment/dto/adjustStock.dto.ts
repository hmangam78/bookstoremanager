import { IsInt, IsString, Min, Max } from "class-validator";

export class AdjustStockDTO {
    @IsString()
    isbn: string;

    @IsInt()
    @Min(-10000)
    @Max(10000)
    quantity: number;
}