import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Billing cycle',
    enum: ['weekly', 'monthly', 'yearly']
  })
  @IsEnum(['weekly', 'monthly', 'yearly'])
  @IsOptional()
  billingCycle?: string;

  @ApiPropertyOptional({ description: 'Cancel at period end' })
  @IsOptional()
  cancelAtPeriodEnd?: boolean;

  @ApiPropertyOptional({ description: 'Customer note' })
  @IsString()
  @IsOptional()
  customerNote?: string;
}