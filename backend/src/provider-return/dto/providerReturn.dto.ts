import { IsInt, IsPositive, IsArray, IsString, MinLength, ValidateNested, ArrayNotEmpty, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateProviderReturnDTO {
    @IsOptional()
    @IsString()
    reference?: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ProviderReturnItemDTO)
    items!: ProviderReturnItemDTO[];
}

export class ProviderReturnItemDTO {
    @IsString()
    @MinLength(1)
    isbn!: string;

    @IsInt()
    @IsPositive()
    quantity!: number;
}

export class UpdateProviderReturnDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ProviderReturnItemDTO)
    items!: ProviderReturnItemDTO[];
}

export class ProviderSummaryDTO {
    id!: number;
    name!: string;
}

export class PublisherSummaryDTO {
    id!: number;
    publisherName!: string;
}

export class ProviderReturnResponseDTO {
    id!: number;
    reference!: string | null;
    providerId!: number | null;
    provider!: ProviderSummaryDTO | null;
    publisherId!: number;
    publisher!: PublisherSummaryDTO;
    items!: ProviderReturnItemDTO[];
    status!: 'pending' | 'sent' | 'completed' | 'cancelled';
    createdAt!: Date;
    updatedAt!: Date;
}