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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const product_entity_1 = require("../products/entities/product.entity");
const date_fns_1 = require("date-fns");
let SubscriptionsService = class SubscriptionsService {
    constructor(subscriptionRepository, orderRepository, userRepository, shopRepository, productRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
    }
    async create(createSubscriptionDto) {
        const order = await this.orderRepository.findOne({
            where: { id: createSubscriptionDto.orderId },
            relations: ['shop', 'product'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(createSubscriptionDto.billingCycle);
        const subscriptionData = {
            productId: createSubscriptionDto.productId,
            customerId: createSubscriptionDto.customerId,
            billingCycle: createSubscriptionDto.billingCycle || 'monthly',
            platformFee: createSubscriptionDto.platformFee || 0,
            shopRevenue: createSubscriptionDto.shopRevenue || 0,
            shippingAddressLine1: createSubscriptionDto.shippingAddressLine1,
            shippingAddressLine2: createSubscriptionDto.shippingAddressLine2,
            shippingCity: createSubscriptionDto.shippingCity,
            shippingState: createSubscriptionDto.shippingState,
            shippingCountry: createSubscriptionDto.shippingCountry,
            shippingPostalCode: createSubscriptionDto.shippingPostalCode,
            shippingCost: createSubscriptionDto.shippingCost || 0,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
            renewalCount: 0,
        };
        if (createSubscriptionDto.orderId)
            subscriptionData.orderId = createSubscriptionDto.orderId;
        if (createSubscriptionDto.shopId)
            subscriptionData.shopId = createSubscriptionDto.shopId;
        if (createSubscriptionDto.stripeSubscriptionId)
            subscriptionData.stripeSubscriptionId = createSubscriptionDto.stripeSubscriptionId;
        if (createSubscriptionDto.stripeCustomerId)
            subscriptionData.stripeCustomerId = createSubscriptionDto.stripeCustomerId;
        if (createSubscriptionDto.amount)
            subscriptionData.amount = createSubscriptionDto.amount;
        const subscription = await this.subscriptionRepository.save(subscriptionData);
        return await this.findById(subscription.id);
    }
    async findById(id, relations) {
        return await this.subscriptionRepository.findOne({
            where: { id },
            relations: relations || ['shop', 'product', 'customer', 'order'],
        });
    }
    async getSubscription(id, user) {
        const subscription = await this.findById(id, ['shop', 'product', 'customer', 'order']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'customer' && subscription.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return subscription;
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
    async getShopSubscriptions(shopId, status = 'all', page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = { shopId };
        if (status !== 'all') {
            where.status = status;
        }
        const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
            where,
            relations: ['customer', 'product'],
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
    async cancelSubscription(id, user, cancelSubscriptionDto) {
        const subscription = await this.findById(id, ['shop']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'customer' && subscription.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (subscription.status === 'cancelled') {
            throw new common_1.BadRequestException('Subscription is already cancelled');
        }
        const updateData = {
            cancelAtPeriodEnd: cancelSubscriptionDto.immediate ? false : true,
            cancelledAt: cancelSubscriptionDto.immediate ? new Date() : null,
        };
        if (cancelSubscriptionDto.immediate) {
            updateData.status = 'cancelled';
            updateData.cancellationReason = cancelSubscriptionDto.reason;
        }
        await this.subscriptionRepository.update(id, updateData);
        return await this.findById(id);
    }
    async resumeSubscription(id, user) {
        const subscription = await this.findById(id, ['shop']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'customer' && subscription.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (subscription.status !== 'cancelled') {
            throw new common_1.BadRequestException('Only cancelled subscriptions can be resumed');
        }
        const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(subscription.billingCycle);
        await this.subscriptionRepository.update(id, {
            status: 'active',
            cancelAtPeriodEnd: false,
            currentPeriodStart,
            currentPeriodEnd,
            cancelledAt: null,
            cancellationReason: null,
        });
        return await this.findById(id);
    }
    async changePlan(id, user, changePlanDto) {
        const subscription = await this.findById(id, ['shop', 'product']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'customer' && subscription.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (subscription.status !== 'active') {
            throw new common_1.BadRequestException('Only active subscriptions can change plans');
        }
        const newAmount = this.calculateProductPrice(subscription.product, changePlanDto.billingCycle);
        const platformFee = this.calculatePlatformFee(newAmount, subscription.shop.platformFeePercent);
        const shopRevenue = newAmount - platformFee;
        await this.subscriptionRepository.update(id, {
            billingCycle: (changePlanDto.billingCycle || changePlanDto.newBillingCycle),
            amount: newAmount,
            platformFee,
            shopRevenue,
        });
        return await this.findById(id);
    }
    async updateShippingAddress(id, user, updateAddressDto) {
        const subscription = await this.findById(id);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'customer' && subscription.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const product = await this.productRepository.findOne({
            where: { id: subscription.productId },
        });
        if (!product || !product.requiresShipping) {
            throw new common_1.BadRequestException('This subscription does not require shipping');
        }
        await this.subscriptionRepository.update(id, {
            shippingAddressLine1: updateAddressDto.shippingAddress.line1,
            shippingAddressLine2: updateAddressDto.shippingAddress.line2,
            shippingCity: updateAddressDto.shippingAddress.city,
            shippingState: updateAddressDto.shippingAddress.state,
            shippingCountry: updateAddressDto.shippingAddress.country,
            shippingPostalCode: updateAddressDto.shippingAddress.postalCode,
        });
        return await this.findById(id);
    }
    async getAllSubscriptions(status = 'all', page = 1, limit = 20, shopId, customerId) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status !== 'all') {
            where.status = status;
        }
        if (shopId) {
            where.shopId = shopId;
        }
        if (customerId) {
            where.customerId = customerId;
        }
        const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
            where,
            relations: ['shop', 'customer', 'product'],
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
    async handleStripeWebhook(webhookData) {
        const { type, data } = webhookData;
        switch (type) {
            case 'invoice.paid':
                return await this.handleInvoicePaid(data.object);
            case 'customer.subscription.deleted':
                return await this.handleSubscriptionDeleted(data.object);
            case 'invoice.payment_failed':
                return await this.handleInvoicePaymentFailed(data.object);
            default:
                return { message: 'Event type not handled' };
        }
    }
    async handleInvoicePaid(invoiceData) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: invoiceData.subscription },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(subscription.billingCycle, new Date(invoiceData.period_end * 1000));
        await this.subscriptionRepository.update(subscription.id, {
            status: 'active',
            currentPeriodStart: new Date(invoiceData.period_start * 1000),
            currentPeriodEnd: new Date(invoiceData.period_end * 1000),
            renewalCount: subscription.renewalCount + 1,
        });
        await this.createRenewalOrder(subscription, invoiceData);
        return { subscriptionId: subscription.id, status: 'renewed' };
    }
    async handleSubscriptionDeleted(subscriptionData) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: subscriptionData.id },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        await this.subscriptionRepository.update(subscription.id, {
            status: 'cancelled',
            cancelledAt: new Date(),
        });
        return { subscriptionId: subscription.id, status: 'cancelled' };
    }
    async handleInvoicePaymentFailed(invoiceData) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId: invoiceData.subscription },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        await this.subscriptionRepository.update(subscription.id, {
            status: 'past_due',
        });
        return { subscriptionId: subscription.id, status: 'past_due' };
    }
    async createRenewalOrder(subscription, invoiceData) {
        const orderNumber = await this.generateOrderNumber();
        await this.orderRepository.save({
            orderNumber,
            subscriptionId: subscription.id,
            shopId: subscription.shopId,
            productId: subscription.productId,
            customerId: subscription.customerId,
            customerEmail: subscription.customer.email,
            customerName: subscription.customer.name,
            shippingAddressLine1: subscription.shippingAddressLine1,
            shippingAddressLine2: subscription.shippingAddressLine2,
            shippingCity: subscription.shippingCity,
            shippingState: subscription.shippingState,
            shippingCountry: subscription.shippingCountry,
            shippingPostalCode: subscription.shippingPostalCode,
            shippingCost: subscription.shippingCost,
            productPrice: subscription.amount,
            totalAmount: subscription.amount + subscription.shippingCost,
            platformFee: subscription.platformFee,
            shopRevenue: subscription.shopRevenue,
            billingCycle: subscription.billingCycle,
            paymentMethod: 'stripe',
            paymentIntentId: invoiceData.payment_intent,
            paymentStatus: 'paid',
            fulfillmentStatus: subscription.shippingCost > 0 ? 'unfulfilled' : 'delivered',
            paidAt: new Date(),
        });
    }
    async getSubscriptionStats(period = 'month') {
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
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['shop'],
        });
        const stats = {
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
            pastDueSubscriptions: subscriptions.filter(s => s.status === 'past_due').length,
            totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
            totalPlatformFee: subscriptions.reduce((sum, s) => sum + Number(s.platformFee), 0),
            subscriptionsByBillingCycle: {
                weekly: subscriptions.filter(s => s.billingCycle === 'weekly').length,
                monthly: subscriptions.filter(s => s.billingCycle === 'monthly').length,
                yearly: subscriptions.filter(s => s.billingCycle === 'yearly').length,
            },
            topShops: this.getTopShopsBySubscriptions(subscriptions),
        };
        return stats;
    }
    async getShopSubscriptionStats(shopId, period = 'month') {
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
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                shopId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const stats = {
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
            totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
            totalPlatformFee: subscriptions.reduce((sum, s) => sum + Number(s.platformFee), 0),
            subscriptionsByBillingCycle: {
                weekly: subscriptions.filter(s => s.billingCycle === 'weekly').length,
                monthly: subscriptions.filter(s => s.billingCycle === 'monthly').length,
                yearly: subscriptions.filter(s => s.billingCycle === 'yearly').length,
            },
        };
        return stats;
    }
    async canUserAccessShop(userId, shopId) {
        const shop = await this.shopRepository.findOne({
            where: { id: shopId, ownerId: userId },
        });
        return !!shop;
    }
    async getSubscriptionRenewals(subscriptionId, user, page = 1, limit = 10) {
        const subscription = await this.getSubscription(subscriptionId, user);
        const orders = await this.orderRepository.find({
            where: { subscriptionId },
            relations: ['shop'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const total = await this.orderRepository.count({
            where: { subscriptionId },
        });
        return {
            orders,
            subscription,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async pauseSubscription(id, user, reason, resumeAt) {
        const subscription = await this.findById(id, ['shop']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (subscription.status !== 'active') {
            throw new common_1.BadRequestException('Only active subscriptions can be paused');
        }
        await this.subscriptionRepository.update(id, {
            status: 'paused',
            pauseReason: reason,
            resumeAt: resumeAt ? new Date(resumeAt) : null,
        });
        return await this.findById(id);
    }
    async unpauseSubscription(id, user) {
        const subscription = await this.findById(id, ['shop']);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (subscription.status !== 'paused') {
            throw new common_1.BadRequestException('Only paused subscriptions can be unpaused');
        }
        await this.subscriptionRepository.update(id, {
            status: 'active',
            pauseReason: null,
            resumeAt: null,
        });
        return await this.findById(id);
    }
    async getShopSubscriptionAnalytics(shopId, period = '30d') {
        const now = new Date();
        let startDate;
        switch (period) {
            case '7d':
                startDate = subDays(now, 7);
                break;
            case '30d':
                startDate = subDays(now, 30);
                break;
            case '90d':
                startDate = subDays(now, 90);
                break;
            case '1y':
                startDate = subYears(now, 1);
                break;
            default:
                startDate = subDays(now, 30);
        }
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                shopId,
                createdAt: (0, typeorm_2.MoreThan)(startDate),
            },
        });
        const dailyStats = await this.getDailySubscriptionStats(shopId, startDate, now);
        return {
            period,
            totalSubscriptions: subscriptions.length,
            newSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
            churnedSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
            totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
            averageRevenuePerSubscription: subscriptions.length > 0 ?
                subscriptions.reduce((sum, s) => sum + Number(s.amount), 0) / subscriptions.length : 0,
            dailyStats,
        };
    }
    calculateBillingDates(billingCycle, fromDate) {
        const now = fromDate || new Date();
        let currentPeriodStart = (0, date_fns_1.startOfMonth)(now);
        let currentPeriodEnd;
        switch (billingCycle) {
            case 'weekly':
                currentPeriodStart = (0, date_fns_1.startOfWeek)(now);
                currentPeriodEnd = (0, date_fns_1.endOfWeek)(now);
                break;
            case 'monthly':
                currentPeriodStart = (0, date_fns_1.startOfMonth)(now);
                currentPeriodEnd = (0, date_fns_1.endOfMonth)(now);
                break;
            case 'yearly':
                currentPeriodStart = (0, date_fns_1.startOfYear)(now);
                currentPeriodEnd = (0, date_fns_1.endOfYear)(now);
                break;
            default:
                currentPeriodStart = (0, date_fns_1.startOfMonth)(now);
                currentPeriodEnd = (0, date_fns_1.endOfMonth)(now);
        }
        return { currentPeriodStart, currentPeriodEnd };
    }
    calculateProductPrice(product, billingCycle) {
        switch (billingCycle) {
            case 'weekly':
                return product.weeklyPrice || product.basePrice;
            case 'monthly':
                return product.monthlyPrice || product.basePrice;
            case 'yearly':
                return product.yearlyPrice || product.basePrice;
            default:
                return product.basePrice;
        }
    }
    calculatePlatformFee(amount, feePercent) {
        return (amount * feePercent) / 100;
    }
    async generateOrderNumber() {
        let orderNumber;
        let exists = true;
        while (exists) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            orderNumber = `#${randomNum}`;
            const existingOrder = await this.orderRepository.findOne({
                where: { orderNumber },
            });
            exists = !!existingOrder;
        }
        return orderNumber;
    }
    getTopShopsBySubscriptions(subscriptions) {
        const shopCounts = new Map();
        subscriptions.forEach(subscription => {
            const existing = shopCounts.get(subscription.shopId);
            if (existing) {
                existing.count += 1;
                existing.revenue += Number(subscription.amount);
            }
            else {
                shopCounts.set(subscription.shopId, {
                    name: subscription.shop.name,
                    count: 1,
                    revenue: Number(subscription.amount),
                });
            }
        });
        return Array.from(shopCounts.entries())
            .map(([shopId, data]) => ({ shopId, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    async getDailySubscriptionStats(shopId, startDate, endDate) {
        return {
            subscriptions: [],
            revenue: [],
            churn: [],
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
function subDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}
function subYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
}
//# sourceMappingURL=subscriptions.service.js.map