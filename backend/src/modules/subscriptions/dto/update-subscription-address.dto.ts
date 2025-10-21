import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiPropertyOptional({ description: 'Shipping address line 1' })
  @IsString()
  @IsOptional()
  line1?: string;

  @ApiPropertyOptional({ description: 'Shipping address line 2' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiPropertyOptional({ description: 'Shipping city' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Shipping state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Shipping country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Shipping postal code' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class UpdateSubscriptionAddressDto {
  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  shippingAddress?: AddressDto;
}