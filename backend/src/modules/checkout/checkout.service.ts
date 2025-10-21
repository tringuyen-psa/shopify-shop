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
    const session = await this.validateCheckoutSession(sessionId);

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
    const session = await this.validateCheckoutSession(sessionId);

    if (!session.product.requiresShipping) {
      throw new BadRequestException('This product does not require shipping');
    }

    // Get shipping rate
    const shippingRate = await this.shippingService.findRateById(selectShippingDto.shippingRateId);
    if (!shippingRate) {
      throw new NotFoundException('Shipping rate not found');
    }

    // Calculate new total
    const totalAmount = session.productPrice + shippingRate.price;

    // Update session with shipping information
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

  /**
   * Create payment session (Step 3)
   */
  async createPayment(sessionId: string, createPaymentDto: CreatePaymentDto) {
    const session = await this.validateCheckoutSession(sessionId, {
      relations: ['product', 'shop', 'shippingRate'],
    });

    if (session.currentStep !== 3) {
      throw new BadRequestException('Please complete previous steps first');
    }

    // Calculate total amount
    const productPrice = this.calculateProductPrice(session.product, session.billingCycle);
    const shippingCost = session.shippingRate?.price || 0;
    const platformFee = Math.round(productPrice * 0.15 * 100); // Convert to cents
    const totalAmount = Math.round((productPrice + shippingCost + platformFee) * 100); // Convert to cents

    try {
      // Create Stripe Checkout Session - simplified version for now
      const stripeCheckoutSession = await this.stripe.checkout.sessions.create({
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

      // Update session with Stripe checkout session ID
      await this.checkoutSessionRepository.update(session.id, {
        stripeCheckoutSessionId: stripeCheckoutSession.id,
      });

      return {
        stripeCheckoutUrl: stripeCheckoutSession.url,
        paymentMethod: createPaymentDto.paymentMethod,
      };

    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      throw new BadRequestException('Failed to create payment session. Please try again.');
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
    const random = Math.random().toString(36).substr(2, 9);
    return `cs_${timestamp}_${random}`;
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
}