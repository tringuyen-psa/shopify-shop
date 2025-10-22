import { StripeConnectEnhancedService } from './stripe-connect-enhanced.service';
import { ShopsService } from '../shops/shops.service';
import { CreateKycVerificationDto, UpdateKycVerificationDto, UploadKycDocumentDto, KycVerificationQueryDto } from './dto/create-kyc-verification.dto';
import { KycVerificationStatus } from './entities/kyc-verification.entity';
export declare class KycVerificationController {
    private readonly kycService;
    private readonly shopsService;
    constructor(kycService: StripeConnectEnhancedService, shopsService: ShopsService);
    startKycVerification(req: any, createKycDto: CreateKycVerificationDto): Promise<{
        success: boolean;
        data: {
            verificationId: string;
            status: KycVerificationStatus;
            stripeAccountId: string;
            message: string;
        };
    }>;
    getMyKycVerifications(req: any, query: KycVerificationQueryDto): Promise<{
        success: boolean;
        data: {
            verifications: import("./entities/kyc-verification.entity").KycVerification[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getKycVerification(verificationId: string, req: any): Promise<{
        success: boolean;
        data: import("./entities/kyc-verification.entity").KycVerification;
    }>;
    updateKycVerification(verificationId: string, updateDto: UpdateKycVerificationDto, req: any): Promise<{
        success: boolean;
        data: import("./entities/kyc-verification.entity").KycVerification;
        message: string;
    }>;
    uploadDocument(verificationId: string, file: Express.Multer.File, uploadDto: UploadKycDocumentDto, req: any): Promise<{
        success: boolean;
        data: import("./entities/kyc-document.entity").KycDocument;
        message: string;
    }>;
    submitForReview(verificationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    cancelVerification(verificationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createOnboardingLink(verificationId: string, req: any): Promise<{
        success: boolean;
        data: {
            onboardingUrl: string;
        };
    }>;
    syncStatus(verificationId: string, req: any): Promise<{
        success: boolean;
        data: import("./entities/kyc-verification.entity").KycVerification;
        message: string;
    }>;
    getAllKycVerifications(query: KycVerificationQueryDto): Promise<{
        success: boolean;
        data: {
            verifications: import("./entities/kyc-verification.entity").KycVerification[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getAnyKycVerification(verificationId: string): Promise<{
        success: boolean;
        data: import("./entities/kyc-verification.entity").KycVerification;
    }>;
}
