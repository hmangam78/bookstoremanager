import { IsOptional, IsString } from "class-validator";

export class CreateCustomerDTO {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;
}

export class UpdateCustomerDTO {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;
}