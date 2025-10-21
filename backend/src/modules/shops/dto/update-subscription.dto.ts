import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription plan',
    enum: ['basic', 'shopify', 'advanced', 'shopify_plus'],
  })
  @IsEnum(['basic', 'shopify', 'advanced', 'shopify_plus'])
  plan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus';

  @ApiProperty({
    description: 'Subscription price',
    example: 105,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Billing period',
    example: 'monthly',
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Stripe subscription ID (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;
}