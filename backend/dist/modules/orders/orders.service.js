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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const checkout_session_entity_1 = require("../checkout/entities/checkout-session.entity");
const date_fns_1 = require("date-fns");
let OrdersService = class OrdersService {
    constructor(orderRepository, orderItemRepository, checkoutSessionRepository, userRepository, shopRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.checkoutSessionRepository = checkoutSessionRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
    }
    async create(createOrderDto) {
        const orderNumber = await this.generateOrderNumber();
        const platformFee = this.calculatePlatformFee(createOrderDto.totalAmount, createOrderDto.platformFeePercent);
        const shopRevenue = createOrderDto.totalAmount - platformFee;
        const orderData = {
            orderNumber,
            checkoutSessionId: createOrderDto.checkoutSessionId,
            shopId: createOrderDto.shopId,
            productId: createOrderDto.productId,
            customerId: createOrderDto.customerId,
            customerEmail: createOrderDto.customerEmail,
            customerName: createOrderDto.customerName,
            customerPhone: createOrderDto.customerPhone,
            shippingAddressLine1: createOrderDto.shippingAddressLine1,
            shippingAddressLine2: createOrderDto.shippingAddressLine2,
            shippingCity: createOrderDto.shippingCity,
            shippingState: createOrderDto.shippingState,
            shippingCountry: createOrderDto.shippingCountry,
            shippingPostalCode: createOrderDto.shippingPostalCode,
            shippingCost: createOrderDto.shippingCost,
            productPrice: createOrderDto.productPrice,
            totalAmount: createOrderDto.totalAmount,
            platformFee,
            shopRevenue,
            billingCycle: createOrderDto.billingCycle,
            paymentMethod: createOrderDto.paymentMethod,
            paymentIntentId: createOrderDto.paymentIntentId,
            paymentStatus: createOrderDto.paymentStatus || 'paid',
            fulfillmentStatus: createOrderDto.fulfillmentStatus || 'unfulfilled',
            customerNote: createOrderDto.customerNote,
            paidAt: createOrderDto.paidAt ? new Date(createOrderDto.paidAt) : null,
        };
        const order = await this.orderRepository.save(orderData);
        if (createOrderDto.items && createOrderDto.items.length > 0) {
            await this.orderItemRepository.save(createOrderDto.items.map(item => ({
                orderId: order.id,
                productId: item.productId,
                productName: item.productName,
                productPrice: item.productPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
            })));
        }
        return await this.findById(order.id);
    }
    async findById(id, relations) {
        return await this.orderRepository.findOne({
            where: { id },
            relations: relations || ['shop', 'product', 'customer', 'orderItems', 'subscription'],
        });
    }
    async getOrderByNumber(orderNumber, user) {
        const order = await this.orderRepository.findOne({
            where: { orderNumber },
            relations: ['shop', 'product', 'customer', 'orderItems', 'subscription'],
        });
        if (!order) {
            return null;
        }
        if (user) {
            if (user.role === 'customer' && order.customerId !== user.id) {
                throw new common_1.ForbiddenException('Access denied');
            }
            if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return order;
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
    async getShopOrders(shopId, page = 1, limit = 10, status = 'all') {
        const skip = (page - 1) * limit;
        const where = { shopId };
        if (status !== 'all') {
            where.fulfillmentStatus = status;
        }
        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: ['customer', 'product'],
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
    async getShopOrderByNumber(shopId, orderNumber) {
        return await this.orderRepository.findOne({
            where: { shopId, orderNumber },
            relations: ['customer', 'product', 'orderItems', 'subscription'],
        });
    }
    async getAllOrders(page = 1, limit = 20, status = 'all', shopId, customerId) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status !== 'all') {
            where.fulfillmentStatus = status;
        }
        if (shopId) {
            where.shopId = shopId;
        }
        if (customerId) {
            where.customerId = customerId;
        }
        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: ['shop', 'customer', 'product'],
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
    async canUserAccessShop(userId, shopId) {
        const shop = await this.shopRepository.findOne({
            where: { id: shopId, ownerId: userId },
        });
        return !!shop;
    }
    async fulfillOrder(id, user, fulfillOrderDto) {
        const order = await this.findById(id, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.fulfillmentStatus !== 'unfulfilled') {
            throw new common_1.BadRequestException('Order is already fulfilled');
        }
        if (order.paymentStatus !== 'paid') {
            throw new common_1.BadRequestException('Order must be paid before fulfillment');
        }
        await this.orderRepository.update(id, {
            fulfillmentStatus: 'fulfilled',
            internalNote: fulfillOrderDto.internalNote,
            fulfilledAt: new Date(),
        });
        return await this.findById(id);
    }
    async shipOrder(id, user, shipOrderDto) {
        const order = await this.findById(id, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.fulfillmentStatus === 'cancelled') {
            throw new common_1.BadRequestException('Cannot ship cancelled order');
        }
        await this.orderRepository.update(id, {
            fulfillmentStatus: 'shipped',
            trackingNumber: shipOrderDto.trackingNumber,
            carrier: shipOrderDto.carrier,
            estimatedDelivery: shipOrderDto.estimatedDelivery ? new Date(shipOrderDto.estimatedDelivery) : null,
            shippedAt: new Date(),
        });
        return await this.findById(id);
    }
    async deliverOrder(id, user) {
        const order = await this.findById(id, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.fulfillmentStatus !== 'shipped') {
            throw new common_1.BadRequestException('Order must be shipped before delivery');
        }
        await this.orderRepository.update(id, {
            fulfillmentStatus: 'delivered',
            deliveredAt: new Date(),
        });
        return await this.findById(id);
    }
    async cancelOrder(id, user, cancelOrderDto) {
        const order = await this.findById(id, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'customer' && order.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.fulfillmentStatus === 'delivered') {
            throw new common_1.BadRequestException('Cannot cancel delivered order');
        }
        if (order.fulfillmentStatus === 'shipped') {
            throw new common_1.BadRequestException('Cannot cancel shipped order. Please contact support.');
        }
        await this.orderRepository.update(id, {
            fulfillmentStatus: 'cancelled',
            internalNote: cancelOrderDto.reason,
            cancelledAt: new Date(),
        });
        return await this.findById(id);
    }
    async updateInternalNote(id, user, internalNote) {
        const order = await this.findById(id, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.orderRepository.update(id, { internalNote });
        return await this.findById(id);
    }
    async getOrderStats(period = 'month') {
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
        const orders = await this.orderRepository.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['shop'],
        });
        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
            totalPlatformFee: orders.reduce((sum, order) => sum + Number(order.platformFee), 0),
            ordersByStatus: {
                pending: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
                fulfilled: orders.filter(o => o.fulfillmentStatus === 'fulfilled').length,
                shipped: orders.filter(o => o.fulfillmentStatus === 'shipped').length,
                delivered: orders.filter(o => o.fulfillmentStatus === 'delivered').length,
                cancelled: orders.filter(o => o.fulfillmentStatus === 'cancelled').length,
            },
            ordersByPaymentStatus: {
                pending: orders.filter(o => o.paymentStatus === 'pending').length,
                paid: orders.filter(o => o.paymentStatus === 'paid').length,
                failed: orders.filter(o => o.paymentStatus === 'failed').length,
                refunded: orders.filter(o => o.paymentStatus === 'refunded').length,
            },
            topShops: this.getTopShops(orders),
        };
        return stats;
    }
    async getOrderTracking(orderNumber, email) {
        const order = await this.orderRepository.findOne({
            where: { orderNumber, customerEmail: email },
            relations: ['shop', 'product'],
        });
        if (!order) {
            return null;
        }
        return {
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            shopName: order.shop.name,
            productName: order.product.name,
            productImage: order.product.images?.[0],
            fulfillmentStatus: order.fulfillmentStatus,
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            estimatedDelivery: order.estimatedDelivery,
            createdAt: order.createdAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
        };
    }
    async requestRefund(orderId, user, reason, description) {
        const order = await this.findById(orderId);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.customerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.paymentStatus !== 'paid') {
            throw new common_1.BadRequestException('Only paid orders can be refunded');
        }
        if (order.fulfillmentStatus === 'delivered') {
            throw new common_1.BadRequestException('Refund requests for delivered orders must be made within 7 days');
        }
        const refundInfo = `REFUND REQUEST - ${new Date().toISOString()}\nReason: ${reason}\nDescription: ${description || 'N/A'}\nStatus: Pending`;
        await this.orderRepository.update(orderId, {
            internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
        });
        return { message: 'Refund request submitted successfully' };
    }
    async processRefund(orderId, user, approve, reason, refundAmount) {
        const order = await this.findById(orderId, ['shop']);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const refundInfo = `REFUND DECISION - ${new Date().toISOString()}\nApproved: ${approve}\nReason: ${reason || 'N/A'}\nRefund Amount: ${refundAmount || order.totalAmount}\nProcessed by: ${user.name}`;
        if (approve) {
            await this.orderRepository.update(orderId, {
                paymentStatus: 'refunded',
                internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
            });
        }
        else {
            await this.orderRepository.update(orderId, {
                internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
            });
        }
        return { message: `Refund ${approve ? 'approved' : 'rejected'} successfully` };
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
    calculatePlatformFee(totalAmount, feePercent) {
        return (totalAmount * feePercent) / 100;
    }
    getTopShops(orders) {
        const shopRevenue = new Map();
        orders.forEach(order => {
            const existing = shopRevenue.get(order.shopId);
            if (existing) {
                existing.revenue += Number(order.totalAmount);
                existing.orders += 1;
            }
            else {
                shopRevenue.set(order.shopId, {
                    name: order.shop.name,
                    revenue: Number(order.totalAmount),
                    orders: 1,
                });
            }
        });
        return Array.from(shopRevenue.entries())
            .map(([shopId, data]) => ({ shopId, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(checkout_session_entity_1.CheckoutSession)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map