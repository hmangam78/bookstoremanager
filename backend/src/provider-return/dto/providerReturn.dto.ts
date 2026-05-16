import { IsInt, IsPositive, IsArray, IsString, MinLength, ValidateNested, ArrayNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class CreateProviderReturnDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ProviderReturnItemDTO)
    items: ProviderReturnItemDTO[];
}

export class ProviderReturnItemDTO {
    @IsString()
    @MinLength(1)
    isbn: string;

    @IsInt()
    @IsPositive()
    quantity: number;
}