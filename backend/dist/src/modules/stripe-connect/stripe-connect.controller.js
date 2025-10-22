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
exports.StripeConnectController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stripe_connect_service_1 = require("./stripe-connect.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const shops_service_1 = require("../shops/shops.service");
let StripeConnectController = class StripeConnectController {
    constructor(stripeConnectService, shopsService) {
        this.stripeConnectService = stripeConnectService;
        this.shopsService = shopsService;
    }
    async createAccount(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const result = await this.stripeConnectService.createExpressAccount(shop.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createOnboardingLink(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const result = await this.stripeConnectService.createOnboardingLink(shop.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createLoginLink(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const result = await this.stripeConnectService.createAccountLoginLink(shop.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createAccountLink(accountId) {
        try {
            const result = await this.stripeConnectService.createAccountLink(accountId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAccountStatus(accountId) {
        try {
            const result = await this.stripeConnectService.getAccountStatus(accountId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAccountDetails(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const accountDetails = await this.stripeConnectService.getAccountDetails(shop.id);
            return {
                success: true,
                data: accountDetails,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async updateStatus(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const updatedShop = await this.stripeConnectService.updateShopStripeStatus(shop.id);
            return {
                success: true,
                data: {
                    stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
                    stripeChargesEnabled: updatedShop.stripeChargesEnabled,
                    stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async onboardingComplete(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            await this.stripeConnectService.updateShopStripeStatus(shop.id);
            if (shop.stripeOnboardingComplete || shop.stripeChargesEnabled) {
                const updatedShop = await this.shopsService.stripeOnboardingComplete(shop.id);
                return {
                    success: true,
                    data: {
                        isActive: updatedShop.isActive,
                        status: updatedShop.status,
                        stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
                        stripeChargesEnabled: updatedShop.stripeChargesEnabled,
                        stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
                    },
                };
            }
            return {
                success: false,
                message: 'Stripe onboarding not yet completed',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deleteAccount(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            await this.stripeConnectService.deleteStripeAccount(shop.id);
            return {
                success: true,
                message: 'Stripe account deleted successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async checkKyc(checkKycDto) {
        try {
            console.log(`Checking KYC status for account: ${checkKycDto.stripeAccountId}`);
            const account = await this.stripeConnectService.getAccountDetails(checkKycDto.stripeAccountId);
            console.log('Account details from Stripe:', {
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                requirements: account.requirements,
                capabilities: account.capabilities
            });
            const shop = await this.shopsService.findByStripeAccountId(checkKycDto.stripeAccountId);
            if (!shop) {
                throw new common_1.NotFoundException('Shop not found for this Stripe account');
            }
            await this.stripeConnectService.updateShopStripeStatus(shop.id);
            if (account.charges_enabled && account.payouts_enabled) {
                console.log('KYC complete, activating shop');
                await this.shopsService.stripeOnboardingComplete(shop.id);
                return {
                    success: true,
                    kycComplete: true,
                    message: 'KYC verification complete, shop activated',
                    shopStatus: {
                        isActive: true,
                        status: 'active',
                        stripeChargesEnabled: true,
                        stripePayoutsEnabled: true
                    }
                };
            }
            else {
                console.log('KYC not complete yet');
                return {
                    success: true,
                    kycComplete: false,
                    message: 'KYC verification not complete yet',
                    shopStatus: {
                        isActive: false,
                        status: 'pending',
                        stripeChargesEnabled: account.charges_enabled || false,
                        stripePayoutsEnabled: account.payouts_enabled || false
                    },
                    requirements: account.requirements || []
                };
            }
        }
        catch (error) {
            console.error('KYC check error:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async handleWebhook(body) {
        try {
            const { type, data } = body;
            console.log(`Stripe webhook received: ${type}`, { data });
            switch (type) {
                case 'account.updated':
                    const accountId = data.object.id;
                    console.log(`Processing account.updated for account: ${accountId}`);
                    const account = await this.stripeConnectService.getAccountDetails(accountId);
                    console.log('Account details from Stripe:', {
                        charges_enabled: account.charges_enabled,
                        payouts_enabled: account.payouts_enabled,
                        requirements: account.requirements
                    });
                    await this.stripeConnectService.updateShopStripeStatus(accountId);
                    if (account.charges_enabled && account.payouts_enabled) {
                        console.log('KYC complete, activating shop');
                        const shop = await this.shopsService.findByStripeAccountId(accountId);
                        if (shop) {
                            await this.shopsService.stripeOnboardingComplete(shop.id);
                            console.log(`Shop ${shop.id} activated successfully`);
                        }
                    }
                    else {
                        console.log('KYC not complete yet');
                    }
                    break;
                default:
                    console.log(`Unhandled webhook type: ${type}`);
            }
            return { received: true };
        }
        catch (error) {
            console.error('Stripe webhook error:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async forceComplete(req) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const updatedShop = await this.stripeConnectService.forceCompleteStripeSetup(shop.id);
            return {
                success: true,
                message: 'Stripe setup force completed successfully',
                shop: {
                    id: updatedShop.id,
                    stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
                    stripeChargesEnabled: updatedShop.stripeChargesEnabled,
                    stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
                    isActive: updatedShop.isActive,
                    status: updatedShop.status,
                },
            };
        }
        catch (error) {
            console.error('Force complete error:', error);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async checkAccountStatus(accountId) {
        try {
            console.log(`Checking status for Stripe account: ${accountId}`);
            if (!accountId || !accountId.startsWith('acct_')) {
                throw new common_1.BadRequestException('Invalid Stripe account ID format');
            }
            const account = await this.stripeConnectService.getAccountDetailsByAccountId(accountId);
            if (!account) {
                throw new common_1.NotFoundException('Stripe account not found');
            }
            const shop = await this.shopsService.findByStripeAccountId(accountId);
            const isVerified = account.charges_enabled &&
                account.payouts_enabled &&
                account.details_submitted &&
                (!account.requirements?.currently_due || account.requirements.currently_due.length === 0);
            const result = {
                accountId: account.id,
                email: account.email,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                detailsSubmitted: account.details_submitted,
                currentlyDue: account.requirements?.currently_due || [],
                isVerified: isVerified,
                capabilities: account.capabilities,
                requirements: account.requirements,
                businessProfile: account.business_profile,
                company: account.company,
                individual: account.individual,
                shop: shop ? {
                    id: shop.id,
                    name: shop.name,
                    slug: shop.slug,
                    isActive: shop.isActive,
                    status: shop.status,
                    stripeOnboardingComplete: shop.stripeOnboardingComplete,
                    stripeChargesEnabled: shop.stripeChargesEnabled,
                    stripePayoutsEnabled: shop.stripePayoutsEnabled,
                } : null
            };
            console.log('Account status check result:', {
                accountId: result.accountId,
                chargesEnabled: result.chargesEnabled,
                payoutsEnabled: result.payoutsEnabled,
                isVerified: result.isVerified,
                hasShop: !!shop
            });
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            console.error('Failed to check account status:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to check account status: ${error.message}`);
        }
    }
};
exports.StripeConnectController = StripeConnectController;
__decorate([
    (0, common_1.Post)('create-account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe Express account for shop' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stripe account created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Post)('onboarding-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create onboarding link for existing account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding link created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop or Stripe account not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "createOnboardingLink", null);
__decorate([
    (0, common_1.Post)('login-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create login link for Stripe Express Dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login link created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop or Stripe account not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "createLoginLink", null);
__decorate([
    (0, common_1.Post)('create-account-link/:accountId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create account link for any account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account link created successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "createAccountLink", null);
__decorate([
    (0, common_1.Get)('account-status/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account charges and payouts status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account status retrieved successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "getAccountStatus", null);
__decorate([
    (0, common_1.Get)('account-details'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe account details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop or Stripe account not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "getAccountDetails", null);
__decorate([
    (0, common_1.Post)('update-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop Stripe status from Stripe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop or Stripe account not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('onboarding-complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark shop as active when Stripe onboarding is complete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop marked as active successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "onboardingComplete", null);
__decorate([
    (0, common_1.Post)('delete-account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete Stripe Express account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop or Stripe account not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Post)('check-kyc'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check KYC status for a Stripe account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status checked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "checkKyc", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe Connect webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('force-complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Force complete Stripe setup (set all status to true)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stripe setup force completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "forceComplete", null);
__decorate([
    (0, common_1.Get)('check/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Stripe account status by account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid account ID or Stripe error' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StripeConnectController.prototype, "checkAccountStatus", null);
exports.StripeConnectController = StripeConnectController = __decorate([
    (0, swagger_1.ApiTags)('stripe-connect'),
    (0, common_1.Controller)('stripe-connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stripe_connect_service_1.StripeConnectService,
        shops_service_1.ShopsService])
], StripeConnectController);
//# sourceMappingURL=stripe-connect.controller.js.map