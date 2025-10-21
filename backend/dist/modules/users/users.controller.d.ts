import 'express-serve-static-core';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        success: boolean;
        data: import("./entities/user.entity").User;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        data: import("./entities/user.entity").User;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            avatarUrl: string;
        };
    }>;
    deleteAvatar(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getCustomerOrders(req: any, page?: number, limit?: number, status?: string): Promise<{
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
    getCustomerSubscriptions(req: any, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            subscriptions: import("../subscriptions/entities/subscription.entity").Subscription[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getCustomerStats(req: any): Promise<{
        success: boolean;
        data: {
            totalOrders: number;
            totalSubscriptions: number;
            activeSubscriptions: number;
            totalSpent: number;
        };
    }>;
    getShop(req: any): Promise<{
        success: boolean;
        data: import("../shops/entities/shop.entity").Shop;
    }>;
    getShopStats(req: any, period?: string): Promise<{
        success: boolean;
        data: {
            totalOrders: number;
            totalRevenue: number;
            totalSubscriptions: number;
            activeSubscriptions: number;
        };
    }>;
    getShopDashboard(req: any): Promise<{
        success: boolean;
        data: {
            shop: import("../shops/entities/shop.entity").Shop;
            recentOrders: import("../orders/entities/order.entity").Order[];
            recentSubscriptions: import("../subscriptions/entities/subscription.entity").Subscription[];
            topProducts: any[];
        };
    }>;
    getAllUsers(page?: number, limit?: number, role?: string, status?: string, search?: string): Promise<{
        success: boolean;
        data: {
            users: import("./entities/user.entity").User[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }>;
    getUserById(id: string): Promise<{
        success: boolean;
        data: import("./entities/user.entity").User;
    }>;
    suspendUser(id: string, body: {
        reason: string;
        duration?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    unsuspendUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserStats(period?: string): Promise<{
        success: boolean;
        data: {
            totalUsers: number;
            activeUsers: number;
            usersByRole: any[];
        };
    }>;
    getNotificationPreferences(req: any): Promise<{
        success: boolean;
        data: {
            emailNotifications: boolean;
            orderUpdates: boolean;
            subscriptionRenewals: boolean;
            promotions: boolean;
            newsletter: boolean;
        };
    }>;
    updateNotificationPreferences(req: any, preferences: {
        emailNotifications?: boolean;
        orderUpdates?: boolean;
        subscriptionRenewals?: boolean;
        promotions?: boolean;
        newsletter?: boolean;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    getAddresses(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    addAddress(req: any, addressData: {
        type: 'shipping' | 'billing';
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        phone?: string;
        isDefault?: boolean;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    updateAddress(req: any, addressId: string, addressData: {
        type?: 'shipping' | 'billing';
        name?: string;
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        phone?: string;
        isDefault?: boolean;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteAddress(req: any, addressId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSecuritySettings(req: any): Promise<{
        success: boolean;
        data: {
            twoFactorEnabled: boolean;
            lastPasswordChange: Date;
            activeSessions: number;
        };
    }>;
    enable2FA(req: any): Promise<{
        success: boolean;
        data: {
            secret: string;
            qrCode: string;
            backupCodes: string[];
        };
    }>;
    disable2FA(req: any, body: {
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveSessions(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            device: string;
            ipAddress: string;
            location: string;
            lastActive: Date;
            isCurrent: boolean;
        }[];
    }>;
    revokeSession(req: any, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    revokeAllSessions(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
