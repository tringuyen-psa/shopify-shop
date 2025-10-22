import { KycVerification } from './kyc-verification.entity';
export declare enum KycDocumentType {
    ID_FRONT = "id_front",
    ID_BACK = "id_back",
    PASSPORT = "passport",
    DRIVING_LICENSE_FRONT = "driving_license_front",
    DRIVING_LICENSE_BACK = "driving_license_back",
    PROOF_OF_ADDRESS = "proof_of_address",
    BUSINESS_REGISTRATION = "business_registration",
    TAX_DOCUMENT = "tax_document",
    BANK_STATEMENT = "bank_statement",
    ARTICLES_OF_ASSOCIATION = "articles_of_association",
    SHAREHOLDER_REGISTRY = "shareholder_registry",
    OWNERSHIP_DECLARATION = "ownership_declaration",
    ADDITIONAL_DOCUMENT = "additional_document"
}
export declare enum KycDocumentStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class KycDocument {
    id: string;
    documentId: string;
    documentType: KycDocumentType;
    status: KycDocumentStatus;
    fileName: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
    filePath: string;
    stripeFileId: string;
    stripeVerificationDetails: any;
    rejectionReason: string;
    extractedData: string;
    extractedFields: any;
    expiresAt: Date;
    verifiedAt: Date;
    rejectedAt: Date;
    isPrimaryDocument: boolean;
    isRequired: boolean;
    description: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
    kycVerification: KycVerification;
    kycVerificationId: string;
}
