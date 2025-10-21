import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Cancellation type',
    enum: ['immediate', 'at_period_end'],
    default: 'at_period_end'
  })
  @IsEnum(['immediate', 'at_period_end'])
  @IsOptional()
  type?: string = 'at_period_end';

  @ApiPropertyOptional({ description: 'Immediate cancellation', default: false })
  @IsOptional()
  immediate?: boolean;

  @ApiPropertyOptional({ description: 'Customer feedback' })
  @IsString()
  @IsOptional()
  feedback?: string;
}