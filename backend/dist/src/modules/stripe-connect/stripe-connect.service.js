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
exports.StripeConnectService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
let StripeConnectService = class StripeConnectService {
    constructor(configService, shopRepository) {
        this.configService = configService;
        this.shopRepository = shopRepository;
        this.stripe = new stripe_1.default(this.configService.get("STRIPE_SECRET_KEY"), {
            apiVersion: "2023-10-16",
        });
    }
    async createExpressAccount(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException("Shop not found");
        }
        if (shop.stripeAccountId) {
            throw new common_1.BadRequestException("Shop already has a Stripe account");
        }
        try {
            const account = await this.stripe.accounts.create({
                type: "express",
                country: "US",
                email: shop.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: "individual",
                business_profile: {
                    name: shop.name,
                    url: shop.website || `https://your-platform.com/shops/${shop.slug}`,
                },
                metadata: {
                    shop_id: shop.id,
                },
            });
            await this.shopRepository.update(shopId, {
                stripeAccountId: account.id,
            });
            const frontendUrl = this.configService.get("FRONTEND_URL");
            const isLiveMode = this.configService.get("NODE_ENV") === "production" ||
                this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");
            const baseUrl = isLiveMode
                ? frontendUrl.replace(/^http:/, "https:")
                : frontendUrl;
            const onboardingLink = await this.stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${baseUrl}/shop/stripe/refresh`,
                return_url: `${baseUrl}/shop/stripe/complete`,
                type: "account_onboarding",
            });
            console.log(`Created Express account ${account.id} for shop ${shopId}`);
            return {
                accountId: account.id,
                onboardingUrl: onboardingLink.url,
            };
        }
        catch (error) {
            console.error("Failed to create Express account:", error);
            throw new common_1.BadRequestException("Failed to create Stripe Express account");
        }
    }
    async createAccountLoginLink(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        try {
            const loginLink = await this.stripe.accounts.createLoginLink(shop.stripeAccountId);
            return { loginUrl: loginLink.url };
        }
        catch (error) {
            console.error("Failed to create login link:", error);
            throw new common_1.BadRequestException("Failed to create account login link");
        }
    }
    async createOnboardingLink(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        try {
            const frontendUrl = this.configService.get("FRONTEND_URL");
            const isLiveMode = this.configService.get("NODE_ENV") === "production" ||
                this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");
            const baseUrl = isLiveMode
                ? frontendUrl.replace(/^http:/, "https:")
                : frontendUrl;
            const onboardingLink = await this.stripe.accountLinks.create({
                account: shop.stripeAccountId,
                refresh_url: `${baseUrl}/shop/stripe/refresh`,
                return_url: `${baseUrl}/shop/stripe/complete`,
                type: "account_onboarding",
            });
            return { onboardingUrl: onboardingLink.url };
        }
        catch (error) {
            console.error("Failed to create onboarding link:", error);
            throw new common_1.BadRequestException("Failed to create onboarding link");
        }
    }
    async getAccountDetails(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        try {
            const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);
            return account;
        }
        catch (error) {
            console.error("Failed to retrieve account details:", error);
            throw new common_1.BadRequestException("Failed to retrieve account details");
        }
    }
    async createAccountLink(accountId) {
        try {
            const frontendUrl = this.configService.get("FRONTEND_URL");
            const isLiveMode = this.configService.get("NODE_ENV") === "production" ||
                this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");
            const baseUrl = isLiveMode
                ? frontendUrl.replace(/^http:/, "https:")
                : frontendUrl;
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${baseUrl}/reauth`,
                return_url: `${baseUrl}/success`,
                type: "account_onboarding",
            });
            console.log("Onboarding link:", accountLink.url);
            return { url: accountLink.url };
        }
        catch (error) {
            console.error("Failed to create account link:", error);
            throw new common_1.BadRequestException("Failed to create account link");
        }
    }
    async getAccountDetailsByAccountId(accountId) {
        try {
            const account = await this.stripe.accounts.retrieve(accountId);
            return account;
        }
        catch (error) {
            console.error("Failed to retrieve account details by account ID:", error);
            if (error.type === 'StripeInvalidRequestError') {
                if (error.message.includes('No such account')) {
                    throw new common_1.NotFoundException(`Stripe account ${accountId} not found`);
                }
                throw new common_1.BadRequestException(`Invalid request: ${error.message}`);
            }
            if (error.type === 'StripeAuthenticationError') {
                throw new common_1.BadRequestException('Stripe authentication failed. Check your API keys.');
            }
            if (error.type === 'StripePermissionError') {
                throw new common_1.BadRequestException('Insufficient permissions to access this Stripe account.');
            }
            if (error.type === 'StripeRateLimitError') {
                throw new common_1.BadRequestException('Stripe API rate limit exceeded. Please try again later.');
            }
            if (error.type === 'StripeAPIError') {
                throw new common_1.BadRequestException('Stripe API error. Please try again later.');
            }
            if (error.type === 'StripeConnectionError') {
                throw new common_1.BadRequestException('Failed to connect to Stripe. Please check your network connection.');
            }
            throw new common_1.BadRequestException(`Failed to retrieve account details: ${error.message || 'Unknown error'}`);
        }
    }
    async getAccountStatus(accountId) {
        try {
            const account = await this.stripe.accounts.retrieve(accountId);
            console.log(account.charges_enabled, account.payouts_enabled);
            return {
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
            };
        }
        catch (error) {
            console.error("Failed to retrieve account:", error);
            throw new common_1.BadRequestException("Failed to retrieve account status");
        }
    }
    async updateShopStripeStatus(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        try {
            const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);
            const updateData = {
                stripeChargesEnabled: account.charges_enabled,
                stripePayoutsEnabled: account.payouts_enabled,
                stripeOnboardingComplete: account.charges_enabled && account.payouts_enabled,
            };
            await this.shopRepository.update(shopId, updateData);
            console.log(`Updated Stripe status for shop ${shopId}:`, updateData);
            return await this.shopRepository.findOne({ where: { id: shopId } });
        }
        catch (error) {
            console.error("Failed to update shop Stripe status:", error);
            throw new common_1.BadRequestException("Failed to update shop Stripe status");
        }
    }
    async handleAccountUpdated(accountId) {
        const shop = await this.shopRepository.findOne({
            where: { stripeAccountId: accountId },
        });
        if (!shop) {
            console.log(`No shop found for Stripe account ${accountId}`);
            return;
        }
        await this.updateShopStripeStatus(shop.id);
    }
    async createDirectCharge(shopId, amount, paymentMethodId, metadata) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        if (!shop.stripeChargesEnabled) {
            throw new common_1.BadRequestException("Shop cannot receive payments yet");
        }
        try {
            const platformFeePercent = shop.platformFeePercent || 15;
            const platformFee = Math.round((amount * platformFeePercent) / 100);
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: "usd",
                payment_method: paymentMethodId,
                confirm: true,
                transfer_data: {
                    destination: shop.stripeAccountId,
                },
                application_fee_amount: platformFee,
                metadata: {
                    shopId: shopId,
                    ...metadata,
                },
            });
            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
            };
        }
        catch (error) {
            console.error("Failed to create direct charge:", error);
            throw new common_1.BadRequestException("Failed to create payment");
        }
    }
    async deleteStripeAccount(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.stripeAccountId) {
            throw new common_1.NotFoundException("Shop does not have a Stripe account");
        }
        try {
            await this.stripe.accounts.del(shop.stripeAccountId);
            await this.shopRepository.update(shopId, {
                stripeAccountId: null,
                stripeOnboardingComplete: false,
                stripeChargesEnabled: false,
                stripePayoutsEnabled: false,
            });
            console.log(`Deleted Stripe account ${shop.stripeAccountId} for shop ${shopId}`);
        }
        catch (error) {
            console.error("Failed to delete Stripe account:", error);
            throw new common_1.BadRequestException("Failed to delete Stripe account");
        }
    }
    async forceCompleteStripeSetup(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException("Shop not found");
        }
        const updatedShop = await this.shopRepository.save({
            ...shop,
            stripeOnboardingComplete: true,
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true,
            isActive: true,
            status: "active",
        });
        console.log(`Force completed Stripe setup for shop ${shopId}`);
        return updatedShop;
    }
};
exports.StripeConnectService = StripeConnectService;
exports.StripeConnectService = StripeConnectService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], StripeConnectService);
//# sourceMappingURL=stripe-connect.service.js.map