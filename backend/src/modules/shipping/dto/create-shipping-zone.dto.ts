import { IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingZoneDto {
  @ApiProperty({ description: 'Zone name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'List of country codes' })
  @IsArray()
  @IsString({ each: true })
  countries: string[];

  @ApiPropertyOptional({ description: 'Zone is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}