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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./subscriptions.service");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const cancel_subscription_dto_1 = require("./dto/cancel-subscription.dto");
const change_plan_dto_1 = require("./dto/change-plan.dto");
const update_subscription_address_dto_1 = require("./dto/update-subscription-address.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    async getCustomerSubscriptions(req, status = 'all', page = 1, limit = 10) {
        const customer = req.user;
        const result = await this.subscriptionsService.getCustomerSubscriptions(customer.id, status, page, limit);
        return {
            success: true,
            data: result,
        };
    }
    async getSubscription(req, id) {
        const user = req.user;
        const subscription = await this.subscriptionsService.getSubscription(id, user);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        return {
            success: true,
            data: subscription,
        };
    }
    async cancelSubscription(req, id, cancelSubscriptionDto) {
        const user = req.user;
        const subscription = await this.subscriptionsService.cancelSubscription(id, user, cancelSubscriptionDto);
        return {
            success: true,
            data: subscription,
        };
    }
    async resumeSubscription(req, id) {
        const user = req.user;
        const subscription = await this.subscriptionsService.resumeSubscription(id, user);
        return {
            success: true,
            data: subscription,
        };
    }
    async changePlan(req, id, changePlanDto) {
        const user = req.user;
        const subscription = await this.subscriptionsService.changePlan(id, user, changePlanDto);
        return {
            success: true,
            data: subscription,
        };
    }
    async updateShippingAddress(req, id, updateAddressDto) {
        const user = req.user;
        const subscription = await this.subscriptionsService.updateShippingAddress(id, user, updateAddressDto);
        return {
            success: true,
            data: subscription,
        };
    }
    async getShopSubscriptions(req, shopId, status = 'all', page = 1, limit = 10) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const result = await this.subscriptionsService.getShopSubscriptions(shopId, status, page, limit);
        return {
            success: true,
            data: result,
        };
    }
    async getShopSubscriptionStats(req, shopId, period = 'month') {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const stats = await this.subscriptionsService.getShopSubscriptionStats(shopId, period);
        return {
            success: true,
            data: stats,
        };
    }
    async getAllSubscriptions(status = 'all', page = 1, limit = 20, shopId, customerId) {
        const result = await this.subscriptionsService.getAllSubscriptions(status, page, limit, shopId, customerId);
        return {
            success: true,
            data: result,
        };
    }
    async getSubscriptionStats(period = 'month') {
        const stats = await this.subscriptionsService.getSubscriptionStats(period);
        return {
            success: true,
            data: stats,
        };
    }
    async createSubscription(createSubscriptionDto) {
        const subscription = await this.subscriptionsService.create(createSubscriptionDto);
        return {
            success: true,
            data: subscription,
        };
    }
    async handleStripeWebhook(webhookData) {
        const result = await this.subscriptionsService.handleStripeWebhook(webhookData);
        return {
            success: true,
            data: result,
        };
    }
    async getSubscriptionRenewals(req, id, page = 1, limit = 10) {
        const user = req.user;
        const result = await this.subscriptionsService.getSubscriptionRenewals(id, user, page, limit);
        return {
            success: true,
            data: result,
        };
    }
    async pauseSubscription(req, id, body) {
        const user = req.user;
        const subscription = await this.subscriptionsService.pauseSubscription(id, user, body.reason, body.resumeAt);
        return {
            success: true,
            data: subscription,
        };
    }
    async unpauseSubscription(req, id) {
        const user = req.user;
        const subscription = await this.subscriptionsService.unpauseSubscription(id, user);
        return {
            success: true,
            data: subscription,
        };
    }
    async getShopSubscriptionAnalytics(req, shopId, period = '30d') {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const analytics = await this.subscriptionsService.getShopSubscriptionAnalytics(shopId, period);
        return {
            success: true,
            data: analytics,
        };
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user subscriptions' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscriptions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getCustomerSubscriptions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel subscription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot cancel this subscription' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cancel_subscription_dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resume cancelled subscription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription resumed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot resume this subscription' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "resumeSubscription", null);
__decorate([
    (0, common_1.Put)(':id/change-plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Change subscription billing cycle' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription plan changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot change plan for this subscription' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, change_plan_dto_1.ChangePlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "changePlan", null);
__decorate([
    (0, common_1.Put)(':id/update-address'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipping address for subscription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update address for digital subscription' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_subscription_address_dto_1.UpdateSubscriptionAddressDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "updateShippingAddress", null);
__decorate([
    (0, common_1.Get)('shops/:shopId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop subscriptions (shop owner)' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop subscriptions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getShopSubscriptions", null);
__decorate([
    (0, common_1.Get)('shops/:shopId/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription statistics for shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getShopSubscriptionStats", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subscriptions (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All subscriptions retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('shopId')),
    __param(4, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getAllSubscriptions", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription statistics (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create subscription (internal use)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscription created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('webhook/stripe'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe subscription webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Get)(':id/renewals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription renewal history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Renewal history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionRenewals", null);
__decorate([
    (0, common_1.Put)(':id/pause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pause subscription (shop owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription paused successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "pauseSubscription", null);
__decorate([
    (0, common_1.Put)(':id/unpause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unpause subscription (shop owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Subscription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription unpaused successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "unpauseSubscription", null);
__decorate([
    (0, common_1.Get)('shops/:shopId/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription analytics for shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription analytics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getShopSubscriptionAnalytics", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map