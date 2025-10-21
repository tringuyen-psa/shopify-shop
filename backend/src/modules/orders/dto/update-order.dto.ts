import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  FULFILLED = 'fulfilled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Fulfillment status', enum: FulfillmentStatus })
  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({ description: 'Payment status', enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Carrier' })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery date' })
  @IsString()
  @IsOptional()
  estimatedDelivery?: string;

  @ApiPropertyOptional({ description: 'Customer note' })
  @IsString()
  @IsOptional()
  customerNote?: string;

  @ApiPropertyOptional({ description: 'Internal note' })
  @IsString()
  @IsOptional()
  internalNote?: string;
}