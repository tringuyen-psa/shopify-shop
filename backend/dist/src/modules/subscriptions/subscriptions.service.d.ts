import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { UpdateSubscriptionAddressDto } from './dto/update-subscription-address.dto';
export declare class SubscriptionsService {
    private readonly subscriptionRepository;
    private readonly orderRepository;
    private readonly userRepository;
    private readonly shopRepository;
    private readonly productRepository;
    constructor(subscriptionRepository: Repository<Subscription>, orderRepository: Repository<Order>, userRepository: Repository<User>, shopRepository: Repository<Shop>, productRepository: Repository<Product>);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    findById(id: string, relations?: string[]): Promise<Subscription>;
    getSubscription(id: string, user: User): Promise<Subscription>;
    getCustomerSubscriptions(customerId: string, status?: string, page?: number, limit?: number): Promise<{
        subscriptions: Subscription[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getShopSubscriptions(shopId: string, status?: string, page?: number, limit?: number): Promise<{
        subscriptions: Subscription[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    cancelSubscription(id: string, user: User, cancelSubscriptionDto: CancelSubscriptionDto): Promise<Subscription>;
    resumeSubscription(id: string, user: User): Promise<Subscription>;
    changePlan(id: string, user: User, changePlanDto: ChangePlanDto): Promise<Subscription>;
    updateShippingAddress(id: string, user: User, updateAddressDto: UpdateSubscriptionAddressDto): Promise<Subscription>;
    getAllSubscriptions(status?: string, page?: number, limit?: number, shopId?: string, customerId?: string): Promise<{
        subscriptions: Subscription[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    handleStripeWebhook(webhookData: any): Promise<{
        subscriptionId: string;
        status: string;
    } | {
        message: string;
    }>;
    private handleInvoicePaid;
    private handleSubscriptionDeleted;
    private handleInvoicePaymentFailed;
    private createRenewalOrder;
    getSubscriptionStats(period?: string): Promise<{
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
    }>;
    getShopSubscriptionStats(shopId: string, period?: string): Promise<{
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
    }>;
    canUserAccessShop(userId: string, shopId: string): Promise<boolean>;
    getSubscriptionRenewals(subscriptionId: string, user: User, page?: number, limit?: number): Promise<{
        orders: Order[];
        subscription: Subscription;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    pauseSubscription(id: string, user: User, reason: string, resumeAt?: string): Promise<Subscription>;
    unpauseSubscription(id: string, user: User): Promise<Subscription>;
    getShopSubscriptionAnalytics(shopId: string, period?: string): Promise<{
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
    }>;
    private calculateBillingDates;
    private calculateProductPrice;
    private calculatePlatformFee;
    private generateOrderNumber;
    private getTopShopsBySubscriptions;
    private getDailySubscriptionStats;
}
