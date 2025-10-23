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
const products_service_1 = require("../products/products.service");
const payments_service_1 = require("../payments/payments.service");
const stripe_connect_service_1 = require("../stripe-connect/stripe-connect.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const create_product_dto_1 = require("../products/dto/create-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ShopsController = class ShopsController {
    constructor(shopsService, productsService, paymentsService, stripeConnectService) {
        this.shopsService = shopsService;
        this.productsService = productsService;
        this.paymentsService = paymentsService;
        this.stripeConnectService = stripeConnectService;
    }
    create(createShopDto, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.shopsService.create(createShopDto, userId);
    }
    async getMyShops(req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.shopsService.findByOwner(userId);
    }
    findAll(query) {
        return this.shopsService.findAll(query);
    }
    findBySlug(slug) {
        return this.shopsService.findBySlug(slug);
    }
    findProductsBySlug(slug) {
        return this.shopsService.findProductsBySlug(slug);
    }
    async findProductsById(id) {
        try {
            console.log(`Finding shop with identifier: ${id}`);
            console.log('Trying to find by slug...');
            const shopBySlug = await this.shopsService.findBySlug(id);
            console.log('Shop found by slug:', shopBySlug?.id || 'not found');
            if (shopBySlug) {
                return this.productsService.findByShopId(shopBySlug.id);
            }
            console.log('Trying to find by ID...');
            try {
                const shopById = await this.shopsService.findById(id);
                console.log('Shop found by ID:', shopById?.id || 'not found');
                if (shopById) {
                    return this.productsService.findByShopId(shopById.id);
                }
            }
            catch (idError) {
                console.log('ID lookup failed:', idError.message);
            }
            throw new common_1.NotFoundException('Shop not found');
        }
        catch (error) {
            console.error('Error finding shop by ID/slug:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to find shop: ' + error.message);
        }
    }
    async createProduct(shopId, createProductDto, req) {
        return this.productsService.create(createProductDto, shopId);
    }
    findOne(id) {
        return this.shopsService.findById(id);
    }
    update(id, updateShopDto, req) {
        return this.shopsService.update(id, updateShopDto);
    }
    remove(id, req) {
        return this.shopsService.remove(id);
    }
    subscribe(id, updateSubscriptionDto, req) {
        return this.shopsService.updateSubscriptionPlan(id, updateSubscriptionDto);
    }
    updateSubscription(id, updateSubscriptionDto, req) {
        return this.shopsService.updateSubscriptionPlan(id, updateSubscriptionDto);
    }
    cancelSubscription(id, req) {
        return this.shopsService.cancelSubscription(id);
    }
    async startOnboarding(shopId, req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID not found in token');
        }
        const shop = await this.shopsService.findById(shopId);
        if (shop.ownerId !== userId) {
            throw new common_1.BadRequestException('Access denied - Only shop owner can start onboarding');
        }
        try {
            const result = await this.stripeConnectService.createExpressAccount(shopId);
            return {
                message: 'Onboarding started successfully',
                onboardingUrl: result.onboardingUrl,
                accountId: result.accountId,
            };
        }
        catch (error) {
            if (error.message.includes('already has a Stripe account')) {
                const onboardingResult = await this.stripeConnectService.createOnboardingLink(shopId);
                return {
                    message: 'Onboarding link created successfully',
                    onboardingUrl: onboardingResult.onboardingUrl,
                    accountId: shop.stripeAccountId,
                };
            }
            throw new common_1.BadRequestException(error.message);
        }
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
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s shops' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shops retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getMyShops", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shops' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shops retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    (0, common_1.Get)(':id/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products for a shop by ID or slug' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID or slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop products retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "findProductsById", null);
__decorate([
    (0, common_1.Post)(':id/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product for a shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "createProduct", null);
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
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can update shop' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shop_dto_1.UpdateShopDto, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can delete shop' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe shop to platform plan' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can subscribe' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)(':id/subscription/update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop subscription plan' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can update subscription' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Post)(':id/subscription/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel shop subscription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can cancel subscription' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)(':id/connect/onboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start Stripe Connect onboarding' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner can access' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "startOnboarding", null);
exports.ShopsController = ShopsController = __decorate([
    (0, swagger_1.ApiTags)('shops'),
    (0, common_1.Controller)('shops'),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => products_service_1.ProductsService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => stripe_connect_service_1.StripeConnectService))),
    __metadata("design:paramtypes", [shops_service_1.ShopsService,
        products_service_1.ProductsService,
        payments_service_1.PaymentsService,
        stripe_connect_service_1.StripeConnectService])
], ShopsController);
//# sourceMappingURL=shops.controller.js.map