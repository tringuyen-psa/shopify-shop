import { KycVerificationType, KycBusinessType } from '../entities/kyc-verification.entity';
import { KycDocumentType } from '../entities/kyc-document.entity';
export declare class AddressDto {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
export declare class PersonalInfoDto {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    idNumber?: string;
    email?: string;
    phoneNumber?: string;
    address?: AddressDto;
}
export declare class BusinessInfoDto {
    companyName?: string;
    registrationNumber?: string;
    taxId?: string;
    businessEstablishedDate?: string;
    businessDescription?: string;
    website?: string;
    mcc?: string;
    businessAddress?: AddressDto;
}
export declare class BankInfoDto {
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    accountType?: 'checking' | 'savings';
    bankName?: string;
}
export declare class DocumentUploadDto {
    documentType: KycDocumentType;
    fileName: string;
    description?: string;
    isPrimaryDocument?: boolean;
    expiresAt?: string;
    base64Data?: string;
}
export declare class CreateKycVerificationDto {
    verificationType: KycVerificationType;
    businessType: KycBusinessType;
    personalInfo?: PersonalInfoDto;
    businessInfo?: BusinessInfoDto;
    bankInfo?: BankInfoDto;
    documents?: DocumentUploadDto[];
    stripeAccountId?: string;
    returnUrl?: string;
    refreshUrl?: string;
    skipOnboarding?: boolean;
}
export declare class UpdateKycVerificationDto {
    personalInfo?: PersonalInfoDto;
    businessInfo?: BusinessInfoDto;
    bankInfo?: BankInfoDto;
    additionalInformation?: string;
    submitForReview?: boolean;
}
export declare class UploadKycDocumentDto {
    documentType: KycDocumentType;
    fileName: string;
    description?: string;
    isPrimaryDocument?: boolean;
    expiresAt?: string;
    base64Data?: string;
    fileUrl?: string;
    mimeType?: string;
    metadata?: any;
}
export declare class KycVerificationQueryDto {
    status?: string;
    verificationType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
