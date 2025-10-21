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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const create_setup_intent_dto_1 = require("./dto/create-setup-intent.dto");
const refund_payment_dto_1 = require("./dto/refund-payment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createPaymentIntent(createPaymentIntentDto) {
        try {
            const paymentIntent = await this.paymentsService.createPaymentIntent(createPaymentIntentDto);
            return {
                success: true,
                data: paymentIntent,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getPaymentIntent(intentId) {
        try {
            const paymentIntent = await this.paymentsService.getPaymentIntent(intentId);
            return {
                success: true,
                data: paymentIntent,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async confirmPaymentIntent(intentId) {
        try {
            const result = await this.paymentsService.confirmPaymentIntent(intentId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async cancelPaymentIntent(intentId) {
        try {
            const result = await this.paymentsService.cancelPaymentIntent(intentId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createSetupIntent(createSetupIntentDto) {
        try {
            const setupIntent = await this.paymentsService.createSetupIntent(createSetupIntentDto);
            return {
                success: true,
                data: setupIntent,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getCustomerPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.paymentsService.getCustomerPaymentMethods(customerId);
            return {
                success: true,
                data: paymentMethods,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async detachPaymentMethod(paymentMethodId) {
        try {
            await this.paymentsService.detachPaymentMethod(paymentMethodId);
            return {
                success: true,
                message: 'Payment method detached successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createRefund(refundPaymentDto) {
        try {
            const refund = await this.paymentsService.createRefund(refundPaymentDto);
            return {
                success: true,
                data: refund,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getRefund(refundId) {
        try {
            const refund = await this.paymentsService.getRefund(refundId);
            return {
                success: true,
                data: refund,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createConnectAccount(body) {
        try {
            const account = await this.paymentsService.createConnectAccount(body.shopId, body.userId);
            return {
                success: true,
                data: account,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getConnectAccount(accountId) {
        try {
            const account = await this.paymentsService.getConnectAccount(accountId);
            return {
                success: true,
                data: account,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createOnboardingLink(accountId) {
        try {
            const link = await this.paymentsService.createOnboardingLink(accountId);
            return {
                success: true,
                data: link,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createDashboardLink(accountId) {
        try {
            const link = await this.paymentsService.createDashboardLink(accountId);
            return {
                success: true,
                data: link,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async handleWebhook(rawBody, signature) {
        try {
            const result = await this.paymentsService.handleWebhook(rawBody, signature);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createCheckoutSession(body) {
        try {
            const session = await this.paymentsService.createCheckoutSession(body);
            return {
                success: true,
                data: session,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getCheckoutSession(sessionId) {
        try {
            const session = await this.paymentsService.getCheckoutSession(sessionId);
            return {
                success: true,
                data: session,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createSubscription(body) {
        try {
            const subscription = await this.paymentsService.createSubscription(body);
            return {
                success: true,
                data: subscription,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async cancelSubscription(subscriptionId, body) {
        try {
            const subscription = await this.paymentsService.cancelSubscription(subscriptionId, body.immediately);
            return {
                success: true,
                data: subscription,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAccountBalance(accountId) {
        try {
            const balance = await this.paymentsService.getAccountBalance(accountId);
            return {
                success: true,
                data: balance,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createPayout(accountId, body) {
        try {
            const payout = await this.paymentsService.createPayout(accountId, body.amount, body.currency);
            return {
                success: true,
                data: payout,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAllTransactions(page = 1, limit = 20, shopId) {
        try {
            const transactions = await this.paymentsService.getAllTransactions(page, limit, shopId);
            return {
                success: true,
                data: transactions,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getPaymentMetrics(period = 'month') {
        try {
            const metrics = await this.paymentsService.getPaymentMetrics(period);
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-payment-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment intent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Get)('payment-intents/:intentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment intent details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment intent not found' }),
    __param(0, (0, common_1.Param)('intentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentIntent", null);
__decorate([
    (0, common_1.Post)('payment-intents/:intentId/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm payment intent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment confirmation failed' }),
    __param(0, (0, common_1.Param)('intentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPaymentIntent", null);
__decorate([
    (0, common_1.Post)('payment-intents/:intentId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel payment intent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment cancellation failed' }),
    __param(0, (0, common_1.Param)('intentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelPaymentIntent", null);
__decorate([
    (0, common_1.Post)('create-setup-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create setup intent for saving payment method' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Setup intent created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_setup_intent_dto_1.CreateSetupIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSetupIntent", null);
__decorate([
    (0, common_1.Get)('customers/:customerId/payment-methods'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer payment methods' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment methods retrieved successfully' }),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCustomerPaymentMethods", null);
__decorate([
    (0, common_1.Delete)('payment-methods/:paymentMethodId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Detach payment method' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment method detached successfully' }),
    __param(0, (0, common_1.Param)('paymentMethodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "detachPaymentMethod", null);
__decorate([
    (0, common_1.Post)('refunds'),
    (0, swagger_1.ApiOperation)({ summary: 'Create refund' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Refund creation failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refund_payment_dto_1.RefundPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createRefund", null);
__decorate([
    (0, common_1.Get)('refunds/:refundId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get refund details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund not found' }),
    __param(0, (0, common_1.Param)('refundId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getRefund", null);
__decorate([
    (0, common_1.Post)('connect/create-account'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe Connect account for shop owner' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connect account created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createConnectAccount", null);
__decorate([
    (0, common_1.Get)('connect/accounts/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Connect account details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account details retrieved successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getConnectAccount", null);
__decorate([
    (0, common_1.Post)('connect/accounts/:accountId/onboard-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Create onboarding link for Connect account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding link created successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createOnboardingLink", null);
__decorate([
    (0, common_1.Post)('connect/accounts/:accountIddashboard-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Create dashboard link for Connect account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard link created successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createDashboardLink", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Stripe webhooks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiBody)({ type: 'string' }),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('checkout/create-session'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe checkout session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout session created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Get)('checkout/sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get checkout session details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout session retrieved successfully' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getCheckoutSession", null);
__decorate([
    (0, common_1.Post)('subscriptions/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:subscriptionId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel Stripe subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription cancelled successfully' }),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('connect/accounts/:accountId/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Connect account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance retrieved successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Post)('connect/accounts/:accountId/payout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payout for Connect account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payout created successfully' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayout", null);
__decorate([
    (0, common_1.Get)('admin/transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions (admin only)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Get)('admin/metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment metrics (admin only)' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentMetrics", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payment.controller.js.map