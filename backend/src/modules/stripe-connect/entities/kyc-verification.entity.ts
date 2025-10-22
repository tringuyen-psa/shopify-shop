import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { KycDocument } from './kyc-document.entity';

export enum KycVerificationStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  ADDITIONAL_INFORMATION_REQUIRED = 'additional_information_required',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESTRICTED = 'restricted',
}

export enum KycVerificationType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export enum KycBusinessType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  NON_PROFIT = 'non_profit',
  GOVERNMENT_ENTITY = 'government_entity',
}

@Entity('kyc_verifications')
export class KycVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  verificationId: string;

  @Column({ type: 'enum', enum: KycVerificationType, default: KycVerificationType.INDIVIDUAL })
  verificationType: KycVerificationType;

  @Column({ type: 'enum', enum: KycBusinessType, default: KycBusinessType.INDIVIDUAL })
  businessType: KycBusinessType;

  @Column({ type: 'enum', enum: KycVerificationStatus, default: KycVerificationStatus.PENDING })
  status: KycVerificationStatus;

  // Stripe Connect Account ID
  @Column({ nullable: true })
  stripeAccountId: string;

  // Personal Information (for individuals)
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  idNumber: string;

  @Column({ nullable: true })
  phoneNumber: string;

  // Business Information (for companies)
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ type: 'date', nullable: true })
  businessEstablishedDate: Date;

  // Address Information
  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  // Bank Information
  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankRoutingNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountHolderName: string;

  // Verification details from Stripe
  @Column({ type: 'json', nullable: true })
  stripeRequirements: any;

  @Column({ type: 'json', nullable: true })
  stripeCapabilities: any;

  @Column({ type: 'json', nullable: true })
  stripeRestrictions: any;

  // Verification metadata
  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  additionalInformationRequested: string;

  @Column({ type: 'date', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'date', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'date', nullable: true })
  restrictedAt: Date;

  @Column({ default: false })
  chargesEnabled: boolean;

  @Column({ default: false })
  payoutsEnabled: boolean;

  @Column({ default: false })
  transfersEnabled: boolean;

  // External verification flags
  @Column({ default: false })
  identityVerified: boolean;

  @Column({ default: false })
  addressVerified: boolean;

  @Column({ default: false })
  bankAccountVerified: boolean;

  @Column({ default: false })
  businessVerified: boolean;

  @Column({ type: 'json', nullable: true })
  verificationMetadata: any;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Shop, shop => shop.kycVerifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @OneToMany(() => KycDocument, document => document.kycVerification)
  documents: KycDocument[];
}