import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { addHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';

import { CheckoutSession } from './entities/checkout-session.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ShippingRate } from '../shipping/entities/shipping-rate.entity';
import { ProductsService } from '../products/products.service';
import { ShippingService } from '../shipping/shipping.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SaveInformationDto } from './dto/save-information.dto';
import { SelectShippingDto } from './dto/select-shipping.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
    private readonly productsService: ProductsService,
    private readonly shippingService: ShippingService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a new checkout session
   */
  async createSession(createCheckoutSessionDto: CreateCheckoutSessionDto) {
    const { productId, billingCycle, quantity = 1 } = createCheckoutSessionDto;

    // Get product with shop relation
    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    // Check if shop is active and can receive payments
    if (!product.shop.isActive || !product.shop.stripeChargesEnabled) {
      throw new BadRequestException('Shop is not able to receive payments');
    }

    // Calculate price based on billing cycle
    const productPrice = this.calculateProductPrice(product, billingCycle);

    // Generate unique session ID
    const sessionId = this.generateSessionId();

    // Calculate expiry time (24 hours from now)
    const expiresAt = addHours(new Date(), 24);

    // Create checkout session
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const checkoutUrl = `${frontendUrl}/checkout/${sessionId}`;

    return {
      sessionId,
      checkoutUrl,
      expiresAt: checkoutSession.expiresAt,
    };
  }

  /**
   * Find checkout session by public session ID
   */
  async findBySessionId(sessionId: string): Promise<CheckoutSession> {
    return await this.checkoutSessionRepository.findOne({
      where: { sessionId },
      relations: ['product', 'shop', 'shippingRate'],
    });
  }

  /**
   * Save customer information (Step 1)
   */
  async saveInformation(sessionId: string, saveInformationDto: SaveInformationDto) {
    // First get the session with product relation
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product'],
    });

    // If product relation is null, load it manually
    if (!session.product) {
      session.product = await this.productsService.findById(session.productId);
    }

    // Check if product exists
    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }

    // Update session with customer information
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
      currentStep: session.product.requiresShipping ? 2 : 3, // Skip shipping if digital
    });

    return {
      nextStep: session.product.requiresShipping ? 2 : 3,
      requiresShipping: session.product.requiresShipping,
    };
  }

  /**
   * Select shipping method (Step 2)
   */
  async selectShipping(sessionId: string, selectShippingDto: SelectShippingDto) {
    // First get the session with product relation
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product'],
    });

    // If product relation is null, load it manually
    if (!session.product) {
      session.product = await this.productsService.findById(session.productId);
    }

    // Check if product exists
    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }

    if (!session.product.requiresShipping) {
      throw new BadRequestException('This product does not require shipping');
    }

    let shippingRate;

    // Handle default shipping rate IDs
    if (selectShippingDto.shippingRateId.startsWith('00000000-0000-0000-0000-000000000')) {
      const defaultRates = {
        '00000000-0000-0000-0000-000000000001': { name: 'Standard Shipping', price: 9.99 },
        '00000000-0000-0000-0000-000000000002': { name: 'Express Shipping', price: 19.99 }
      };
      shippingRate = defaultRates[selectShippingDto.shippingRateId];

      if (!shippingRate) {
        throw new NotFoundException('Default shipping rate not found');
      }
    } else {
      // Get shipping rate from database
      shippingRate = await this.shippingService.findRateById(selectShippingDto.shippingRateId);
      if (!shippingRate) {
        throw new NotFoundException('Shipping rate not found');
      }
    }

    // Calculate new total - ensure proper number conversion
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

    // Update session with shipping information
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

  /**
   * Create payment intent for direct card payments
   */
  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const { sessionId, paymentMethodId, amount, stripeAccountId } = createPaymentIntentDto;

    // Get the session with all relations
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product', 'shop'],
    });

    // If relations are null, load them manually
    if (!session.product) {
      session.product = await this.productsService.findById(session.productId);
    }
    if (!session.shop) {
      session.shop = await this.checkoutSessionRepository.manager.findOne(Shop, {
        where: { id: session.shopId }
      });
    }

    // Check if essential data exists
    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }
    if (!session.shop) {
      throw new NotFoundException('Shop not found for this checkout session');
    }

    if (session.currentStep < 2) {
      console.log(`Payment intent attempted for session ${sessionId} at step ${session.currentStep}, but requires step 2 or higher`);
      throw new BadRequestException('Please complete the information step first before proceeding to payment');
    }

    try {
      // Create payment intent with Stripe
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: amount, // Amount should already be in cents
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

      // Get shop info to check if Stripe account is active
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
        } else if (shopWithSession?.shop) {
          console.log('Using Stripe connected account for payment intent:', stripeAccountId);
        }
      }

      // Create connected account charge if shop can receive payments
      if (shopStripeAccountId) {
        paymentIntentParams.application_fee_amount = Math.round(amount * 0.15); // 15% platform fee
        paymentIntentParams.transfer_data = {
          destination: shopStripeAccountId,
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

      // Update checkout session
      await this.checkoutSessionRepository.update(session.id, {
        stripePaymentIntentId: paymentIntent.id,
        currentStep: 4, // Payment step
        status: 'processing',
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };

    } catch (error: any) {
      console.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Create payment session (Step 3)
   */
  async createPayment(sessionId: string, createPaymentDto: CreatePaymentDto) {
    // First get the session with all relations
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product', 'shop', 'shippingRate'],
    });

    // If relations are null, load them manually
    if (!session.product) {
      session.product = await this.productsService.findById(session.productId);
    }
    if (!session.shop) {
      session.shop = await this.checkoutSessionRepository.manager.findOne(Shop, {
        where: { id: session.shopId }
      });
    }

    // Check if essential data exists
    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }
    if (!session.shop) {
      throw new NotFoundException('Shop not found for this checkout session');
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
      throw new BadRequestException('Please complete the information step first before proceeding to payment');
    }

    // Allow payment if user has at least entered information (step 2)
    // The frontend handles shipping independently

    // Calculate total amount
    const productPrice = this.calculateProductPrice(session.product, session.billingCycle);
    let shippingCost = 0;

    // Handle default shipping rates
    if (session.shippingRateId?.startsWith('00000000-0000-0000-0000-000000000')) {
      const defaultRates = {
        '00000000-0000-0000-0000-000000000001': 9.99, // Standard
        '00000000-0000-0000-0000-000000000002': 19.99 // Express
      };
      shippingCost = defaultRates[session.shippingRateId] || 0;
    } else {
      shippingCost = typeof session.shippingRate?.price === 'string'
        ? parseFloat(session.shippingRate.price)
        : (session.shippingRate?.price || 0);
    }

    // Calculate amounts properly - ensure all are numbers
    const numericProductPrice = typeof productPrice === 'string' ? parseFloat(productPrice) : productPrice;
    const numericShippingCost = typeof shippingCost === 'string' ? parseFloat(shippingCost) : shippingCost;
    const platformFeeCents = Math.round(numericProductPrice * 0.15 * 100); // 15% platform fee in cents
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

    // Validate calculated amounts
    if (totalAmountCents <= 0) {
      throw new BadRequestException('Invalid total amount calculated');
    }

    // Update session step to 4 (payment step)
    await this.checkoutSessionRepository.update(session.id, {
      currentStep: 4,
      shippingCost: numericShippingCost,
      totalAmount: totalAmountDollars,
    });

    try {
      if (createPaymentDto.paymentMethod === 'stripe_popup') {
        // Create Stripe Checkout Session for popup
        const checkoutParams: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ['card'],
          mode: 'payment', // Simplified to only one-time payments for now

          // Line items
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

        // If shop has Stripe account with charges enabled, use connected account
        if (session.shop.stripeAccountId && session.shop.stripeChargesEnabled) {
          console.log('Using Stripe connected account:', session.shop.stripeAccountId);
          checkoutParams.payment_intent_data = {
            application_fee_amount: platformFeeCents,
            transfer_data: {
              destination: session.shop.stripeAccountId,
            },
          };
        } else if (session.shop.stripeAccountId) {
          console.log('Shop has Stripe account but charges not enabled, using platform account');
          // Shop has account but can't receive charges yet, use platform account
        } else {
          console.log('Shop does not have Stripe account, using platform account');
        }

        try {
          console.log('Creating Stripe checkout session with params:', JSON.stringify(checkoutParams, null, 2));
          const stripeCheckoutSession = await this.stripe.checkout.sessions.create(checkoutParams);
          console.log('Stripe checkout session created:', stripeCheckoutSession.id);

          // Update session with Stripe checkout session ID
          await this.checkoutSessionRepository.update(session.id, {
            stripeCheckoutSessionId: stripeCheckoutSession.id,
            stripeAccountId: session.shop.stripeAccountId,
          });

          return {
            stripeCheckoutUrl: stripeCheckoutSession.url,
            paymentMethod: createPaymentDto.paymentMethod,
            sessionId: stripeCheckoutSession.id,
          };
        } catch (stripeError: any) {
          console.error('Stripe checkout session creation failed:', {
            error: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            param: stripeError.param,
            checkoutParams: JSON.stringify(checkoutParams, null, 2)
          });
          throw new BadRequestException(`Stripe payment failed: ${stripeError.message}`);
        }
      } else {
        // For other payment methods (like stripe_card), redirect to appropriate handler
        throw new BadRequestException(`Payment method ${createPaymentDto.paymentMethod} should use the payment-intent endpoint`);
      }

    } catch (error: any) {
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

      // Provide more specific error messages
      if (error.message.includes('amount')) {
        throw new BadRequestException('Invalid payment amount. Please try again.');
      } else if (error.message.includes('currency')) {
        throw new BadRequestException('Currency not supported. Please contact support.');
      } else if (error.message.includes('Stripe')) {
        throw new BadRequestException(`Payment processing error: ${error.message}`);
      } else {
        throw new BadRequestException('Failed to create payment session. Please try again.');
      }
    }
  }

  /**
   * Get checkout summary with all details
   */
  async getCheckoutSummary(sessionId: string) {
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

  /**
   * Get public checkout data (no auth required)
   */
  async getPublicCheckoutData(sessionId: string) {
    // First get the session with basic relations
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product', 'shop'],
    });

    // If relations are null, load them manually
    if (!session.product) {
      session.product = await this.productsService.findById(session.productId);
    }
    if (!session.shop) {
      // Load shop data manually
      const shop = await this.checkoutSessionRepository.manager.findOne(Shop, {
        where: { id: session.shopId }
      });
      session.shop = shop;
    }

    // Check again if product exists
    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }
    if (!session.shop) {
      throw new NotFoundException('Shop not found for this checkout session');
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

  /**
   * Manually expire a session
   */
  async expireSession(sessionId: string) {
    const session = await this.validateCheckoutSession(sessionId);

    await this.checkoutSessionRepository.update(session.id, {
      status: 'expired',
    });
  }

  /**
   * Complete checkout session (called after successful payment)
   */
  async completeCheckoutSession(sessionId: string, paymentData: any) {
    const session = await this.validateCheckoutSession(sessionId);

    await this.checkoutSessionRepository.update(session.id, {
      status: 'completed',
      stripeCheckoutSessionId: paymentData.stripeSessionId,
    } as any);

    return await this.validateCheckoutSession(sessionId);
  }

  /**
   * Validate checkout session and check if it's not expired
   */
  private async validateCheckoutSession(
    sessionId: string,
    options?: { relations?: string[] },
  ): Promise<CheckoutSession> {
    const session = await this.checkoutSessionRepository.findOne({
      where: { sessionId },
      relations: options?.relations,
    });

    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }

    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Checkout session has expired');
    }

    if (session.status === 'completed') {
      throw new BadRequestException('Checkout session already completed');
    }

    return session;
  }

  /**
   * Calculate product price based on billing cycle
   */
  private calculateProductPrice(product: Product, billingCycle: string): number {
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

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `cs_${timestamp}_${random}`;
  }

  /**
   * Update checkout session status (for webhooks)
   */
  async updateSessionStatus(sessionId: string, status: string) {
    await this.checkoutSessionRepository.update(
      { sessionId },
      { status: status as any }
    );
  }

  /**
   * Update checkout session status by Stripe ID (for webhooks)
   */
  async updateSessionByStripeId(stripeSessionId: string, status: string) {
    await this.checkoutSessionRepository.update(
      {
        stripeCheckoutSessionId: stripeSessionId
      },
      { status: status as any }
    );
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions() {
    const expiredSessions = await this.checkoutSessionRepository.find({
      where: {
        expiresAt: MoreThan(new Date()),
        status: 'pending',
      },
    });

    if (expiredSessions.length > 0) {
      const sessionIds = expiredSessions.map(s => s.id);
      await this.checkoutSessionRepository
        .createQueryBuilder()
        .update(CheckoutSession)
        .set({ status: 'expired' })
        .where('id IN (:...sessionIds)', { sessionIds })
        .execute();
    }

    return expiredSessions.length;
  }

  /**
   * Find checkout session by Stripe session ID
   */
  async findByStripeSessionId(stripeSessionId: string): Promise<CheckoutSession | null> {
    return await this.checkoutSessionRepository.findOne({
      where: { stripeCheckoutSessionId: stripeSessionId }
    });
  }
}