import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Payment Intent ID to refund', example: 'pi_1234567890' })
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({ description: 'Refund amount (in currency units)', example: 29.99 })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Refund reason',
    enum: RefundReason,
    example: RefundReason.REQUESTED_BY_CUSTOMER,
  })
  @IsEnum(RefundReason)
  @IsOptional()
  reason?: RefundReason;
}