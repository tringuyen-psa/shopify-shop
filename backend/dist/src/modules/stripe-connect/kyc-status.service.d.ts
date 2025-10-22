import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { KycVerification } from './entities/kyc-verification.entity';
export declare class KycStatusService {
    private readonly shopRepository;
    private readonly kycVerificationRepository;
    private readonly logger;
    constructor(shopRepository: Repository<Shop>, kycVerificationRepository: Repository<KycVerification>);
    updateShopKycStatus(shopId: string, verificationId?: string): Promise<void>;
    private updateShopStatus;
    canShopReceivePayments(shopId: string): Promise<boolean>;
    canShopReceivePayouts(shopId: string): Promise<boolean>;
    getKycStatusSummary(shopId: string): Promise<any>;
    getShopsRequiringAttention(): Promise<Shop[]>;
    getShopsByKycStatus(status: string): Promise<Shop[]>;
    getKycStatistics(): Promise<any>;
    handleKycWebhook(eventType: string, data: any): Promise<void>;
    syncAllShopKycStatuses(): Promise<void>;
    cleanupOldVerifications(): Promise<number>;
}
