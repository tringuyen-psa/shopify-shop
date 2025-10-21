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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const checkout_session_entity_1 = require("../checkout/entities/checkout-session.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const date_fns_1 = require("date-fns");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(configService, shopRepository, checkoutSessionRepository, orderRepository, subscriptionRepository) {
        this.configService = configService;
        this.shopRepository = shopRepository;
        this.checkoutSessionRepository = checkoutSessionRepository;
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async createPaymentIntent(createPaymentIntentDto) {
        const { amount, currency = 'usd', customerId, metadata, paymentMethodId } = createPaymentIntentDto;
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                customer: customerId,
                metadata: metadata || {},
                payment_method: paymentMethodId,
                confirm: paymentMethodId ? true : false,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Failed to create payment intent: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create payment intent: ${error.message}`);
        }
    }
    async getPaymentIntent(intentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(intentId);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve payment intent: ${error.message}`, error);
            throw new common_1.NotFoundException(`Payment intent not found: ${error.message}`);
        }
    }
    async confirmPaymentIntent(intentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(intentId);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Failed to confirm payment intent: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to confirm payment: ${error.message}`);
        }
    }
    async cancelPaymentIntent(intentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.cancel(intentId);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Failed to cancel payment intent: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to cancel payment: ${error.message}`);
        }
    }
    async createSetupIntent(createSetupIntentDto) {
        const { customerId, paymentMethodTypes = ['card'] } = createSetupIntentDto;
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: paymentMethodTypes,
            });
            return setupIntent;
        }
        catch (error) {
            this.logger.error(`Failed to create setup intent: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create setup intent: ${error.message}`);
        }
    }
    async getCustomerPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });
            return paymentMethods.data;
        }
        catch (error) {
            this.logger.error(`Failed to get payment methods: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to get payment methods: ${error.message}`);
        }
    }
    async detachPaymentMethod(paymentMethodId) {
        try {
            await this.stripe.paymentMethods.detach(paymentMethodId);
        }
        catch (error) {
            this.logger.error(`Failed to detach payment method: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to detach payment method: ${error.message}`);
        }
    }
    async createRefund(refundPaymentDto) {
        const { paymentIntentId, amount, reason = 'requested_by_customer' } = refundPaymentDto;
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason,
            });
            return refund;
        }
        catch (error) {
            this.logger.error(`Failed to create refund: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create refund: ${error.message}`);
        }
    }
    async getRefund(refundId) {
        try {
            const refund = await this.stripe.refunds.retrieve(refundId);
            return refund;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve refund: ${error.message}`, error);
            throw new common_1.NotFoundException(`Refund not found: ${error.message}`);
        }
    }
    async createConnectAccount(shopId, userId) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { id: shopId, ownerId: userId },
                relations: ['owner'],
            });
            if (!shop) {
                throw new common_1.NotFoundException('Shop not found or access denied');
            }
            let account;
            const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                !process.env.STRIPE_CONNECT_ENABLED;
            if (isDevelopmentMode) {
                this.logger.warn(`Creating mock Stripe Connect account for shop ${shopId} in development mode`);
                account = {
                    id: `acct_mock_${shopId.substring(0, 8)}`,
                    charges_enabled: false,
                    payouts_enabled: false,
                    requirements: {
                        currently_due: ['identity_document', 'company_verification'],
                    },
                    metadata: {
                        shopId,
                        userId,
                        isMock: 'true',
                    },
                };
                this.logger.log(`Created mock Stripe Connect account ${account.id} for shop ${shopId}`);
            }
            else {
                account = await this.stripe.accounts.create({
                    type: 'express',
                    country: 'US',
                    email: shop.email || shop.owner?.email || 'shop@example.com',
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                    business_profile: {
                        name: shop.name,
                        product_description: shop.description || 'E-commerce platform shop',
                        url: shop.website || undefined,
                        support_email: shop.email || shop.owner?.email,
                        support_phone: shop.phone || undefined,
                    },
                    metadata: {
                        shopId,
                        userId,
                    },
                });
                this.logger.log(`Created Stripe Connect account ${account.id} for shop ${shopId}`);
            }
            await this.shopRepository.update(shopId, {
                stripeAccountId: account.id,
            });
            this.logger.log(`Created Stripe Connect account ${account.id} for shop ${shopId}`);
            return account;
        }
        catch (error) {
            this.logger.error(`Failed to create Connect account: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create Connect account: ${error.message}`);
        }
    }
    async getConnectAccount(accountId) {
        try {
            const account = await this.stripe.accounts.retrieve(accountId);
            return account;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve Connect account: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to retrieve Connect account: ${error.message}`);
        }
    }
    async createOnboardingLink(accountId) {
        try {
            const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                !process.env.STRIPE_CONNECT_ENABLED ||
                accountId.startsWith('acct_mock_');
            if (isDevelopmentMode) {
                this.logger.warn(`Creating mock onboarding link for account ${accountId}`);
                const mockUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/shop/onboarding/complete?mock=true`;
                return {
                    url: mockUrl,
                    created: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
            }
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/onboarding/refresh`,
                return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/onboarding/complete`,
                type: 'account_onboarding',
            });
            this.logger.log(`Created onboarding link for account ${accountId}`);
            return accountLink;
        }
        catch (error) {
            this.logger.error(`Failed to create onboarding link: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create onboarding link: ${error.message}`);
        }
    }
    async createKYCLink(accountId) {
        try {
            const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                !process.env.STRIPE_CONNECT_ENABLED ||
                accountId.startsWith('acct_mock_');
            if (isDevelopmentMode) {
                this.logger.warn(`Creating mock KYC link for account ${accountId}`);
                const mockUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/complete?mock=true`;
                return {
                    url: mockUrl,
                    created: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
            }
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/refresh`,
                return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/complete`,
                type: 'account_onboarding',
            });
            this.logger.log(`Created KYC verification link for account ${accountId}`);
            return accountLink;
        }
        catch (error) {
            this.logger.error(`Failed to create KYC link: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create KYC verification link: ${error.message}`);
        }
    }
    async updateAccountStatus(accountId) {
        try {
            const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                !process.env.STRIPE_CONNECT_ENABLED ||
                accountId.startsWith('acct_mock_');
            let chargesEnabled = false;
            let payoutsEnabled = false;
            let onboardingComplete = false;
            if (isDevelopmentMode) {
                this.logger.warn(`Updating mock account status for ${accountId}`);
                const random = Math.random();
                chargesEnabled = random > 0.3;
                payoutsEnabled = random > 0.5;
                onboardingComplete = random > 0.4;
            }
            else {
                const account = await this.stripe.accounts.retrieve(accountId);
                chargesEnabled = account.charges_enabled;
                payoutsEnabled = account.payouts_enabled;
                onboardingComplete = account.requirements?.currently_due.length === 0;
            }
            await this.shopRepository.update({ stripeAccountId: accountId }, {
                stripeChargesEnabled: chargesEnabled,
                stripePayoutsEnabled: payoutsEnabled,
                stripeOnboardingComplete: onboardingComplete,
            });
            this.logger.log(`Updated account status for ${accountId}: charges_enabled=${chargesEnabled}, payouts_enabled=${payoutsEnabled}`);
        }
        catch (error) {
            this.logger.error(`Failed to update account status: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to update account status: ${error.message}`);
        }
    }
    async createDashboardLink(accountId) {
        try {
            const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                !process.env.STRIPE_CONNECT_ENABLED ||
                accountId.startsWith('acct_mock_');
            if (isDevelopmentMode) {
                this.logger.warn(`Creating mock dashboard link for account ${accountId}`);
                return {
                    url: 'https://dashboard.stripe.com/mock/dashboard',
                    created: new Date().toISOString(),
                };
            }
            const loginLink = await this.stripe.accounts.createLoginLink(accountId);
            return loginLink;
        }
        catch (error) {
            this.logger.error(`Failed to create dashboard link: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create dashboard link: ${error.message}`);
        }
    }
    async createCheckoutSession(body) {
        const { productId, customerId, successUrl, cancelUrl, billingCycle } = body;
        try {
            const productPrice = 1000;
            const productName = 'Product Name';
            const sessionParams = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: productName,
                            },
                            unit_amount: productPrice,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    productId,
                },
            };
            if (customerId) {
                sessionParams.customer = customerId;
            }
            const session = await this.stripe.checkout.sessions.create(sessionParams);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to create checkout session: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create checkout session: ${error.message}`);
        }
    }
    async getCheckoutSession(sessionId) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve checkout session: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to retrieve checkout session: ${error.message}`);
        }
    }
    async createSubscription(body) {
        const { customerId, priceId, trialDays, paymentMethodId } = body;
        try {
            const subscriptionParams = {
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
            };
            if (trialDays) {
                subscriptionParams.trial_period_days = trialDays;
            }
            if (paymentMethodId) {
                subscriptionParams.default_payment_method = paymentMethodId;
            }
            const subscription = await this.stripe.subscriptions.create(subscriptionParams);
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to create subscription: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create subscription: ${error.message}`);
        }
    }
    async cancelSubscription(subscriptionId, immediately = false) {
        try {
            let subscription;
            if (immediately) {
                subscription = await this.stripe.subscriptions.cancel(subscriptionId);
            }
            else {
                subscription = await this.stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true,
                });
            }
            return subscription;
        }
        catch (error) {
            this.logger.error(`Failed to cancel subscription: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to cancel subscription: ${error.message}`);
        }
    }
    async getAccountBalance(accountId) {
        try {
            const balance = await this.stripe.balance.retrieve({ stripeAccount: accountId });
            return balance;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve account balance: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to retrieve account balance: ${error.message}`);
        }
    }
    async createPayout(accountId, amount, currency = 'usd') {
        try {
            const payout = await this.stripe.payouts.create({
                amount: Math.round(amount * 100),
                currency,
            }, { stripeAccount: accountId });
            return payout;
        }
        catch (error) {
            this.logger.error(`Failed to create payout: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to create payout: ${error.message}`);
        }
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error.message}`, error);
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${error.message}`);
        }
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'checkout.session.completed':
                    await this.handleCheckoutCompleted(event.data.object);
                    break;
                case 'invoice.paid':
                    await this.handleInvoicePaid(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }
            return { received: true, type: event.type };
        }
        catch (error) {
            this.logger.error(`Error processing webhook ${event.type}: ${error.message}`, error);
            throw new common_1.BadRequestException(`Error processing webhook: ${error.message}`);
        }
    }
    async handlePaymentSucceeded(paymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
        if (paymentIntent.metadata.checkoutSessionId) {
            await this.updateCheckoutSessionPayment(paymentIntent.metadata.checkoutSessionId, paymentIntent);
        }
    }
    async handlePaymentFailed(paymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
    }
    async handleCheckoutCompleted(session) {
        this.logger.log(`Checkout completed: ${session.id}`);
    }
    async handleInvoicePaid(invoice) {
        this.logger.log(`Invoice paid: ${invoice.id}`);
    }
    async handleInvoicePaymentFailed(invoice) {
        this.logger.log(`Invoice payment failed: ${invoice.id}`);
    }
    async handleSubscriptionCreated(subscription) {
        this.logger.log(`Subscription created: ${subscription.id}`);
    }
    async handleSubscriptionDeleted(subscription) {
        this.logger.log(`Subscription deleted: ${subscription.id}`);
    }
    async handleAccountUpdated(account) {
        this.logger.log(`Account updated: ${account.id}`);
        if (account.metadata?.shopId) {
            await this.updateShopAccountStatus(account.metadata.shopId, account);
        }
    }
    async updateCheckoutSessionPayment(checkoutSessionId, paymentIntent) {
        try {
            await this.checkoutSessionRepository.update({ sessionId: checkoutSessionId }, {
                status: 'completed',
                stripeCheckoutSessionId: paymentIntent.id,
                paymentIntentId: paymentIntent.id,
            });
        }
        catch (error) {
            this.logger.error(`Failed to update checkout session: ${error.message}`, error);
        }
    }
    async updateShopAccountStatus(shopId, account) {
        try {
            const updateData = {
                stripeChargesEnabled: account.charges_enabled,
                stripePayoutsEnabled: account.payouts_enabled,
            };
            if (account.requirements?.currently_due?.length === 0) {
                updateData.stripeOnboardingComplete = true;
            }
            await this.shopRepository.update(shopId, updateData);
        }
        catch (error) {
            this.logger.error(`Failed to update shop account status: ${error.message}`, error);
        }
    }
    async getAllTransactions(page = 1, limit = 20, shopId) {
        try {
            const params = {
                limit,
            };
            let stripeClient = this.stripe;
            if (shopId) {
                const shop = await this.shopRepository.findOne({ where: { id: shopId } });
                if (shop?.stripeAccountId) {
                    stripeClient = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
                        apiVersion: '2023-10-16',
                        stripeAccount: shop.stripeAccountId,
                    });
                }
            }
            const paymentIntents = await stripeClient.paymentIntents.list(params);
            return {
                transactions: paymentIntents.data,
                hasMore: paymentIntents.has_more,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transactions: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to get transactions: ${error.message}`);
        }
    }
    async getPaymentMetrics(period = 'month') {
        const now = new Date();
        let startDate;
        switch (period) {
            case 'today':
                startDate = (0, date_fns_1.startOfDay)(now);
                break;
            case 'week':
                startDate = (0, date_fns_1.subDays)(now, 7);
                break;
            case 'month':
                startDate = (0, date_fns_1.startOfMonth)(now);
                break;
            default:
                startDate = (0, date_fns_1.subDays)(now, 30);
        }
        try {
            const paymentIntents = await this.stripe.paymentIntents.list({
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                },
                limit: 100,
            });
            const totalAmount = paymentIntents.data
                .filter(intent => intent.status === 'succeeded')
                .reduce((sum, intent) => sum + intent.amount, 0);
            const totalTransactions = paymentIntents.data.length;
            const successfulTransactions = paymentIntents.data.filter(intent => intent.status === 'succeeded').length;
            return {
                totalAmount: totalAmount / 100,
                totalTransactions,
                successfulTransactions,
                successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
                period,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get payment metrics: ${error.message}`, error);
            throw new common_1.BadRequestException(`Failed to get payment metrics: ${error.message}`);
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(checkout_session_entity_1.CheckoutSession)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map