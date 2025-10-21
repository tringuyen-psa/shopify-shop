import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Customer email' })
  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Billing cycle',
    enum: ['weekly', 'monthly', 'yearly']
  })
  @IsEnum(['weekly', 'monthly', 'yearly'])
  @IsOptional()
  billingCycle?: string;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Shipping address line 1' })
  @IsString()
  @IsOptional()
  shippingAddressLine1?: string;

  @ApiPropertyOptional({ description: 'Shipping address line 2' })
  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @ApiPropertyOptional({ description: 'Shipping city' })
  @IsString()
  @IsOptional()
  shippingCity?: string;

  @ApiPropertyOptional({ description: 'Shipping state' })
  @IsString()
  @IsOptional()
  shippingState?: string;

  @ApiPropertyOptional({ description: 'Shipping country' })
  @IsString()
  @IsOptional()
  shippingCountry?: string;

  @ApiPropertyOptional({ description: 'Shipping postal code' })
  @IsString()
  @IsOptional()
  shippingPostalCode?: string;

  @ApiPropertyOptional({ description: 'Platform fee' })
  @IsNumber()
  @IsOptional()
  platformFee?: number;

  @ApiPropertyOptional({ description: 'Shop revenue' })
  @IsNumber()
  @IsOptional()
  shopRevenue?: number;

  @ApiPropertyOptional({ description: 'Shipping cost' })
  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'Order ID' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Stripe subscription ID' })
  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @ApiPropertyOptional({ description: 'Stripe customer ID' })
  @IsString()
  @IsOptional()
  stripeCustomerId?: string;

  @ApiPropertyOptional({ description: 'Subscription amount' })
  @IsNumber()
  @IsOptional()
  amount?: number;
}