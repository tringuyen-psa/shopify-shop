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
exports.CheckoutController = void 0;
const common_1 = require("@nestjs/common");
const checkout_service_1 = require("./checkout.service");
const create_checkout_session_dto_1 = require("./dto/create-checkout-session.dto");
const save_information_dto_1 = require("./dto/save-information.dto");
const select_shipping_dto_1 = require("./dto/select-shipping.dto");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const swagger_1 = require("@nestjs/swagger");
let CheckoutController = class CheckoutController {
    constructor(checkoutService) {
        this.checkoutService = checkoutService;
    }
    async createCheckoutSession(createCheckoutSessionDto) {
        try {
            const session = await this.checkoutService.createSession(createCheckoutSessionDto);
            return {
                success: true,
                data: session,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getCheckoutSession(sessionId) {
        try {
            const session = await this.checkoutService.findBySessionId(sessionId);
            if (!session) {
                throw new common_1.NotFoundException('Checkout session not found');
            }
            if (new Date() > session.expiresAt) {
                throw new common_1.BadRequestException('Checkout session has expired');
            }
            return {
                success: true,
                data: session,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async saveInformation(sessionId, saveInformationDto) {
        try {
            const result = await this.checkoutService.saveInformation(sessionId, saveInformationDto);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async selectShipping(sessionId, selectShippingDto) {
        try {
            const result = await this.checkoutService.selectShipping(sessionId, selectShippingDto);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createPayment(sessionId, createPaymentDto) {
        try {
            const result = await this.checkoutService.createPayment(sessionId, createPaymentDto);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getCheckoutSummary(sessionId) {
        try {
            const summary = await this.checkoutService.getCheckoutSummary(sessionId);
            return {
                success: true,
                data: summary,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async expireSession(sessionId) {
        try {
            await this.checkoutService.expireSession(sessionId);
            return {
                success: true,
                message: 'Checkout session expired successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getPublicCheckoutData(sessionId) {
        try {
            const data = await this.checkoutService.getPublicCheckoutData(sessionId);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.CheckoutController = CheckoutController;
__decorate([
    (0, common_1.Post)('create-session'),
    (0, swagger_1.ApiOperation)({ summary: 'Create checkout session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Checkout session created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checkout_session_dto_1.CreateCheckoutSessionDto]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get checkout session by session ID' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout session retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found or expired' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getCheckoutSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/information'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Save customer information (Step 1)' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer information saved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data or session expired' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, save_information_dto_1.SaveInformationDto]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "saveInformation", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/shipping'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Select shipping method (Step 2)' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping method selected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid shipping rate or session expired' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, select_shipping_dto_1.SelectShippingDto]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "selectShipping", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/payment'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment session (Step 3)' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment session created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment failed or session expired' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get checkout summary with all details' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout summary retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getCheckoutSummary", null);
__decorate([
    (0, common_1.Patch)('sessions/:sessionId/expire'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Manually expire checkout session (admin use)' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session expired successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "expireSession", null);
__decorate([
    (0, common_1.Get)(':sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Public endpoint for checkout page (no auth required)' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Public session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Checkout data for public page' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found or expired' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CheckoutController.prototype, "getPublicCheckoutData", null);
exports.CheckoutController = CheckoutController = __decorate([
    (0, swagger_1.ApiTags)('checkout'),
    (0, common_1.Controller)('checkout'),
    __metadata("design:paramtypes", [checkout_service_1.CheckoutService])
], CheckoutController);
//# sourceMappingURL=checkout.controller.js.map