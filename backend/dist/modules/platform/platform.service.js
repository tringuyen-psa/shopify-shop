"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PlatformService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const platform_setting_entity_1 = require("./entities/platform-setting.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const date_fns_1 = require("date-fns");
let PlatformService = PlatformService_1 = class PlatformService {
    constructor(platformSettingRepository, shopRepository, userRepository, orderRepository, subscriptionRepository) {
        this.platformSettingRepository = platformSettingRepository;
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.logger = new common_1.Logger(PlatformService_1.name);
    }
    async getAllSettings() {
        return await this.platformSettingRepository.find({
            order: { key: 'ASC' },
        });
    }
    async getSetting(key) {
        const setting = await this.platformSettingRepository.findOne({
            where: { key },
        });
        return setting ? setting.value : null;
    }
    async createSetting(createPlatformSettingDto) {
        const existingSetting = await this.platformSettingRepository.findOne({
            where: { key: createPlatformSettingDto.key },
        });
        if (existingSetting) {
            throw new common_1.BadRequestException('Setting with this key already exists');
        }
        const setting = this.platformSettingRepository.create(createPlatformSettingDto);
        return await this.platformSettingRepository.save(setting);
    }
    async updateSetting(key, updatePlatformSettingDto) {
        const setting = await this.platformSettingRepository.findOne({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException('Setting not found');
        }
        await this.platformSettingRepository.update(setting.id, updatePlatformSettingDto);
        return await this.platformSettingRepository.findOne({ where: { id: setting.id } });
    }
    async deleteSetting(key) {
        const setting = await this.platformSettingRepository.findOne({
            where: { key },
        });
        if (!setting) {
            throw new common_1.NotFoundException('Setting not found');
        }
        await this.platformSettingRepository.delete(setting.id);
    }
    async setSetting(key, value, description) {
        const existingSetting = await this.platformSettingRepository.findOne({
            where: { key },
        });
        if (existingSetting) {
            await this.platformSettingRepository.update(existingSetting.id, { value, description });
            return this.platformSettingRepository.findOne({ where: { id: existingSetting.id } });
        }
        const setting = this.platformSettingRepository.create({ key, value, description });
        return this.platformSettingRepository.save(setting);
    }
    async initializeDefaultSettings() {
        const defaultSettings = [
            { key: 'default_platform_fee', value: '15', description: 'Default platform fee percentage' },
            { key: 'min_platform_fee', value: '10', description: 'Minimum platform fee percentage' },
            { key: 'max_platform_fee', value: '30', description: 'Maximum platform fee percentage' },
            { key: 'stripe_platform_account_id', value: '', description: 'Stripe Platform Account ID' },
            { key: 'checkout_session_expiry_hours', value: '24', description: 'Hours before checkout session expires' },
        ];
        for (const setting of defaultSettings) {
            const exists = await this.platformSettingRepository.findOne({
                where: { key: setting.key },
            });
            if (!exists) {
                await this.platformSettingRepository.save(setting);
            }
        }
    }
    async getDashboard(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const [totalUsers, totalShops, totalOrders, totalSubscriptions, totalRevenue, platformFees,] = await Promise.all([
            this.userRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                },
            }),
            this.shopRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                },
            }),
            this.orderRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                    paymentStatus: 'paid',
                },
            }),
            this.subscriptionRepository.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(startDate, endDate),
                },
            }),
            this.orderRepository
                .createQueryBuilder('order')
                .select('SUM(order.totalAmount)', 'total')
                .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .andWhere('order.paymentStatus = :status', { status: 'paid' })
                .getRawOne(),
            this.orderRepository
                .createQueryBuilder('order')
                .select('SUM(order.platformFee)', 'total')
                .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
                .andWhere('order.paymentStatus = :status', { status: 'paid' })
                .getRawOne(),
        ]);
        return {
            period,
            totalUsers,
            totalShops,
            totalOrders,
            totalSubscriptions,
            totalRevenue: parseFloat(totalRevenue?.total) || 0,
            platformFees: parseFloat(platformFees?.total) || 0,
            conversionRate: totalShops > 0 ? (totalOrders / totalShops) * 100 : 0,
        };
    }
    async getAnalytics(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const usersByRole = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(user.id)', 'count')
            .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('user.role')
            .getRawMany();
        const shopsByStatus = await this.shopRepository
            .createQueryBuilder('shop')
            .select('shop.status', 'status')
            .addSelect('COUNT(shop.id)', 'count')
            .where('shop.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('shop.status')
            .getRawMany();
        const ordersByStatus = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.fulfillmentStatus', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('order.fulfillmentStatus')
            .getRawMany();
        return {
            period,
            usersByRole,
            shopsByStatus,
            ordersByStatus,
        };
    }
    async getRevenueAnalytics(period = '30d') {
        const { startDate, endDate } = this.getDateRange(period);
        const dailyRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('DATE(order.createdAt)', 'date')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .addSelect('SUM(order.platformFee)', 'platformFee')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :status', { status: 'paid' })
            .groupBy('DATE(order.createdAt)')
            .orderBy('DATE(order.createdAt)', 'ASC')
            .getRawMany();
        const topProducts = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.productId', 'productId')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :status', { status: 'paid' })
            .groupBy('order.productId')
            .orderBy('revenue', 'DESC')
            .limit(10)
            .getRawMany();
        const topShops = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.shopId', 'shopId')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .leftJoin('shop', 'shop', 'shop.id = order.shopId')
            .addSelect('shop.name', 'shopName')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :status', { status: 'paid' })
            .groupBy('order.shopId')
            .addGroupBy('shop.name')
            .orderBy('revenue', 'DESC')
            .limit(10)
            .getRawMany();
        return {
            period,
            dailyRevenue,
            topProducts,
            topShops,
        };
    }
    async getUserAnalytics(period = 'month') {
        return this.getAnalytics(period);
    }
    async getShopAnalytics(period = 'month') {
        return this.getAnalytics(period);
    }
    async getSubscriptionAnalytics(period = 'month') {
        return this.getAnalytics(period);
    }
    async getShops(page = 1, limit = 20, status = 'all', search) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.shopRepository
            .createQueryBuilder('shop')
            .leftJoinAndSelect('shop.owner', 'owner');
        if (status !== 'all') {
            queryBuilder.andWhere('shop.status = :status', { status });
        }
        if (search) {
            queryBuilder.andWhere('(shop.name ILIKE :search OR shop.email ILIKE :search OR owner.name ILIKE :search OR owner.email ILIKE :search)', { search: `%${search}%` });
        }
        const [shops, total] = await queryBuilder
            .orderBy('shop.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            shops,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getShop(id) {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: ['owner', 'products', 'orders'],
        });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        return shop;
    }
    async approveShop(id) {
        const shop = await this.shopRepository.findOne({ where: { id: id } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        await this.shopRepository.update(id, {
            status: 'active',
        });
        return await this.getShop(id);
    }
    async suspendShop(id, reason, duration) {
        const shop = await this.shopRepository.findOne({ where: { id: id } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        await this.shopRepository.update(id, {
            status: 'suspended',
            suspendedReason: reason,
            suspendedUntil,
        });
        return await this.getShop(id);
    }
    async unsuspendShop(id) {
        const shop = await this.shopRepository.findOne({ where: { id: id } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        await this.shopRepository.update(id, {
            status: 'active',
            suspendedReason: null,
            suspendedUntil: null,
        });
        return await this.getShop(id);
    }
    async updateShopFee(id, platformFeePercent) {
        const shop = await this.shopRepository.findOne({ where: { id: id } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        await this.shopRepository.update(id, {
            platformFeePercent,
        });
        return await this.getShop(id);
    }
    async getUsers(page = 1, limit = 20, role = 'all', status = 'all', search) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.shops', 'shops');
        if (role !== 'all') {
            queryBuilder.andWhere('user.role = :role', { role });
        }
        if (status !== 'all') {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive: status === 'active' });
        }
        if (search) {
            queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
        }
        const [users, total] = await queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getUser(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['shops'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getOrders(page = 1, limit = 20, status = 'all', shopId, customerId, dateFrom, dateTo) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.shop', 'shop')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.product', 'product');
        if (status !== 'all') {
            queryBuilder.andWhere('order.fulfillmentStatus = :status', { status });
        }
        if (shopId) {
            queryBuilder.andWhere('order.shopId = :shopId', { shopId });
        }
        if (customerId) {
            queryBuilder.andWhere('order.customerId = :customerId', { customerId });
        }
        if (dateFrom && dateTo) {
            queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', { dateFrom: new Date(dateFrom), dateTo: new Date(dateTo) });
        }
        const [orders, total] = await queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getOrder(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['shop', 'customer', 'product', 'orderItems'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async getTransactions(page, limit, type, status, shopId) {
        return {
            transactions: [],
            pagination: { page, limit, total: 0, pages: 0 },
        };
    }
    async getTransaction(id) {
        throw new common_1.NotFoundException('Transaction not found');
    }
    async getDisputes(page, limit, status, type) {
        return {
            disputes: [],
            pagination: { page, limit, total: 0, pages: 0 },
        };
    }
    async getDispute(id) {
        throw new common_1.NotFoundException('Dispute not found');
    }
    async resolveDispute(id, data) {
        return { message: 'Dispute resolved' };
    }
    async getSalesReport(period, dateFrom, dateTo) {
        return { period, totalSales: 0, orders: 0 };
    }
    async getFeesReport(period, dateFrom, dateTo) {
        return { period, totalFees: 0, transactions: 0 };
    }
    async getShopPerformanceReport(period, shopId) {
        return { period, performance: {} };
    }
    async getHealthStatus() {
        return {
            status: 'healthy',
            database: 'connected',
            services: 'operational',
        };
    }
    async getMetrics(period) {
        return { period, metrics: {} };
    }
    async triggerBackup() {
        return { message: 'Backup triggered', backupId: 'backup_' + Date.now() };
    }
    async triggerCleanup() {
        return { message: 'Cleanup completed', itemsRemoved: 0 };
    }
    async getNotifications(page, limit, type) {
        return {
            notifications: [],
            pagination: { page, limit, total: 0, pages: 0 },
        };
    }
    async sendNotification(data) {
        return { message: 'Notification sent', recipients: 0 };
    }
    async getAuditLogs(page, limit, action, userId, dateFrom, dateTo) {
        return {
            logs: [],
            pagination: { page, limit, total: 0, pages: 0 },
        };
    }
    getDateRange(period) {
        const now = new Date();
        let startDate;
        let endDate;
        switch (period) {
            case 'today':
                startDate = (0, date_fns_1.startOfDay)(now);
                endDate = (0, date_fns_1.endOfDay)(now);
                break;
            case 'week':
                startDate = (0, date_fns_1.startOfWeek)(now);
                endDate = (0, date_fns_1.endOfWeek)(now);
                break;
            case 'month':
                startDate = (0, date_fns_1.startOfMonth)(now);
                endDate = (0, date_fns_1.endOfMonth)(now);
                break;
            case '30d':
                startDate = (0, date_fns_1.subDays)(now, 30);
                endDate = now;
                break;
            case '90d':
                startDate = (0, date_fns_1.subDays)(now, 90);
                endDate = now;
                break;
            case '1y':
                startDate = (0, date_fns_1.subDays)(now, 365);
                endDate = now;
                break;
            default:
                startDate = (0, date_fns_1.startOfMonth)(now);
                endDate = (0, date_fns_1.endOfMonth)(now);
        }
        return { startDate, endDate };
    }
};
exports.PlatformService = PlatformService;
exports.PlatformService = PlatformService = PlatformService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(platform_setting_entity_1.PlatformSetting)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PlatformService);
//# sourceMappingURL=platform.service.js.map