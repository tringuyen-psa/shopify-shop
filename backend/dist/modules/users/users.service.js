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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
require("express-serve-static-core");
const uuid_1 = require("uuid");
const user_entity_1 = require("./entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const date_fns_1 = require("date-fns");
let UsersService = class UsersService {
    constructor(userRepository, shopRepository, orderRepository, subscriptionRepository) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
    }
    async getProfile(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['shops'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(id, updateProfileDto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateProfileDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        await this.userRepository.update(id, updateProfileDto);
        return await this.getProfile(id);
    }
    async changePassword(id, changePasswordDto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
        await this.userRepository.update(id, { passwordHash: newPasswordHash });
    }
    async uploadAvatar(id, file) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const avatarUrl = `https://example.com/avatars/${id}/${file.originalname}`;
        await this.userRepository.update(id, { avatar: avatarUrl });
        return avatarUrl;
    }
    async deleteAvatar(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.update(id, { avatar: null });
    }
    async getCustomerOrders(customerId, page = 1, limit = 10, status = 'all') {
        const skip = (page - 1) * limit;
        const where = { customerId };
        if (status !== 'all') {
            where.fulfillmentStatus = status;
        }
        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: ['shop', 'product'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
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
    async getCustomerSubscriptions(customerId, status = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = { customerId };
        if (status !== 'all') {
            where.status = status;
        }
        const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
            where,
            relations: ['shop', 'product'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getCustomerStats(customerId) {
        const totalOrders = await this.orderRepository.count({
            where: { customerId },
        });
        const totalSubscriptions = await this.subscriptionRepository.count({
            where: { customerId },
        });
        const activeSubscriptions = await this.subscriptionRepository.count({
            where: { customerId, status: 'active' },
        });
        const totalSpent = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.customerId = :customerId', { customerId })
            .andWhere('order.paymentStatus = :status', { status: 'paid' })
            .getRawOne();
        return {
            totalOrders,
            totalSubscriptions,
            activeSubscriptions,
            totalSpent: parseFloat(totalSpent?.total) || 0,
        };
    }
    async getShopByOwner(ownerId) {
        const shop = await this.shopRepository.findOne({
            where: { ownerId },
            relations: ['products'],
        });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        return shop;
    }
    async getShopStats(ownerId, period = 'month') {
        const shop = await this.shopRepository.findOne({ where: { ownerId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const { startDate, endDate } = this.getDateRange(period);
        const totalOrders = await this.orderRepository.count({
            where: {
                shopId: shop.id,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const totalRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.shopId = :shopId', { shopId: shop.id })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.paymentStatus = :status', { status: 'paid' })
            .getRawOne();
        const totalSubscriptions = await this.subscriptionRepository.count({
            where: {
                shopId: shop.id,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const activeSubscriptions = await this.subscriptionRepository.count({
            where: { shopId: shop.id, status: 'active' },
        });
        return {
            totalOrders,
            totalRevenue: parseFloat(totalRevenue?.total) || 0,
            totalSubscriptions,
            activeSubscriptions,
        };
    }
    async getShopDashboard(ownerId) {
        const shop = await this.shopRepository.findOne({ where: { ownerId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const { startDate, endDate } = this.getDateRange('month');
        const recentOrders = await this.orderRepository.find({
            where: {
                shopId: shop.id,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['customer'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const recentSubscriptions = await this.subscriptionRepository.find({
            where: {
                shopId: shop.id,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['customer'],
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const topProducts = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.productId', 'productId')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .where('order.shopId = :shopId', { shopId: shop.id })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('order.productId')
            .orderBy('orderCount', 'DESC')
            .limit(5)
            .getRawMany();
        return {
            shop,
            recentOrders,
            recentSubscriptions,
            topProducts,
        };
    }
    async getAllUsers(page = 1, limit = 20, role = 'all', status = 'all', search) {
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
    async getUserById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['shops'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async suspendUser(id, reason, duration) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === 'platform_admin') {
            throw new common_1.ForbiddenException('Cannot suspend platform admin');
        }
        const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
        await this.userRepository.update(id, {
            isActive: false,
            suspendedReason: reason,
            suspendedUntil,
        });
    }
    async unsuspendUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.update(id, {
            isActive: true,
            suspendedReason: null,
            suspendedUntil: null,
        });
    }
    async deleteUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === 'platform_admin') {
            throw new common_1.ForbiddenException('Cannot delete platform admin');
        }
        await this.userRepository.softDelete(id);
    }
    async getUserStats(period = 'month') {
        const { startDate, endDate } = this.getDateRange(period);
        const totalUsers = await this.userRepository.count({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const usersByRole = await this.userRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(user.id)', 'count')
            .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('user.role')
            .getRawMany();
        const activeUsers = await this.userRepository.count({
            where: { isActive: true },
        });
        return {
            totalUsers,
            activeUsers,
            usersByRole,
        };
    }
    async getNotificationPreferences(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            emailNotifications: true,
            orderUpdates: true,
            subscriptionRenewals: true,
            promotions: false,
            newsletter: false,
        };
    }
    async updateNotificationPreferences(id, preferences) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return preferences;
    }
    async getAddresses(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return [];
    }
    async addAddress(id, addressData) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            id: (0, uuid_1.v4)(),
            ...addressData,
            userId: id,
        };
    }
    async updateAddress(id, addressId, addressData) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            id: addressId,
            ...addressData,
        };
    }
    async deleteAddress(id, addressId) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async getSecuritySettings(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            twoFactorEnabled: false,
            lastPasswordChange: user.updatedAt,
            activeSessions: 1,
        };
    }
    async enable2FA(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            secret: 'mock-secret',
            qrCode: 'mock-qr-code',
            backupCodes: ['123456', '789012'],
        };
    }
    async disable2FA(id, code) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (code !== '123456') {
            throw new common_1.BadRequestException('Invalid verification code');
        }
    }
    async getActiveSessions(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return [
            {
                id: (0, uuid_1.v4)(),
                device: 'Chrome on Windows',
                ipAddress: '192.168.1.1',
                location: 'New York, US',
                lastActive: new Date(),
                isCurrent: true,
            },
        ];
    }
    async revokeSession(id, sessionId) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async revokeAllSessions(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async findById(id) {
        return this.userRepository.findOne({
            where: { id },
        });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
        });
    }
    async create(userData) {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async update(id, userData) {
        await this.userRepository.update(id, userData);
        return this.findById(id);
    }
    async remove(id) {
        await this.userRepository.delete(id);
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
            case 'year':
                startDate = (0, date_fns_1.startOfYear)(now);
                endDate = (0, date_fns_1.endOfYear)(now);
                break;
            default:
                startDate = (0, date_fns_1.startOfMonth)(now);
                endDate = (0, date_fns_1.endOfMonth)(now);
        }
        return { startDate, endDate };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map