import { IsString, IsNotEmpty } from 'class-validator';

export class CheckKycDto {
  @IsString()
  @IsNotEmpty()
  stripeAccountId: string;
}