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
exports.ShopsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shops_service_1 = require("./shops.service");
const payments_service_1 = require("../payments/payments.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ShopsController = class ShopsController {
    constructor(shopsService, paymentsService) {
        this.shopsService = shopsService;
        this.paymentsService = paymentsService;
    }
    create(createShopDto, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.shopsService.create(createShopDto, userId);
    }
    findMyShop(req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.shopsService.findByUserId(userId);
    }
    findAll(page, limit, status, search, sortBy, sortOrder) {
        const params = {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            status,
            search,
            sortBy,
            sortOrder,
        };
        return this.shopsService.findAll(params);
    }
    findBySlug(slug) {
        return this.shopsService.findBySlug(slug);
    }
    findProductsBySlug(slug) {
        return this.shopsService.findProductsBySlug(slug);
    }
    findOne(id) {
        return this.shopsService.findById(id);
    }
    update(id, updateShopDto) {
        return this.shopsService.update(id, updateShopDto);
    }
    async createConnectAccount(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const account = await this.paymentsService.createConnectAccount(shopId, userId);
        return {
            message: 'Stripe Connect account created successfully',
            accountId: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
        };
    }
    async startOnboarding(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        let accountId = shop.stripeAccountId;
        if (!accountId) {
            const account = await this.paymentsService.createConnectAccount(shopId, userId);
            accountId = account.id;
        }
        const onboardingLink = await this.paymentsService.createOnboardingLink(accountId);
        return {
            message: 'Onboarding started successfully',
            onboardingUrl: onboardingLink.url,
            accountId: accountId,
        };
    }
    async createKYCLink(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        let accountId = shop.stripeAccountId;
        if (!accountId) {
            const account = await this.paymentsService.createConnectAccount(shopId, userId);
            accountId = account.id;
        }
        const kycLink = await this.paymentsService.createKYCLink(accountId);
        return {
            message: 'KYC verification link created successfully',
            kycUrl: kycLink.url,
            accountId: accountId,
        };
    }
    async getConnectStatus(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        if (shop.stripeAccountId) {
            await this.paymentsService.updateAccountStatus(shop.stripeAccountId);
            const updatedShop = await this.shopsService.findById(shopId);
            return {
                accountId: updatedShop.stripeAccountId,
                onboardingComplete: updatedShop.stripeOnboardingComplete,
                chargesEnabled: updatedShop.stripeChargesEnabled,
                payoutsEnabled: updatedShop.stripePayoutsEnabled,
            };
        }
        return {
            accountId: null,
            onboardingComplete: false,
            chargesEnabled: false,
            payoutsEnabled: false,
        };
    }
    async refreshOnboardingLink(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId || !shop.stripeAccountId) {
            throw new common_1.BadRequestException('Access denied or no Stripe account found');
        }
        const onboardingLink = await this.paymentsService.createOnboardingLink(shop.stripeAccountId);
        return {
            message: 'Onboarding link refreshed successfully',
            onboardingUrl: onboardingLink.url,
        };
    }
    async getStripeDashboard(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId || !shop.stripeAccountId) {
            throw new common_1.BadRequestException('Access denied or no Stripe account found');
        }
        const dashboardLink = await this.paymentsService.createDashboardLink(shop.stripeAccountId);
        return {
            message: 'Dashboard link retrieved successfully',
            dashboardUrl: dashboardLink.url,
        };
    }
    async getSubscriptionPlans() {
        const plans = await this.shopsService.getSubscriptionPlans();
        return {
            message: 'Subscription plans retrieved successfully',
            plans,
        };
    }
    async updateSubscription(shopId, req, updateData) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        const updatedShop = await this.shopsService.updateSubscriptionPlan(shopId, updateData);
        return {
            message: 'Subscription updated successfully',
            shop: updatedShop,
        };
    }
    async cancelSubscription(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied');
        }
        const updatedShop = await this.shopsService.cancelSubscription(shopId);
        return {
            message: 'Subscription cancelled successfully',
            shop: updatedShop,
        };
    }
};
exports.ShopsController = ShopsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new shop' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shop successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owners can create shops' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.CreateShopDto, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user shop' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current user shop retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findMyShop", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shops' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shops retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid query parameters' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Shop slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':slug/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products for a shop by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Shop slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop products retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findProductsBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin can update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shop_dto_1.UpdateShopDto]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/connect/create-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe Connect account' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Stripe Connect account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "createConnectAccount", null);
__decorate([
    (0, common_1.Post)(':id/connect/onboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start Stripe Connect onboarding' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Post)(':id/connect/kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create KYC verification link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verification link created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "createKYCLink", null);
__decorate([
    (0, common_1.Get)(':id/connect/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Connect status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connect status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getConnectStatus", null);
__decorate([
    (0, common_1.Post)(':id/connect/refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh Stripe Connect onboarding link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding link refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "refreshOnboardingLink", null);
__decorate([
    (0, common_1.Get)(':id/connect/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Express dashboard link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard link retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getStripeDashboard", null);
__decorate([
    (0, common_1.Get)('subscriptions/plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get available subscription plans' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription plans retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getSubscriptionPlans", null);
__decorate([
    (0, common_1.Post)(':id/subscription/update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop subscription plan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription updated successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Post)(':id/subscription/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel shop subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription cancelled successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "cancelSubscription", null);
exports.ShopsController = ShopsController = __decorate([
    (0, swagger_1.ApiTags)('shops'),
    (0, common_1.Controller)('shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService,
        payments_service_1.PaymentsService])
], ShopsController);
//# sourceMappingURL=shops.controller.js.map