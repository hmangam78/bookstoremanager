import { IsNumber, IsPositive, Max } from "class-validator";

export class UpdateQuantityDTO{
    @IsNumber()
    @IsPositive({ message: 'newQuantity must be greater than 0' })
    @Max(100, { message: 'newQuantity cannot exceed 100 units' })
    newQuantity: number;
}