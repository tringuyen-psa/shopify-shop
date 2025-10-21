import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundRequestDto {
  @ApiProperty({ description: 'Refund reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsString()
  @IsOptional()
  description?: string;
}