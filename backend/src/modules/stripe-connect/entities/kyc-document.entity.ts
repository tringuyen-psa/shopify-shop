import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { KycVerification } from './kyc-verification.entity';

export enum KycDocumentType {
  ID_FRONT = 'id_front',
  ID_BACK = 'id_back',
  PASSPORT = 'passport',
  DRIVING_LICENSE_FRONT = 'driving_license_front',
  DRIVING_LICENSE_BACK = 'driving_license_back',
  PROOF_OF_ADDRESS = 'proof_of_address',
  BUSINESS_REGISTRATION = 'business_registration',
  TAX_DOCUMENT = 'tax_document',
  BANK_STATEMENT = 'bank_statement',
  ARTICLES_OF_ASSOCIATION = 'articles_of_association',
  SHAREHOLDER_REGISTRY = 'shareholder_registry',
  OWNERSHIP_DECLARATION = 'ownership_declaration',
  ADDITIONAL_DOCUMENT = 'additional_document',
}

export enum KycDocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  documentId: string;

  @Column({ type: 'enum', enum: KycDocumentType })
  documentType: KycDocumentType;

  @Column({ type: 'enum', enum: KycDocumentStatus, default: KycDocumentStatus.UPLOADED })
  status: KycDocumentStatus;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  originalFileName: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  stripeFileId: string;

  // Stripe verification details
  @Column({ type: 'json', nullable: true })
  stripeVerificationDetails: any;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  extractedData: string;

  @Column({ type: 'json', nullable: true })
  extractedFields: any;

  @Column({ type: 'date', nullable: true })
  expiresAt: Date;

  @Column({ type: 'date', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'date', nullable: true })
  rejectedAt: Date;

  @Column({ default: false })
  isPrimaryDocument: boolean;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => KycVerification, kycVerification => kycVerification.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kyc_verification_id' })
  kycVerification: KycVerification;

  @Column()
  kycVerificationId: string;
}