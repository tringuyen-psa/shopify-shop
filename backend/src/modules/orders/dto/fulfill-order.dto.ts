import { IsString, IsOptional } from 'class-validator';

export class FulfillOrderDto {
  @IsOptional()
  @IsString()
  internalNote?: string;
}