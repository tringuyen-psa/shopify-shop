import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePlanDto {
  @ApiProperty({ description: 'New plan product ID' })
  @IsString()
  @IsNotEmpty()
  newProductId: string;

  @ApiPropertyOptional({ description: 'New billing cycle' })
  @IsString()
  @IsOptional()
  newBillingCycle?: string;

  @ApiPropertyOptional({ description: 'Billing cycle (alias for newBillingCycle)' })
  @IsString()
  @IsOptional()
  billingCycle?: string;

  @ApiPropertyOptional({ description: 'Change reason' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Effective date (ISO string)' })
  @IsString()
  @IsOptional()
  effectiveDate?: string;
}