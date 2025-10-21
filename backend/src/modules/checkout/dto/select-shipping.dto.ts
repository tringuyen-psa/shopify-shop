import { IsString } from 'class-validator';

export class SelectShippingDto {
  @IsString()
  shippingRateId: string;
}