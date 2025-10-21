import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Checkout session ID' })
  @IsString()
  @IsNotEmpty()
  checkoutSessionId: string;

  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  @IsNotEmpty()
  shopId: string;

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

  @ApiProperty({ description: 'Shipping address line 1' })
  @IsString()
  @IsNotEmpty()
  shippingAddressLine1: string;

  @ApiPropertyOptional({ description: 'Shipping address line 2' })
  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @ApiProperty({ description: 'Shipping city' })
  @IsString()
  @IsNotEmpty()
  shippingCity: string;

  @ApiProperty({ description: 'Shipping state' })
  @IsString()
  @IsNotEmpty()
  shippingState: string;

  @ApiProperty({ description: 'Shipping country' })
  @IsString()
  @IsNotEmpty()
  shippingCountry: string;

  @ApiProperty({ description: 'Shipping postal code' })
  @IsString()
  @IsNotEmpty()
  shippingPostalCode: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({ description: 'Platform fee percentage' })
  @IsNumber()
  @IsNotEmpty()
  platformFeePercent: number;

  @ApiPropertyOptional({ description: 'Shipping cost' })
  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'Billing cycle' })
  @IsString()
  @IsOptional()
  billingCycle?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment intent ID' })
  @IsString()
  @IsOptional()
  paymentIntentId?: string;

  @ApiPropertyOptional({ description: 'Payment status' })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Fulfillment status' })
  @IsString()
  @IsOptional()
  fulfillmentStatus?: string;

  @ApiPropertyOptional({ description: 'Customer note' })
  @IsString()
  @IsOptional()
  customerNote?: string;

  @ApiPropertyOptional({ description: 'Paid at date' })
  @IsString()
  @IsOptional()
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Order items' })
  @IsArray()
  @IsOptional()
  items?: {
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
}