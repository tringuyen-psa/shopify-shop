import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  carrier: string;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;
}