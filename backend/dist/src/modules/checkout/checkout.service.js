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
const shop_entity_1 = require("../shops/entities/shop.entity");
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
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product'],
        });
        if (!session.product) {
            session.product = await this.productsService.findById(session.productId);
        }
        if (!session.product) {
            throw new common_1.NotFoundException('Product not found for this checkout session');
        }
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
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product'],
        });
        if (!session.product) {
            session.product = await this.productsService.findById(session.productId);
        }
        if (!session.product) {
            throw new common_1.NotFoundException('Product not found for this checkout session');
        }
        if (!session.product.requiresShipping) {
            throw new common_1.BadRequestException('This product does not require shipping');
        }
        let shippingRate;
        if (selectShippingDto.shippingRateId.startsWith('00000000-0000-0000-0000-000000000')) {
            const defaultRates = {
                '00000000-0000-0000-0000-000000000001': { name: 'Standard Shipping', price: 9.99 },
                '00000000-0000-0000-0000-000000000002': { name: 'Express Shipping', price: 19.99 }
            };
            shippingRate = defaultRates[selectShippingDto.shippingRateId];
            if (!shippingRate) {
                throw new common_1.NotFoundException('Default shipping rate not found');
            }
        }
        else {
            shippingRate = await this.shippingService.findRateById(selectShippingDto.shippingRateId);
            if (!shippingRate) {
                throw new common_1.NotFoundException('Shipping rate not found');
            }
        }
        const productPrice = typeof session.productPrice === 'string' ? parseFloat(session.productPrice) : session.productPrice;
        const shippingCost = typeof shippingRate.price === 'string' ? parseFloat(shippingRate.price) : shippingRate.price;
        const totalAmount = productPrice + shippingCost;
        console.log('Price calculation:', {
            productPrice,
            shippingCost,
            totalAmount,
            productPriceType: typeof session.productPrice,
            shippingRatePriceType: typeof shippingRate.price
        });
        await this.checkoutSessionRepository.update(session.id, {
            shippingRateId: shippingRate.id,
            shippingMethodName: shippingRate.name,
            shippingCost: shippingCost,
            totalAmount: totalAmount,
            currentStep: 3,
        });
        return {
            shippingCost: shippingCost,
            totalAmount: totalAmount,
            nextStep: 3,
        };
    }
    async createPaymentIntent(createPaymentIntentDto) {
        const { sessionId, paymentMethodId, amount, stripeAccountId } = createPaymentIntentDto;
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product', 'shop'],
        });
        if (!session.product) {
            session.product = await this.productsService.findById(session.productId);
        }
        if (!session.shop) {
            session.shop = await this.checkoutSessionRepository.manager.findOne(shop_entity_1.Shop, {
                where: { id: session.shopId }
            });
        }
        if (!session.product) {
            throw new common_1.NotFoundException('Product not found for this checkout session');
        }
        if (!session.shop) {
            throw new common_1.NotFoundException('Shop not found for this checkout session');
        }
        if (session.currentStep < 2) {
            console.log(`Payment intent attempted for session ${sessionId} at step ${session.currentStep}, but requires step 2 or higher`);
            throw new common_1.BadRequestException('Please complete the information step first before proceeding to payment');
        }
        try {
            const paymentIntentParams = {
                amount: amount,
                currency: 'usd',
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: true,
                return_url: `${this.configService.get('FRONTEND_URL')}/checkout/${sessionId}`,
                metadata: {
                    checkoutSessionId: sessionId,
                    productId: session.product.id,
                    shopId: session.product.shop.id,
                    billingCycle: session.billingCycle,
                },
            };
            let shopStripeAccountId = stripeAccountId;
            if (stripeAccountId) {
                const shopWithSession = await this.checkoutSessionRepository
                    .createQueryBuilder('session')
                    .leftJoinAndSelect('session.shop', 'shop')
                    .where('session.sessionId = :sessionId', { sessionId })
                    .getOne();
                if (shopWithSession?.shop && !shopWithSession.shop.stripeChargesEnabled) {
                    console.log('Shop has Stripe account but charges not enabled, using platform account');
                    shopStripeAccountId = null;
                }
                else if (shopWithSession?.shop) {
                    console.log('Using Stripe connected account for payment intent:', stripeAccountId);
                }
            }
            if (shopStripeAccountId) {
                paymentIntentParams.application_fee_amount = Math.round(amount * 0.15);
                paymentIntentParams.transfer_data = {
                    destination: shopStripeAccountId,
                };
            }
            const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);
            await this.checkoutSessionRepository.update(session.id, {
                stripePaymentIntentId: paymentIntent.id,
                currentStep: 4,
                status: 'processing',
            });
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        }
        catch (error) {
            console.error('Stripe payment intent creation failed:', error);
            throw new common_1.BadRequestException(`Failed to create payment: ${error.message}`);
        }
    }
    async createPayment(sessionId, createPaymentDto) {
        const session = await this.validateCheckoutSession(sessionId, {
            relations: ['product', 'shop', 'shippingRate'],
        });
        if (!session.product) {
            session.product = await this.productsService.findById(session.productId);
        }
        if (!session.shop) {
            session.shop = await this.checkoutSessionRepository.manager.findOne(shop_entity_1.Shop, {
                where: { id: session.shopId }
            });
        }
        if (!session.product) {
            throw new common_1.NotFoundException('Product not found for this checkout session');
        }
        if (!session.shop) {
            throw new common_1.NotFoundException('Shop not found for this checkout session');
        }
        if (session.currentStep < 2) {
            console.log(`Payment attempted for session ${sessionId} at step ${session.currentStep}, but requires step 2 or higher`);
            console.log('Session details:', {
                sessionId: session.sessionId,
                currentStep: session.currentStep,
                email: session.email,
                customerName: session.customerName,
                productRequiresShipping: session.product?.requiresShipping
            });
            throw new common_1.BadRequestException('Please complete the information step first before proceeding to payment');
        }
        const productPrice = this.calculateProductPrice(session.product, session.billingCycle);
        let shippingCost = 0;
        if (session.shippingRateId?.startsWith('00000000-0000-0000-0000-000000000')) {
            const defaultRates = {
                '00000000-0000-0000-0000-000000000001': 9.99,
                '00000000-0000-0000-0000-000000000002': 19.99
            };
            shippingCost = defaultRates[session.shippingRateId] || 0;
        }
        else {
            shippingCost = typeof session.shippingRate?.price === 'string'
                ? parseFloat(session.shippingRate.price)
                : (session.shippingRate?.price || 0);
        }
        const numericProductPrice = typeof productPrice === 'string' ? parseFloat(productPrice) : productPrice;
        const numericShippingCost = typeof shippingCost === 'string' ? parseFloat(shippingCost) : shippingCost;
        const platformFeeCents = Math.round(numericProductPrice * 0.15 * 100);
        const totalAmountCents = Math.round(numericProductPrice * 100) + Math.round(numericShippingCost * 100) + platformFeeCents;
        const totalAmountDollars = totalAmountCents / 100;
        console.log('Payment calculation:', {
            productPrice: numericProductPrice,
            shippingCost: numericShippingCost,
            platformFeeCents,
            totalAmountCents,
            totalAmountDollars,
            originalTypes: {
                productPrice: typeof productPrice,
                shippingCost: typeof shippingCost,
                sessionShippingRatePrice: session.shippingRate?.price,
                sessionShippingRatePriceType: typeof session.shippingRate?.price
            }
        });
        if (totalAmountCents <= 0) {
            throw new common_1.BadRequestException('Invalid total amount calculated');
        }
        await this.checkoutSessionRepository.update(session.id, {
            currentStep: 4,
            shippingCost: numericShippingCost,
            totalAmount: totalAmountDollars,
        });
        try {
            if (createPaymentDto.paymentMethod === 'stripe_popup') {
                const checkoutParams = {
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
                                unit_amount: Math.round(numericProductPrice * 100),
                            },
                            quantity: 1,
                        },
                        ...(numericShippingCost > 0 ? [{
                                price_data: {
                                    currency: 'usd',
                                    product_data: {
                                        name: 'Shipping',
                                        description: session.shippingRate?.name || 'Standard Shipping',
                                    },
                                    unit_amount: Math.round(numericShippingCost * 100),
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
                                unit_amount: platformFeeCents,
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
                };
                if (session.shop.stripeAccountId && session.shop.stripeChargesEnabled) {
                    console.log('Using Stripe connected account:', session.shop.stripeAccountId);
                    checkoutParams.payment_intent_data = {
                        application_fee_amount: platformFeeCents,
                        transfer_data: {
                            destination: session.shop.stripeAccountId,
                        },
                    };
                }
                else if (session.shop.stripeAccountId) {
                    console.log('Shop has Stripe account but charges not enabled, using platform account');
                }
                else {
                    console.log('Shop does not have Stripe account, using platform account');
                }
                try {
                    console.log('Creating Stripe checkout session with params:', JSON.stringify(checkoutParams, null, 2));
                    const stripeCheckoutSession = await this.stripe.checkout.sessions.create(checkoutParams);
                    console.log('Stripe checkout session created:', stripeCheckoutSession.id);
                    await this.checkoutSessionRepository.update(session.id, {
                        stripeCheckoutSessionId: stripeCheckoutSession.id,
                        stripeAccountId: session.shop.stripeAccountId,
                    });
                    return {
                        stripeCheckoutUrl: stripeCheckoutSession.url,
                        paymentMethod: createPaymentDto.paymentMethod,
                        sessionId: stripeCheckoutSession.id,
                    };
                }
                catch (stripeError) {
                    console.error('Stripe checkout session creation failed:', {
                        error: stripeError.message,
                        type: stripeError.type,
                        code: stripeError.code,
                        param: stripeError.param,
                        checkoutParams: JSON.stringify(checkoutParams, null, 2)
                    });
                    throw new common_1.BadRequestException(`Stripe payment failed: ${stripeError.message}`);
                }
            }
            else {
                throw new common_1.BadRequestException(`Payment method ${createPaymentDto.paymentMethod} should use the payment-intent endpoint`);
            }
        }
        catch (error) {
            console.error('Payment creation failed:', {
                error: error.message,
                stack: error.stack,
                sessionId,
                paymentMethod: createPaymentDto.paymentMethod,
                sessionData: {
                    currentStep: session?.currentStep,
                    productPrice: session?.productPrice,
                    totalAmount: session?.totalAmount,
                    shopName: session?.shop?.name,
                    productName: session?.product?.name
                }
            });
            if (error.message.includes('amount')) {
                throw new common_1.BadRequestException('Invalid payment amount. Please try again.');
            }
            else if (error.message.includes('currency')) {
                throw new common_1.BadRequestException('Currency not supported. Please contact support.');
            }
            else if (error.message.includes('Stripe')) {
                throw new common_1.BadRequestException(`Payment processing error: ${error.message}`);
            }
            else {
                throw new common_1.BadRequestException('Failed to create payment session. Please try again.');
            }
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
        if (!session.product) {
            session.product = await this.productsService.findById(session.productId);
        }
        if (!session.shop) {
            const shop = await this.checkoutSessionRepository.manager.findOne(shop_entity_1.Shop, {
                where: { id: session.shopId }
            });
            session.shop = shop;
        }
        if (!session.product) {
            throw new common_1.NotFoundException('Product not found for this checkout session');
        }
        if (!session.shop) {
            throw new common_1.NotFoundException('Shop not found for this checkout session');
        }
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
                stripeAccountId: session.shop.stripeAccountId,
            },
            billing: {
                cycle: session.billingCycle,
            },
            currentStep: session.currentStep,
            expiresAt: session.expiresAt,
            stripeAccountId: session.shop.stripeAccountId,
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
        const random = Math.random().toString(36).substring(2, 11);
        return `cs_${timestamp}_${random}`;
    }
    async updateSessionStatus(sessionId, status) {
        await this.checkoutSessionRepository.update({ sessionId }, { status: status });
    }
    async updateSessionByStripeId(stripeSessionId, status) {
        await this.checkoutSessionRepository.update({
            stripeCheckoutSessionId: stripeSessionId
        }, { status: status });
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
    async findByStripeSessionId(stripeSessionId) {
        return await this.checkoutSessionRepository.findOne({
            where: { stripeCheckoutSessionId: stripeSessionId }
        });
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