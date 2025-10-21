import { IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(['stripe'])
  paymentMethod: 'stripe';
}