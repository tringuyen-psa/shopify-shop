import { ShopsService } from './shops.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class ShopsController {
    private readonly shopsService;
    private readonly paymentsService;
    constructor(shopsService: ShopsService, paymentsService: PaymentsService);
    create(createShopDto: CreateShopDto, req: any): Promise<import("./entities/shop.entity").Shop>;
    findMyShop(req: any): Promise<import("./entities/shop.entity").Shop>;
    findAll(page?: string, limit?: string, status?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        shops: import("./entities/shop.entity").Shop[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBySlug(slug: string): Promise<import("./entities/shop.entity").Shop>;
    findProductsBySlug(slug: string): Promise<any[]>;
    findOne(id: string): Promise<import("./entities/shop.entity").Shop>;
    update(id: string, updateShopDto: UpdateShopDto): Promise<import("./entities/shop.entity").Shop>;
    createConnectAccount(shopId: string, req: any): Promise<{
        message: string;
        accountId: any;
        chargesEnabled: any;
        payoutsEnabled: any;
    }>;
    startOnboarding(shopId: string, req: any): Promise<{
        message: string;
        onboardingUrl: any;
        accountId: string;
    }>;
    createKYCLink(shopId: string, req: any): Promise<{
        message: string;
        kycUrl: any;
        accountId: string;
    }>;
    getConnectStatus(shopId: string, req: any): Promise<{
        accountId: string;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
    }>;
    refreshOnboardingLink(shopId: string, req: any): Promise<{
        message: string;
        onboardingUrl: any;
    }>;
    getStripeDashboard(shopId: string, req: any): Promise<{
        message: string;
        dashboardUrl: any;
    }>;
    getSubscriptionPlans(): Promise<{
        message: string;
        plans: any[];
    }>;
    updateSubscription(shopId: string, req: any, updateData: UpdateSubscriptionDto): Promise<{
        message: string;
        shop: import("./entities/shop.entity").Shop;
    }>;
    cancelSubscription(shopId: string, req: any): Promise<{
        message: string;
        shop: import("./entities/shop.entity").Shop;
    }>;
}
