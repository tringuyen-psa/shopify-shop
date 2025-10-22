import { Shop } from '../../shops/entities/shop.entity';
import { KycDocument } from './kyc-document.entity';
export declare enum KycVerificationStatus {
    PENDING = "pending",
    IN_REVIEW = "in_review",
    ADDITIONAL_INFORMATION_REQUIRED = "additional_information_required",
    APPROVED = "approved",
    REJECTED = "rejected",
    RESTRICTED = "restricted"
}
export declare enum KycVerificationType {
    INDIVIDUAL = "individual",
    COMPANY = "company"
}
export declare enum KycBusinessType {
    INDIVIDUAL = "individual",
    COMPANY = "company",
    NON_PROFIT = "non_profit",
    GOVERNMENT_ENTITY = "government_entity"
}
export declare class KycVerification {
    id: string;
    verificationId: string;
    verificationType: KycVerificationType;
    businessType: KycBusinessType;
    status: KycVerificationStatus;
    stripeAccountId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    idNumber: string;
    phoneNumber: string;
    companyName: string;
    registrationNumber: string;
    taxId: string;
    businessEstablishedDate: Date;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    bankAccountNumber: string;
    bankRoutingNumber: string;
    bankName: string;
    bankAccountHolderName: string;
    stripeRequirements: any;
    stripeCapabilities: any;
    stripeRestrictions: any;
    rejectionReason: string;
    additionalInformationRequested: string;
    verifiedAt: Date;
    rejectedAt: Date;
    restrictedAt: Date;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    transfersEnabled: boolean;
    identityVerified: boolean;
    addressVerified: boolean;
    bankAccountVerified: boolean;
    businessVerified: boolean;
    verificationMetadata: any;
    createdAt: Date;
    updatedAt: Date;
    shop: Shop;
    shopId: string;
    documents: KycDocument[];
}
