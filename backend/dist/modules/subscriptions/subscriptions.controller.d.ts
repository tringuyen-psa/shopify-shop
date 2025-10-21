import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { UpdateSubscriptionAddressDto } from './dto/update-subscription-address.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getCustomerSubscriptions(req: any, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            subscriptions: import("./entities/subscription.entity").Subscription[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getSubscription(req: any, id: string): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    cancelSubscription(req: any, id: string, cancelSubscriptionDto: CancelSubscriptionDto): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    resumeSubscription(req: any, id: string): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    changePlan(req: any, id: string, changePlanDto: ChangePlanDto): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    updateShippingAddress(req: any, id: string, updateAddressDto: UpdateSubscriptionAddressDto): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    getShopSubscriptions(req: any, shopId: string, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            subscriptions: import("./entities/subscription.entity").Subscription[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getShopSubscriptionStats(req: any, shopId: string, period?: string): Promise<{
        success: boolean;
        data: {
            totalSubscriptions: number;
            activeSubscriptions: number;
            cancelledSubscriptions: number;
            totalRevenue: number;
            totalPlatformFee: number;
            subscriptionsByBillingCycle: {
                weekly: number;
                monthly: number;
                yearly: number;
            };
        };
    }>;
    getAllSubscriptions(status?: string, page?: number, limit?: number, shopId?: string, customerId?: string): Promise<{
        success: boolean;
        data: {
            subscriptions: import("./entities/subscription.entity").Subscription[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getSubscriptionStats(period?: string): Promise<{
        success: boolean;
        data: {
            totalSubscriptions: number;
            activeSubscriptions: number;
            cancelledSubscriptions: number;
            pastDueSubscriptions: number;
            totalRevenue: number;
            totalPlatformFee: number;
            subscriptionsByBillingCycle: {
                weekly: number;
                monthly: number;
                yearly: number;
            };
            topShops: {
                name: string;
                count: number;
                revenue: number;
                shopId: string;
            }[];
        };
    }>;
    createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    handleStripeWebhook(webhookData: any): Promise<{
        success: boolean;
        data: {
            subscriptionId: string;
            status: string;
        } | {
            message: string;
        };
    }>;
    getSubscriptionRenewals(req: any, id: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            orders: import("../orders/entities/order.entity").Order[];
            subscription: import("./entities/subscription.entity").Subscription;
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    pauseSubscription(req: any, id: string, body: {
        reason: string;
        resumeAt?: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    unpauseSubscription(req: any, id: string): Promise<{
        success: boolean;
        data: import("./entities/subscription.entity").Subscription;
    }>;
    getShopSubscriptionAnalytics(req: any, shopId: string, period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            totalSubscriptions: number;
            newSubscriptions: number;
            activeSubscriptions: number;
            churnedSubscriptions: number;
            totalRevenue: number;
            averageRevenuePerSubscription: number;
            dailyStats: {
                subscriptions: any[];
                revenue: any[];
                churn: any[];
            };
        };
    }>;
}
