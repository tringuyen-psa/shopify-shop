import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSetupIntentDto {
  @ApiPropertyOptional({ description: 'Stripe customer ID', example: 'cus_123456' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'Payment method types',
    example: ['card'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentMethodTypes?: string[];
}