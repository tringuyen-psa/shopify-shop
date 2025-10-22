import { IsString, IsOptional, IsEnum, IsDateString, IsEmail, IsBoolean, ValidateNested, IsArray, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycVerificationType, KycBusinessType } from '../entities/kyc-verification.entity';
import { KycDocumentType } from '../entities/kyc-document.entity';

export class AddressDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  line1?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;
}

export class PersonalInfoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idNumber?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}

export class BusinessInfoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  businessEstablishedDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  businessDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mcc?: string; // Merchant Category Code

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  businessAddress?: AddressDto;
}

export class BankInfoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  routingNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @ApiPropertyOptional()
  @IsEnum(['checking', 'savings'])
  @IsOptional()
  accountType?: 'checking' | 'savings';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankName?: string;
}

export class DocumentUploadDto {
  @ApiProperty({ enum: KycDocumentType })
  @IsEnum(KycDocumentType)
  documentType: KycDocumentType;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimaryDocument?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  base64Data?: string;
}

export class CreateKycVerificationDto {
  @ApiProperty({ enum: KycVerificationType })
  @IsEnum(KycVerificationType)
  verificationType: KycVerificationType;

  @ApiProperty({ enum: KycBusinessType })
  @IsEnum(KycBusinessType)
  businessType: KycBusinessType;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  @IsOptional()
  personalInfo?: PersonalInfoDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  @IsOptional()
  businessInfo?: BusinessInfoDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  @IsOptional()
  bankInfo?: BankInfoDto;

  @ApiPropertyOptional({ type: [DocumentUploadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentUploadDto)
  @IsOptional()
  documents?: DocumentUploadDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripeAccountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  refreshUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  skipOnboarding?: boolean;
}

export class UpdateKycVerificationDto {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  @IsOptional()
  personalInfo?: PersonalInfoDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  @IsOptional()
  businessInfo?: BusinessInfoDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  @IsOptional()
  bankInfo?: BankInfoDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  additionalInformation?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  submitForReview?: boolean;
}

export class UploadKycDocumentDto {
  @ApiProperty({ enum: KycDocumentType })
  @IsEnum(KycDocumentType)
  documentType: KycDocumentType;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimaryDocument?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  base64Data?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class KycVerificationQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  verificationType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}