import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  MinLength
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: false }) // Allow URLs without protocol
  logo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string; // Simple string validation - no URL requirement
}