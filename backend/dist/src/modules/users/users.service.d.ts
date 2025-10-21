import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private readonly userRepository;
    private readonly shopRepository;
    private readonly orderRepository;
    private readonly subscriptionRepository;
    constructor(userRepository: Repository<User>, shopRepository: Repository<Shop>, orderRepository: Repository<Order>, subscriptionRepository: Repository<Subscription>);
    getProfile(id: string): Promise<User>;
    updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    uploadAvatar(id: string, file: Express.Multer.File): Promise<string>;
    deleteAvatar(id: string): Promise<void>;
    getCustomerOrders(customerId: string, page?: number, limit?: number, status?: string): Promise<{
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getCustomerSubscriptions(customerId: string, status?: string, page?: number, limit?: number): Promise<{
        subscriptions: Subscription[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getCustomerStats(customerId: string): Promise<{
        totalOrders: number;
        totalSubscriptions: number;
        activeSubscriptions: number;
        totalSpent: number;
    }>;
    getShopByOwner(ownerId: string): Promise<Shop>;
    getShopStats(ownerId: string, period?: string): Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalSubscriptions: number;
        activeSubscriptions: number;
    }>;
    getShopDashboard(ownerId: string): Promise<{
        shop: Shop;
        recentOrders: Order[];
        recentSubscriptions: Subscription[];
        topProducts: any[];
    }>;
    getAllUsers(page?: number, limit?: number, role?: string, status?: string, search?: string): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserById(id: string): Promise<User>;
    suspendUser(id: string, reason: string, duration?: number): Promise<void>;
    unsuspendUser(id: string): Promise<void>;
    deleteUser(id: string): Promise<void>;
    getUserStats(period?: string): Promise<{
        totalUsers: number;
        activeUsers: number;
        usersByRole: any[];
    }>;
    getNotificationPreferences(id: string): Promise<{
        emailNotifications: boolean;
        orderUpdates: boolean;
        subscriptionRenewals: boolean;
        promotions: boolean;
        newsletter: boolean;
    }>;
    updateNotificationPreferences(id: string, preferences: any): Promise<any>;
    getAddresses(id: string): Promise<any[]>;
    addAddress(id: string, addressData: any): Promise<any>;
    updateAddress(id: string, addressId: string, addressData: any): Promise<any>;
    deleteAddress(id: string, addressId: string): Promise<void>;
    getSecuritySettings(id: string): Promise<{
        twoFactorEnabled: boolean;
        lastPasswordChange: Date;
        activeSessions: number;
    }>;
    enable2FA(id: string): Promise<{
        secret: string;
        qrCode: string;
        backupCodes: string[];
    }>;
    disable2FA(id: string, code: string): Promise<void>;
    getActiveSessions(id: string): Promise<{
        id: string;
        device: string;
        ipAddress: string;
        location: string;
        lastActive: Date;
        isCurrent: boolean;
    }[]>;
    revokeSession(id: string, sessionId: string): Promise<void>;
    revokeAllSessions(id: string): Promise<void>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
    private getDateRange;
}
