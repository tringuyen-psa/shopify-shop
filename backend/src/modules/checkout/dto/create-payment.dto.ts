import { IsEnum } from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(['stripe_popup', 'paypal', 'stripe_card'])
  paymentMethod: 'stripe_popup' | 'paypal' | 'stripe_card';
}