import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlatformSettingDto {
  @ApiPropertyOptional({ description: 'Setting value', example: '20' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ description: 'Setting description', example: 'Updated platform fee percentage' })
  @IsString()
  @IsOptional()
  description?: string;
}