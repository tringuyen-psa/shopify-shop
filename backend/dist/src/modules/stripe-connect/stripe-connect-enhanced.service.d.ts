import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { KycVerification, KycVerificationStatus } from './entities/kyc-verification.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { CreateKycVerificationDto, UpdateKycVerificationDto, UploadKycDocumentDto } from './dto/create-kyc-verification.dto';
export declare class StripeConnectEnhancedService {
    private readonly configService;
    private readonly shopRepository;
    private readonly kycVerificationRepository;
    private readonly kycDocumentRepository;
    private readonly stripe;
    private readonly logger;
    constructor(configService: ConfigService, shopRepository: Repository<Shop>, kycVerificationRepository: Repository<KycVerification>, kycDocumentRepository: Repository<KycDocument>);
    createKycVerification(shopId: string, createKycDto: CreateKycVerificationDto): Promise<KycVerification>;
    private createStripeConnectAccount;
    private updateStripeAccountData;
    uploadKycDocument(kycVerificationId: string, uploadDto: UploadKycDocumentDto): Promise<KycDocument>;
    private uploadFileToStripe;
    private createStripeVerificationFile;
    private isRequiredDocument;
    updateKycVerification(kycVerificationId: string, updateDto: UpdateKycVerificationDto): Promise<KycVerification>;
    syncStripeAccountStatus(kycVerificationId: string): Promise<void>;
    getKycVerification(kycVerificationId: string): Promise<KycVerification>;
    getShopKycVerifications(shopId: string, status?: KycVerificationStatus, page?: number, limit?: number): Promise<{
        verifications: KycVerification[];
        total: number;
    }>;
    createKycOnboardingLink(kycVerificationId: string): Promise<{
        url: string;
    }>;
    handleKycWebhook(event: Stripe.Event): Promise<void>;
    private handleAccountUpdated;
    submitForReview(kycVerificationId: string): Promise<void>;
    cancelKycVerification(kycVerificationId: string): Promise<void>;
}
