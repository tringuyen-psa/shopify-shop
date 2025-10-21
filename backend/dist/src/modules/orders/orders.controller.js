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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const fulfill_order_dto_1 = require("./dto/fulfill-order.dto");
const ship_order_dto_1 = require("./dto/ship-order.dto");
const cancel_order_dto_1 = require("./dto/cancel-order.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getCustomerOrders(req, page = 1, limit = 10, status = 'all') {
        const customer = req.user;
        const result = await this.ordersService.getCustomerOrders(customer.id, page, limit, status);
        return {
            success: true,
            data: result,
        };
    }
    async getOrderByNumber(req, orderNumber) {
        const user = req.user;
        const order = await this.ordersService.getOrderByNumber(orderNumber, user);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
        };
    }
    async getShopOrders(req, shopId, page = 1, limit = 10, status = 'all') {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.ordersService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const result = await this.ordersService.getShopOrders(shopId, page, limit, status);
        return {
            success: true,
            data: result,
        };
    }
    async getShopOrderByNumber(req, shopId, orderNumber) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.ordersService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const order = await this.ordersService.getShopOrderByNumber(shopId, orderNumber);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
        };
    }
    async fulfillOrder(req, id, fulfillOrderDto) {
        const user = req.user;
        const order = await this.ordersService.fulfillOrder(id, user, fulfillOrderDto);
        return {
            success: true,
            data: order,
        };
    }
    async shipOrder(req, id, shipOrderDto) {
        const user = req.user;
        const order = await this.ordersService.shipOrder(id, user, shipOrderDto);
        return {
            success: true,
            data: order,
        };
    }
    async deliverOrder(req, id) {
        const user = req.user;
        const order = await this.ordersService.deliverOrder(id, user);
        return {
            success: true,
            data: order,
        };
    }
    async cancelOrder(req, id, cancelOrderDto) {
        const user = req.user;
        const order = await this.ordersService.cancelOrder(id, user, cancelOrderDto);
        return {
            success: true,
            data: order,
        };
    }
    async updateInternalNote(req, id, body) {
        const user = req.user;
        const order = await this.ordersService.updateInternalNote(id, user, body.internalNote);
        return {
            success: true,
            data: order,
        };
    }
    async getAllOrders(page = 1, limit = 20, status = 'all', shopId, customerId) {
        const result = await this.ordersService.getAllOrders(page, limit, status, shopId, customerId);
        return {
            success: true,
            data: result,
        };
    }
    async getOrderStats(period = 'month') {
        const stats = await this.ordersService.getOrderStats(period);
        return {
            success: true,
            data: stats,
        };
    }
    async createOrder(createOrderDto) {
        const order = await this.ordersService.create(createOrderDto);
        return {
            success: true,
            data: order,
        };
    }
    async getOrderTracking(orderNumber, email) {
        const tracking = await this.ordersService.getOrderTracking(orderNumber, email);
        if (!tracking) {
            throw new common_1.NotFoundException('Order not found or email does not match');
        }
        return {
            success: true,
            data: tracking,
        };
    }
    async requestRefund(req, id, body) {
        const user = req.user;
        const result = await this.ordersService.requestRefund(id, user, body.reason, body.description);
        return {
            success: true,
            data: result,
        };
    }
    async processRefund(req, id, body) {
        const user = req.user;
        const result = await this.ordersService.processRefund(id, user, body.approve, body.reason, body.refundAmount);
        return {
            success: true,
            data: result,
        };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user orders (customer)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Get)(':orderNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details by order number' }),
    (0, swagger_1.ApiParam)({ name: 'orderNumber', description: 'Order number (e.g., #1001)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderByNumber", null);
__decorate([
    (0, common_1.Get)('shop/:shopId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop orders (shop owner)' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop orders retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getShopOrders", null);
__decorate([
    (0, common_1.Get)('shop/:shopId/:orderNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop order details (shop owner)' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiParam)({ name: 'orderNumber', description: 'Order number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Param)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getShopOrderByNumber", null);
__decorate([
    (0, common_1.Put)(':id/fulfill'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark order as fulfilled' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order marked as fulfilled' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fulfill_order_dto_1.FulfillOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "fulfillOrder", null);
__decorate([
    (0, common_1.Put)(':id/ship'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add tracking information and mark as shipped' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order marked as shipped' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ship_order_dto_1.ShipOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "shipOrder", null);
__decorate([
    (0, common_1.Put)(':id/deliver'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark order as delivered' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order marked as delivered' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deliverOrder", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order cannot be cancelled' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cancel_order_dto_1.CancelOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Put)(':id/internal-note'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update internal note (shop owner only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Internal note updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateInternalNote", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All orders retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('shopId')),
    __param(4, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order statistics (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create order (internal use)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(':orderNumber/tracking'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order tracking information (public)' }),
    (0, swagger_1.ApiParam)({ name: 'orderNumber', description: 'Order number' }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: true, description: 'Customer email for verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tracking information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found or email mismatch' }),
    __param(0, (0, common_1.Param)('orderNumber')),
    __param(1, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderTracking", null);
__decorate([
    (0, common_1.Post)(':id/refund-request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request refund (customer)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Refund request not allowed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "requestRefund", null);
__decorate([
    (0, common_1.Put)(':id/process-refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process refund (shop owner)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "processRefund", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map