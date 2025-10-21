import { Repository } from 'typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreatePlatformSettingDto } from './dto/create-platform-setting.dto';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
export declare class PlatformService {
    private readonly platformSettingRepository;
    private readonly shopRepository;
    private readonly userRepository;
    private readonly orderRepository;
    private readonly subscriptionRepository;
    private readonly logger;
    constructor(platformSettingRepository: Repository<PlatformSetting>, shopRepository: Repository<Shop>, userRepository: Repository<User>, orderRepository: Repository<Order>, subscriptionRepository: Repository<Subscription>);
    getAllSettings(): Promise<PlatformSetting[]>;
    getSetting(key: string): Promise<string>;
    createSetting(createPlatformSettingDto: CreatePlatformSettingDto): Promise<PlatformSetting>;
    updateSetting(key: string, updatePlatformSettingDto: UpdatePlatformSettingDto): Promise<PlatformSetting>;
    deleteSetting(key: string): Promise<void>;
    setSetting(key: string, value: string, description?: string): Promise<PlatformSetting>;
    initializeDefaultSettings(): Promise<void>;
    getDashboard(period?: string): Promise<{
        period: string;
        totalUsers: number;
        totalShops: number;
        totalOrders: number;
        totalSubscriptions: number;
        totalRevenue: number;
        platformFees: number;
        conversionRate: number;
    }>;
    getAnalytics(period?: string): Promise<{
        period: string;
        usersByRole: any[];
        shopsByStatus: any[];
        ordersByStatus: any[];
    }>;
    getRevenueAnalytics(period?: string): Promise<{
        period: string;
        dailyRevenue: any[];
        topProducts: any[];
        topShops: any[];
    }>;
    getUserAnalytics(period?: string): Promise<{
        period: string;
        usersByRole: any[];
        shopsByStatus: any[];
        ordersByStatus: any[];
    }>;
    getShopAnalytics(period?: string): Promise<{
        period: string;
        usersByRole: any[];
        shopsByStatus: any[];
        ordersByStatus: any[];
    }>;
    getSubscriptionAnalytics(period?: string): Promise<{
        period: string;
        usersByRole: any[];
        shopsByStatus: any[];
        ordersByStatus: any[];
    }>;
    getShops(page?: number, limit?: number, status?: string, search?: string): Promise<{
        shops: Shop[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getShop(id: string): Promise<Shop>;
    approveShop(id: string): Promise<Shop>;
    suspendShop(id: string, reason: string, duration?: number): Promise<Shop>;
    unsuspendShop(id: string): Promise<Shop>;
    updateShopFee(id: string, platformFeePercent: number): Promise<Shop>;
    getUsers(page?: number, limit?: number, role?: string, status?: string, search?: string): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUser(id: string): Promise<User>;
    getOrders(page?: number, limit?: number, status?: string, shopId?: string, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getOrder(id: string): Promise<Order>;
    getTransactions(page: number, limit: number, type: string, status: string, shopId?: string): Promise<{
        transactions: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getTransaction(id: string): Promise<void>;
    getDisputes(page: number, limit: number, status: string, type: string): Promise<{
        disputes: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getDispute(id: string): Promise<void>;
    resolveDispute(id: string, data: any): Promise<{
        message: string;
    }>;
    getSalesReport(period: string, dateFrom?: string, dateTo?: string): Promise<{
        period: string;
        totalSales: number;
        orders: number;
    }>;
    getFeesReport(period: string, dateFrom?: string, dateTo?: string): Promise<{
        period: string;
        totalFees: number;
        transactions: number;
    }>;
    getShopPerformanceReport(period: string, shopId?: string): Promise<{
        period: string;
        performance: {};
    }>;
    getHealthStatus(): Promise<{
        status: string;
        database: string;
        services: string;
    }>;
    getMetrics(period: string): Promise<{
        period: string;
        metrics: {};
    }>;
    triggerBackup(): Promise<{
        message: string;
        backupId: string;
    }>;
    triggerCleanup(): Promise<{
        message: string;
        itemsRemoved: number;
    }>;
    getNotifications(page: number, limit: number, type: string): Promise<{
        notifications: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    sendNotification(data: any): Promise<{
        message: string;
        recipients: number;
    }>;
    getAuditLogs(page: number, limit: number, action?: string, userId?: string, dateFrom?: string, dateTo?: string): Promise<{
        logs: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    private getDateRange;
}
