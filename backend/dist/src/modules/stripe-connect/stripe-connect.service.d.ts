import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { Shop } from "../shops/entities/shop.entity";
export declare class StripeConnectService {
    private readonly configService;
    private readonly shopRepository;
    private stripe;
    constructor(configService: ConfigService, shopRepository: Repository<Shop>);
    createExpressAccount(shopId: string): Promise<{
        accountId: string;
        onboardingUrl: string;
    }>;
    createAccountLoginLink(shopId: string): Promise<{
        loginUrl: string;
    }>;
    createOnboardingLink(shopId: string): Promise<{
        onboardingUrl: string;
    }>;
    getAccountDetails(shopId: string): Promise<any>;
    createAccountLink(accountId: string): Promise<{
        url: string;
    }>;
    getAccountDetailsByAccountId(accountId: string): Promise<any>;
    getAccountStatus(accountId: string): Promise<{
        charges_enabled: boolean;
        payouts_enabled: boolean;
    }>;
    updateShopStripeStatus(shopId: string): Promise<Shop>;
    handleAccountUpdated(accountId: string): Promise<void>;
    createDirectCharge(shopId: string, amount: number, paymentMethodId: string, metadata?: Record<string, string>): Promise<{
        paymentIntentId: string;
        clientSecret: string;
    }>;
    deleteStripeAccount(shopId: string): Promise<void>;
    forceCompleteStripeSetup(shopId: string): Promise<Shop>;
}
