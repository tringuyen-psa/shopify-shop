import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  productId: string;

  @IsEnum(['one_time', 'weekly', 'monthly', 'yearly'])
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}