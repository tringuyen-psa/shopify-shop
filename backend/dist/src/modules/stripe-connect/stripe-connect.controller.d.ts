import { StripeConnectService } from './stripe-connect.service';
import { ShopsService } from '../shops/shops.service';
export declare class StripeConnectController {
    private readonly stripeConnectService;
    private readonly shopsService;
    constructor(stripeConnectService: StripeConnectService, shopsService: ShopsService);
    createAccount(req: any): Promise<{
        success: boolean;
        data: {
            accountId: string;
            onboardingUrl: string;
        };
    }>;
    createOnboardingLink(req: any): Promise<{
        success: boolean;
        data: {
            onboardingUrl: string;
        };
    }>;
    createLoginLink(req: any): Promise<{
        success: boolean;
        data: {
            loginUrl: string;
        };
    }>;
    createAccountLink(accountId: string): Promise<{
        success: boolean;
        data: {
            url: string;
        };
    }>;
    getAccountStatus(accountId: string): Promise<{
        success: boolean;
        data: {
            charges_enabled: boolean;
            payouts_enabled: boolean;
        };
    }>;
    getAccountDetails(req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    updateStatus(req: any): Promise<{
        success: boolean;
        data: {
            stripeOnboardingComplete: boolean;
            stripeChargesEnabled: boolean;
            stripePayoutsEnabled: boolean;
        };
    }>;
    onboardingComplete(req: any): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            status: "pending" | "active" | "rejected" | "suspended";
            stripeOnboardingComplete: boolean;
            stripeChargesEnabled: boolean;
            stripePayoutsEnabled: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    deleteAccount(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    checkKyc(checkKycDto: {
        stripeAccountId: string;
    }): Promise<{
        success: boolean;
        kycComplete: boolean;
        message: string;
        shopStatus: {
            isActive: boolean;
            status: string;
            stripeChargesEnabled: boolean;
            stripePayoutsEnabled: boolean;
        };
        requirements?: undefined;
    } | {
        success: boolean;
        kycComplete: boolean;
        message: string;
        shopStatus: {
            isActive: boolean;
            status: string;
            stripeChargesEnabled: any;
            stripePayoutsEnabled: any;
        };
        requirements: any;
    }>;
    handleWebhook(body: {
        type: string;
        data: {
            object: {
                id: string;
            };
        };
    }): Promise<{
        received: boolean;
    }>;
    forceComplete(req: any): Promise<{
        success: boolean;
        message: string;
        shop: {
            id: string;
            stripeOnboardingComplete: boolean;
            stripeChargesEnabled: boolean;
            stripePayoutsEnabled: boolean;
            isActive: boolean;
            status: "pending" | "active" | "rejected" | "suspended";
        };
    }>;
    checkAccountStatus(accountId: string): Promise<{
        success: boolean;
        data: {
            accountId: any;
            email: any;
            chargesEnabled: any;
            payoutsEnabled: any;
            detailsSubmitted: any;
            currentlyDue: any;
            isVerified: boolean;
            capabilities: any;
            requirements: any;
            businessProfile: any;
            company: any;
            individual: any;
            shop: {
                id: string;
                name: string;
                slug: string;
                isActive: boolean;
                status: "pending" | "active" | "rejected" | "suspended";
                stripeOnboardingComplete: boolean;
                stripeChargesEnabled: boolean;
                stripePayoutsEnabled: boolean;
            };
        };
    }>;
}
