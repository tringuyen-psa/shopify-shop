import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Pricing
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  // Subscription pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  weeklyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearlyPrice?: number;

  // Product type
  @IsEnum(['physical', 'digital'])
  productType: 'physical' | 'digital';

  // Physical product fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  // Digital product fields
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  downloadLimit?: number;

  // Inventory
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inventoryQuantity?: number;

  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;

  // Media
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // Categorization
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Subscription settings
  @IsOptional()
  @IsBoolean()
  isSubscription?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;

  // Features
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}