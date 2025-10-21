import { PlatformService } from './platform.service';
import { CreatePlatformSettingDto } from './dto/create-platform-setting.dto';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
export declare class PlatformController {
    private readonly platformService;
    constructor(platformService: PlatformService);
    getSettings(): Promise<{
        success: boolean;
        data: import("./entities/platform-setting.entity").PlatformSetting[];
    }>;
    getSetting(key: string): Promise<{
        success: boolean;
        data: string;
    }>;
    createSetting(createPlatformSettingDto: CreatePlatformSettingDto): Promise<{
        success: boolean;
        data: import("./entities/platform-setting.entity").PlatformSetting;
    }>;
    updateSetting(key: string, updatePlatformSettingDto: UpdatePlatformSettingDto): Promise<{
        success: boolean;
        data: import("./entities/platform-setting.entity").PlatformSetting;
    }>;
    deleteSetting(key: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getDashboard(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            totalUsers: number;
            totalShops: number;
            totalOrders: number;
            totalSubscriptions: number;
            totalRevenue: number;
            platformFees: number;
            conversionRate: number;
        };
    }>;
    getAnalytics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            usersByRole: any[];
            shopsByStatus: any[];
            ordersByStatus: any[];
        };
    }>;
    getRevenueAnalytics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            dailyRevenue: any[];
            topProducts: any[];
            topShops: any[];
        };
    }>;
    getUserAnalytics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            usersByRole: any[];
            shopsByStatus: any[];
            ordersByStatus: any[];
        };
    }>;
    getShopAnalytics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            usersByRole: any[];
            shopsByStatus: any[];
            ordersByStatus: any[];
        };
    }>;
    getSubscriptionAnalytics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            usersByRole: any[];
            shopsByStatus: any[];
            ordersByStatus: any[];
        };
    }>;
    getShops(page?: number, limit?: number, status?: string, search?: string): Promise<{
        success: boolean;
        data: {
            shops: import("../shops/entities/shop.entity").Shop[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getShop(id: string): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    approveShop(id: string): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    suspendShop(id: string, body: {
        reason: string;
        duration?: number;
    }): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    unsuspendShop(id: string): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    updateShopFee(id: string, body: {
        platformFeePercent: number;
    }): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    getUsers(page?: number, limit?: number, role?: string, status?: string, search?: string): Promise<{
        success: boolean;
        data: {
            users: import("../users/entities/user.entity").User[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getUser(id: string): Promise<{
        success: boolean;
        data: import("../users/entities/user.entity").User;
    }>;
    getOrders(page?: number, limit?: number, status?: string, shopId?: string, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            orders: import("../orders/entities/order.entity").Order[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getOrder(id: string): Promise<{
        success: boolean;
        data: import("../orders/entities/order.entity").Order;
    }>;
    getTransactions(page?: number, limit?: number, type?: string, status?: string, shopId?: string): Promise<{
        success: boolean;
        data: {
            transactions: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getTransaction(id: string): Promise<{
        success: boolean;
        data: void;
    }>;
    getDisputes(page?: number, limit?: number, status?: string, type?: string): Promise<{
        success: boolean;
        data: {
            disputes: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getDispute(id: string): Promise<{
        success: boolean;
        data: void;
    }>;
    resolveDispute(id: string, body: {
        resolution: string;
        action: 'refund' | 'warning' | 'suspend';
        notes?: string;
    }): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    getSalesReport(period?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            totalSales: number;
            orders: number;
        };
    }>;
    getFeesReport(period?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            totalFees: number;
            transactions: number;
        };
    }>;
    getShopPerformanceReport(period?: string, shopId?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            performance: {};
        };
    }>;
    getHealthStatus(): Promise<{
        success: boolean;
        data: {
            status: string;
            database: string;
            services: string;
        };
    }>;
    getMetrics(period?: string): Promise<{
        success: boolean;
        data: {
            period: string;
            metrics: {};
        };
    }>;
    triggerBackup(): Promise<{
        success: boolean;
        data: {
            message: string;
            backupId: string;
        };
    }>;
    triggerCleanup(): Promise<{
        success: boolean;
        data: {
            message: string;
            itemsRemoved: number;
        };
    }>;
    getNotifications(page?: number, limit?: number, type?: string): Promise<{
        success: boolean;
        data: {
            notifications: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    sendNotification(body: {
        title: string;
        message: string;
        type: 'system' | 'security' | 'performance';
        recipients?: 'all' | 'shop_owners' | 'customers';
        userIds?: string[];
    }): Promise<{
        success: boolean;
        data: {
            message: string;
            recipients: number;
        };
    }>;
    getAuditLogs(page?: number, limit?: number, action?: string, userId?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            logs: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
}
