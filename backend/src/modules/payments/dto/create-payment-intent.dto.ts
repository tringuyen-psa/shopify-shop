import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Payment amount', example: 29.99 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Stripe customer ID', example: 'cus_123456' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Metadata for the payment intent', example: { orderId: 'order_123' } })
  @IsOptional()
  metadata?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Payment method ID for immediate confirmation' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}