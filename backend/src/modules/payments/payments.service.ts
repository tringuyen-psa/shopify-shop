import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateSetupIntentDto } from './dto/create-setup-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  // Payment Intents
  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    const { amount, currency = 'usd', customerId, metadata, paymentMethodId } = createPaymentIntentDto;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
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
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error);
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async getPaymentIntent(intentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(intentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`, error);
      throw new NotFoundException(`Payment intent not found: ${error.message}`);
    }
  }

  async confirmPaymentIntent(intentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(intentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent: ${error.message}`, error);
      throw new BadRequestException(`Failed to confirm payment: ${error.message}`);
    }
  }

  async cancelPaymentIntent(intentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(intentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent: ${error.message}`, error);
      throw new BadRequestException(`Failed to cancel payment: ${error.message}`);
    }
  }

  // Setup Intents
  async createSetupIntent(createSetupIntentDto: CreateSetupIntentDto) {
    const { customerId, paymentMethodTypes = ['card'] } = createSetupIntentDto;

    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: paymentMethodTypes,
      });

      return setupIntent;
    } catch (error) {
      this.logger.error(`Failed to create setup intent: ${error.message}`, error);
      throw new BadRequestException(`Failed to create setup intent: ${error.message}`);
    }
  }

  // Customer Payment Methods
  async getCustomerPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      this.logger.error(`Failed to get payment methods: ${error.message}`, error);
      throw new BadRequestException(`Failed to get payment methods: ${error.message}`);
    }
  }

  async detachPaymentMethod(paymentMethodId: string) {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`, error);
      throw new BadRequestException(`Failed to detach payment method: ${error.message}`);
    }
  }

  // Refunds
  async createRefund(refundPaymentDto: RefundPaymentDto) {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = refundPaymentDto;

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      });

      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`, error);
      throw new BadRequestException(`Failed to create refund: ${error.message}`);
    }
  }

  async getRefund(refundId: string) {
    try {
      const refund = await this.stripe.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to retrieve refund: ${error.message}`, error);
      throw new NotFoundException(`Refund not found: ${error.message}`);
    }
  }

  // Stripe Connect
  async createConnectAccount(shopId: string, userId: string) {
    try {
      // Get shop data to populate Stripe account
      const shop = await this.shopRepository.findOne({
        where: { id: shopId, ownerId: userId },
        relations: ['owner'],
      });

      if (!shop) {
        throw new NotFoundException('Shop not found or access denied');
      }

      let account;

      // Check if we're in development mode or Stripe Connect is not available
      const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                               !process.env.STRIPE_CONNECT_ENABLED;

      if (isDevelopmentMode) {
        // Create a mock account for development
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
        } as any;

        this.logger.log(`Created mock Stripe Connect account ${account.id} for shop ${shopId}`);
      } else {
        // Create real Stripe Connect account
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

      // Update shop with Stripe account ID
      await this.shopRepository.update(shopId, {
        stripeAccountId: account.id,
      });

      this.logger.log(`Created Stripe Connect account ${account.id} for shop ${shopId}`);

      return account;
    } catch (error) {
      this.logger.error(`Failed to create Connect account: ${error.message}`, error);
      throw new BadRequestException(`Failed to create Connect account: ${error.message}`);
    }
  }

  async getConnectAccount(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      this.logger.error(`Failed to retrieve Connect account: ${error.message}`, error);
      throw new BadRequestException(`Failed to retrieve Connect account: ${error.message}`);
    }
  }

  async createOnboardingLink(accountId: string) {
    try {
      // Check if this is a mock account
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
        } as any;
      }

      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/onboarding/refresh`,
        return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/onboarding/complete`,
        type: 'account_onboarding',
      });

      this.logger.log(`Created onboarding link for account ${accountId}`);

      return accountLink;
    } catch (error) {
      this.logger.error(`Failed to create onboarding link: ${error.message}`, error);
      throw new BadRequestException(`Failed to create onboarding link: ${error.message}`);
    }
  }

  async createKYCLink(accountId: string) {
    try {
      // Check if this is a mock account
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
        } as any;
      }

      // Create a person account link for KYC verification
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/refresh`,
        return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/complete`,
        type: 'account_onboarding',
      });

      this.logger.log(`Created KYC verification link for account ${accountId}`);

      return accountLink;
    } catch (error) {
      this.logger.error(`Failed to create KYC link: ${error.message}`, error);
      throw new BadRequestException(`Failed to create KYC verification link: ${error.message}`);
    }
  }

  async updateAccountStatus(accountId: string): Promise<void> {
    try {
      // Check if this is a mock account
      const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                               !process.env.STRIPE_CONNECT_ENABLED ||
                               accountId.startsWith('acct_mock_');

      let chargesEnabled = false;
      let payoutsEnabled = false;
      let onboardingComplete = false;

      if (isDevelopmentMode) {
        this.logger.warn(`Updating mock account status for ${accountId}`);

        // For mock accounts, simulate a gradual approval process
        const random = Math.random();
        chargesEnabled = random > 0.3; // 70% chance of charges enabled
        payoutsEnabled = random > 0.5; // 50% chance of payouts enabled
        onboardingComplete = random > 0.4; // 60% chance of complete
      } else {
        const account = await this.stripe.accounts.retrieve(accountId);
        chargesEnabled = account.charges_enabled;
        payoutsEnabled = account.payouts_enabled;
        onboardingComplete = account.requirements?.currently_due.length === 0;
      }

      // Update the shop's Stripe status in database
      await this.shopRepository.update(
        { stripeAccountId: accountId },
        {
          stripeChargesEnabled: chargesEnabled,
          stripePayoutsEnabled: payoutsEnabled,
          stripeOnboardingComplete: onboardingComplete,
        }
      );

      this.logger.log(`Updated account status for ${accountId}: charges_enabled=${chargesEnabled}, payouts_enabled=${payoutsEnabled}`);
    } catch (error) {
      this.logger.error(`Failed to update account status: ${error.message}`, error);
      throw new BadRequestException(`Failed to update account status: ${error.message}`);
    }
  }

  async createDashboardLink(accountId: string) {
    try {
      // Check if this is a mock account
      const isDevelopmentMode = process.env.NODE_ENV === 'development' ||
                               !process.env.STRIPE_CONNECT_ENABLED ||
                               accountId.startsWith('acct_mock_');

      if (isDevelopmentMode) {
        this.logger.warn(`Creating mock dashboard link for account ${accountId}`);

        return {
          url: 'https://dashboard.stripe.com/mock/dashboard',
          created: new Date().toISOString(),
        } as any;
      }

      const loginLink = await this.stripe.accounts.createLoginLink(accountId);
      return loginLink;
    } catch (error) {
      this.logger.error(`Failed to create dashboard link: ${error.message}`, error);
      throw new BadRequestException(`Failed to create dashboard link: ${error.message}`);
    }
  }

  // Checkout Sessions
  async createCheckoutSession(body: {
    productId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    billingCycle?: string;
  }) {
    const { productId, customerId, successUrl, cancelUrl, billingCycle } = body;

    try {
      // Get product details
      // This would need to be implemented based on your product service
      const productPrice = 1000; // Mock price in cents
      const productName = 'Product Name'; // Mock product name

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error);
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }

  async getCheckoutSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error(`Failed to retrieve checkout session: ${error.message}`, error);
      throw new BadRequestException(`Failed to retrieve checkout session: ${error.message}`);
    }
  }

  // Subscriptions
  async createSubscription(body: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    paymentMethodId?: string;
  }) {
    const { customerId, priceId, trialDays, paymentMethodId } = body;

    try {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
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
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error);
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false) {
    try {
      let subscription;
      if (immediately) {
        subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error);
      throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
    }
  }

  // Balance and Payouts
  async getAccountBalance(accountId: string) {
    try {
      const balance = await this.stripe.balance.retrieve({ stripeAccount: accountId });
      return balance;
    } catch (error) {
      this.logger.error(`Failed to retrieve account balance: ${error.message}`, error);
      throw new BadRequestException(`Failed to retrieve account balance: ${error.message}`);
    }
  }

  async createPayout(accountId: string, amount: number, currency = 'usd') {
    try {
      const payout = await this.stripe.payouts.create(
        {
          amount: Math.round(amount * 100),
          currency,
        },
        { stripeAccount: accountId },
      );
      return payout;
    } catch (error) {
      this.logger.error(`Failed to create payout: ${error.message}`, error);
      throw new BadRequestException(`Failed to create payout: ${error.message}`);
    }
  }

  // Webhook handling
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`, error);
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true, type: event.type };
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}: ${error.message}`, error);
      throw new BadRequestException(`Error processing webhook: ${error.message}`);
    }
  }

  // Webhook event handlers
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);

    // Update checkout session or order based on metadata
    if (paymentIntent.metadata.checkoutSessionId) {
      await this.updateCheckoutSessionPayment(paymentIntent.metadata.checkoutSessionId, paymentIntent);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment failed: ${paymentIntent.id}`);
    // Handle failed payment logic
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout completed: ${session.id}`);
    // Handle checkout completion logic
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // Handle subscription renewal logic
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
    // Handle failed invoice payment logic
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription created: ${subscription.id}`);
    // Handle subscription creation logic
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Handle subscription cancellation logic
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    this.logger.log(`Account updated: ${account.id}`);

    // Update shop information based on account changes
    if (account.metadata?.shopId) {
      await this.updateShopAccountStatus(account.metadata.shopId, account);
    }
  }

  // Helper methods
  private async updateCheckoutSessionPayment(checkoutSessionId: string, paymentIntent: Stripe.PaymentIntent) {
    try {
      await this.checkoutSessionRepository.update(
        { sessionId: checkoutSessionId },
        {
          status: 'completed',
          stripeCheckoutSessionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to update checkout session: ${error.message}`, error);
    }
  }

  private async updateShopAccountStatus(shopId: string, account: Stripe.Account) {
    try {
      const updateData: any = {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
      };

      if (account.requirements?.currently_due?.length === 0) {
        updateData.stripeOnboardingComplete = true;
      }

      await this.shopRepository.update(shopId, updateData);
    } catch (error) {
      this.logger.error(`Failed to update shop account status: ${error.message}`, error);
    }
  }

  // Admin endpoints
  async getAllTransactions(page: number = 1, limit: number = 20, shopId?: string) {
    try {
      const params: Stripe.PaymentIntentListParams = {
        limit,
      };

      let stripeClient = this.stripe;
      if (shopId) {
        // Get the Stripe account ID for the shop
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (shop?.stripeAccountId) {
          stripeClient = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
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
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`, error);
      throw new BadRequestException(`Failed to get transactions: ${error.message}`);
    }
  }

  async getPaymentMetrics(period: string = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      default:
        startDate = subDays(now, 30);
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
      const successfulTransactions = paymentIntents.data.filter(
        intent => intent.status === 'succeeded'
      ).length;

      return {
        totalAmount: totalAmount / 100, // Convert back to dollars
        totalTransactions,
        successfulTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        period,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment metrics: ${error.message}`, error);
      throw new BadRequestException(`Failed to get payment metrics: ${error.message}`);
    }
  }
}