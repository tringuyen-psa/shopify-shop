import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformSettingDto {
  @ApiProperty({ description: 'Setting key', example: 'default_platform_fee' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Setting value', example: '15' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Setting description', example: 'Default platform fee percentage' })
  @IsString()
  description: string;
}