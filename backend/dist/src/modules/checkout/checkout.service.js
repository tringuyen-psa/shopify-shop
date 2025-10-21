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
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const date_fns_1 = require("date-fns");
const stripe_1 = require("stripe");
const checkout_session_entity_1 = require("./entities/checkout-session.entity");
const products_service_1 = require("../products/products.service");
const shipping_service_1 = require("../shipping/shipping.service");
let CheckoutService = class CheckoutService {
    constructor(checkoutSessionRepository, productsService, shippingService, configService) {
        this.checkoutSessionRepository = checkoutSessionRepository;
        this.productsService = productsService;
        this.shippingService = shippingService;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async createSession(createCheckoutSessionDto) {
        const { productId, billingCycle, quantity = 1 } = createCheckoutSessionDto;
        const product = await this.productsService.findById(productId);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.isActive) {
            throw new common_1.BadRequestException('Product is not available');
        }
        if (!product.shop.isActive || !product.shop.stripeChargesEnabled) {
            throw new common_1.BadRequestException('Shop is not able to receive payments');
        }
        const productPrice = this.calculateProductPrice(product, billingCycle);
        const sessionId = this.generateSessionId();
        const expiresAt = (0, date_fns_1.addHours)(new Date(), 24);
        const checkoutSession = await this.checkoutSessionRepository.save({
            sessionId,
            productId: product.id,
            shopId: product.shopId,
            billingCycle,
            productPrice,
            totalAmount: productPrice * quantity,
            currentStep: 1,
            status: 'pending',
            expiresAt,
        });
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const checkoutUrl = `${frontendUrl}/checkout/${sessionId}`;
        return {
            sessionId,
            checkoutUrl,
            expiresAt: checkoutSession.expiresAt,
        };
    }
    async findBySessionId(sessionId) {
        return await this.checkoutSessionRepository.findOne({
            where: { sessionId },
            relations: ['product', 'shop', 'shippingRate'],
        });
    }
    async saveInformation(sessionId, saveInformationDto) {
        const session = await this.validateCheckoutSession(sessionId);
        await this.checkoutSessionRepository.update(session.id, {
            email: saveInformationDto.email,
            customerName: saveInformationDto.name,
            phone: saveInformationDto.phone,
            shippingAddressLine1: saveInformationDto.shippingAddress.line1,
            shippingAddressLine2: saveInformationDto.shippingAddress.line2,
            shippingCity: saveInformationDto.shippingAddress.city,
            shippingState: saveInformationDto.shippingAddress.state,
            shippingCountry: saveInformationDto.shippingAddress.country,
            shippingPostalCode: saveInformationDto.shippingAddress.postalCode,
            customerNote: saveInformationDto.note,
            currentStep: session.product.requiresShipping ? 2 : 3,
        });
        return {
            nextStep: session.product.requiresShipping ? 2 : 3,
            requiresShipping: session.product.requiresShipping,
        };
    }
    async selectShipping(sessionId, selectShippingDto) {
        const session = await this.validateCheckoutSession(sessionId);
        if (!session.product.requiresShipping) {
            throw new common_1.BadRequestException('This product does not require shipping');
        }
        const shippingRate = await this.shippingService.findRateById(selectShippingDto.shippingRateId);
        if (!shippingRate) {
            throw new common_1.NotFoundException('Shipping rate not found');
        }
        const totalAmount = session.productPrice + shippingRate.price;
        await this.checkoutSessionRepository.update(session.id, {
            shippingRateId: shippingRate.id,
            shippingMethodName: shippingRate.name,
            shippingCost: shippingRate.price,
            totalAmount,
            currentStep: 3,
        });
        return {
            shippingCost: shippingRate.price,
            totalAmount,
            nextStep: 3,
        };
    }
    async createPayment(sessionId, createPaymentDto) {
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product', 'shop', 'shippingRate'],
        });
        if (session.currentStep !== 3) {
            throw new common_1.BadRequestException('Please complete previous steps first');
        }
        const productPrice = this.calculateProductPrice(session.product, session.billingCycle);
        const shippingCost = session.shippingRate?.price || 0;
        const platformFee = Math.round(productPrice * 0.15 * 100);
        const totalAmount = Math.round((productPrice + shippingCost + platformFee) * 100);
        try {
            const stripeCheckoutSession = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: session.product.name,
                                description: session.product.description || `Product from ${session.product.shop.name}`,
                                images: session.product.images.slice(0, 1),
                            },
                            unit_amount: Math.round(productPrice * 100),
                        },
                        quantity: 1,
                    },
                    ...(shippingCost > 0 ? [{
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: 'Shipping',
                                    description: session.shippingRate?.name || 'Standard Shipping',
                                },
                                unit_amount: Math.round(shippingCost * 100),
                            },
                            quantity: 1,
                        }] : []),
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Platform Fee',
                                description: 'Platform service fee (15%)',
                            },
                            unit_amount: platformFee,
                        },
                        quantity: 1,
                    },
                ],
                customer_email: session.email,
                success_url: `${this.configService.get('FRONTEND_URL')}/checkout/success?session_id=${sessionId}`,
                cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout/cancel?session_id=${sessionId}`,
                metadata: {
                    checkoutSessionId: sessionId,
                    productId: session.product.id,
                    shopId: session.product.shop.id,
                    billingCycle: session.billingCycle,
                },
            });
            await this.checkoutSessionRepository.update(session.id, {
                stripeCheckoutSessionId: stripeCheckoutSession.id,
            });
            return {
                stripeCheckoutUrl: stripeCheckoutSession.url,
                paymentMethod: createPaymentDto.paymentMethod,
            };
        }
        catch (error) {
            console.error('Stripe checkout session creation failed:', error);
            throw new common_1.BadRequestException('Failed to create payment session. Please try again.');
        }
    }
    async getCheckoutSummary(sessionId) {
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product', 'shop', 'shippingRate'],
        });
        return {
            sessionId: session.sessionId,
            product: {
                id: session.product.id,
                name: session.product.name,
                description: session.product.description,
                images: session.product.images,
                price: session.productPrice,
                requiresShipping: session.product.requiresShipping,
            },
            shop: {
                id: session.shop.id,
                name: session.shop.name,
                slug: session.shop.slug,
                logo: session.shop.logo,
            },
            customer: {
                email: session.email,
                name: session.customerName,
                phone: session.phone,
            },
            shipping: session.shippingRate ? {
                method: session.shippingMethodName,
                cost: session.shippingCost,
                deliveryTime: `${session.shippingRate.minDeliveryDays}-${session.shippingRate.maxDeliveryDays} days`,
            } : null,
            pricing: {
                productPrice: session.productPrice,
                shippingCost: session.shippingCost || 0,
                totalAmount: session.totalAmount,
                discountAmount: session.discountAmount || 0,
            },
            billing: {
                cycle: session.billingCycle,
            },
            status: session.status,
            currentStep: session.currentStep,
            expiresAt: session.expiresAt,
        };
    }
    async getPublicCheckoutData(sessionId) {
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product', 'shop'],
        });
        return {
            sessionId: session.sessionId,
            product: {
                id: session.product.id,
                name: session.product.name,
                description: session.product.description,
                images: session.product.images,
                price: session.productPrice,
                requiresShipping: session.product.requiresShipping,
                type: session.product.productType,
            },
            shop: {
                name: session.shop.name,
                slug: session.shop.slug,
                logo: session.shop.logo,
            },
            billing: {
                cycle: session.billingCycle,
            },
            currentStep: session.currentStep,
            expiresAt: session.expiresAt,
        };
    }
    async expireSession(sessionId) {
        const session = await this.validateCheckoutSession(sessionId);
        await this.checkoutSessionRepository.update(session.id, {
            status: 'expired',
        });
    }
    async completeCheckoutSession(sessionId, paymentData) {
        const session = await this.validateCheckoutSession(sessionId);
        await this.checkoutSessionRepository.update(session.id, {
            status: 'completed',
            stripeCheckoutSessionId: paymentData.stripeSessionId,
        });
        return await this.validateCheckoutSession(sessionId);
    }
    async validateCheckoutSession(sessionId, options) {
        const session = await this.checkoutSessionRepository.findOne({
            where: { sessionId },
            relations: options?.relations,
        });
        if (!session) {
            throw new common_1.NotFoundException('Checkout session not found');
        }
        if (new Date() > session.expiresAt) {
            throw new common_1.BadRequestException('Checkout session has expired');
        }
        if (session.status === 'completed') {
            throw new common_1.BadRequestException('Checkout session already completed');
        }
        return session;
    }
    calculateProductPrice(product, billingCycle) {
        switch (billingCycle) {
            case 'weekly':
                return product.weeklyPrice || product.basePrice;
            case 'monthly':
                return product.monthlyPrice || product.basePrice;
            case 'yearly':
                return product.yearlyPrice || product.basePrice;
            case 'one_time':
            default:
                return product.basePrice;
        }
    }
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `cs_${timestamp}_${random}`;
    }
    async cleanupExpiredSessions() {
        const expiredSessions = await this.checkoutSessionRepository.find({
            where: {
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
                status: 'pending',
            },
        });
        if (expiredSessions.length > 0) {
            const sessionIds = expiredSessions.map(s => s.id);
            await this.checkoutSessionRepository
                .createQueryBuilder()
                .update(checkout_session_entity_1.CheckoutSession)
                .set({ status: 'expired' })
                .where('id IN (:...sessionIds)', { sessionIds })
                .execute();
        }
        return expiredSessions.length;
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(checkout_session_entity_1.CheckoutSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        products_service_1.ProductsService,
        shipping_service_1.ShippingService,
        config_1.ConfigService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map