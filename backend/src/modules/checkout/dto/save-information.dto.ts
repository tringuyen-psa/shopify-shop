import {
  IsEmail,
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsString()
  @MinLength(5)
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  state: string;

  @IsString()
  @MinLength(2)
  country: string;

  @IsString()
  @MinLength(3)
  postalCode: string;
}

export class SaveInformationDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  note?: string;
}