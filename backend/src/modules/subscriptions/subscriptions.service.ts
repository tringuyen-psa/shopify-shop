import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { UpdateSubscriptionAddressDto } from './dto/update-subscription-address.dto';
import { addMonths, addWeeks, addYears, startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths } from 'date-fns';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new subscription
   */
  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    // Validate order exists
    const order = await this.orderRepository.findOne({
      where: { id: createSubscriptionDto.orderId },
      relations: ['shop', 'product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Calculate dates based on billing cycle
    const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(
      createSubscriptionDto.billingCycle,
    );

    // Create subscription
    const subscriptionData: any = {
      productId: createSubscriptionDto.productId,
      customerId: createSubscriptionDto.customerId,
      billingCycle: createSubscriptionDto.billingCycle || 'monthly',
      platformFee: createSubscriptionDto.platformFee || 0,
      shopRevenue: createSubscriptionDto.shopRevenue || 0,
      shippingAddressLine1: createSubscriptionDto.shippingAddressLine1,
      shippingAddressLine2: createSubscriptionDto.shippingAddressLine2,
      shippingCity: createSubscriptionDto.shippingCity,
      shippingState: createSubscriptionDto.shippingState,
      shippingCountry: createSubscriptionDto.shippingCountry,
      shippingPostalCode: createSubscriptionDto.shippingPostalCode,
      shippingCost: createSubscriptionDto.shippingCost || 0,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      renewalCount: 0,
    };

    // Add optional fields if they exist
    if (createSubscriptionDto.orderId) subscriptionData.orderId = createSubscriptionDto.orderId;
    if (createSubscriptionDto.shopId) subscriptionData.shopId = createSubscriptionDto.shopId;
    if (createSubscriptionDto.stripeSubscriptionId) subscriptionData.stripeSubscriptionId = createSubscriptionDto.stripeSubscriptionId;
    if (createSubscriptionDto.stripeCustomerId) subscriptionData.stripeCustomerId = createSubscriptionDto.stripeCustomerId;
    if (createSubscriptionDto.amount) subscriptionData.amount = createSubscriptionDto.amount;

    const subscription = await this.subscriptionRepository.save(subscriptionData);

    return await this.findById((subscription as any).id);
  }

  /**
   * Get subscription by ID
   */
  async findById(id: string, relations?: string[]): Promise<Subscription> {
    return await this.subscriptionRepository.findOne({
      where: { id },
      relations: relations || ['shop', 'product', 'customer', 'order'],
    });
  }

  /**
   * Get subscription with user permission check
   */
  async getSubscription(id: string, user: User): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop', 'product', 'customer', 'order']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check access permissions
    if (user.role === 'customer' && subscription.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return subscription;
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(
    customerId: string,
    status: string = 'all',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { customerId };

    if (status !== 'all') {
      where.status = status;
    }

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where,
      relations: ['shop', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get shop subscriptions
   */
  async getShopSubscriptions(
    shopId: string,
    status: string = 'all',
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { shopId };

    if (status !== 'all') {
      where.status = status;
    }

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where,
      relations: ['customer', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    id: string,
    user: User,
    cancelSubscriptionDto: CancelSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'customer' && subscription.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (subscription.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    const updateData: any = {
      cancelAtPeriodEnd: cancelSubscriptionDto.immediate ? false : true,
      cancelledAt: cancelSubscriptionDto.immediate ? new Date() : null,
    };

    if (cancelSubscriptionDto.immediate) {
      updateData.status = 'cancelled';
      updateData.cancellationReason = cancelSubscriptionDto.reason;
    }

    await this.subscriptionRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(id: string, user: User): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'customer' && subscription.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (subscription.status !== 'cancelled') {
      throw new BadRequestException('Only cancelled subscriptions can be resumed');
    }

    // Calculate new billing period
    const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(
      subscription.billingCycle,
    );

    await this.subscriptionRepository.update(id, {
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart,
      currentPeriodEnd,
      cancelledAt: null,
      cancellationReason: null,
    });

    return await this.findById(id);
  }

  /**
   * Change subscription billing cycle
   */
  async changePlan(id: string, user: User, changePlanDto: ChangePlanDto): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop', 'product']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'customer' && subscription.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (subscription.status !== 'active') {
      throw new BadRequestException('Only active subscriptions can change plans');
    }

    // Get new pricing based on product and new billing cycle
    const newAmount = this.calculateProductPrice(subscription.product, changePlanDto.billingCycle);
    const platformFee = this.calculatePlatformFee(newAmount, subscription.shop.platformFeePercent);
    const shopRevenue = newAmount - platformFee;

    await this.subscriptionRepository.update(id, {
      billingCycle: (changePlanDto.billingCycle || changePlanDto.newBillingCycle) as any,
      amount: newAmount,
      platformFee,
      shopRevenue,
    });

    return await this.findById(id);
  }

  /**
   * Update shipping address
   */
  async updateShippingAddress(
    id: string,
    user: User,
    updateAddressDto: UpdateSubscriptionAddressDto,
  ): Promise<Subscription> {
    const subscription = await this.findById(id);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'customer' && subscription.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    // Check if subscription requires shipping
    const product = await this.productRepository.findOne({
      where: { id: subscription.productId },
    });

    if (!product || !product.requiresShipping) {
      throw new BadRequestException('This subscription does not require shipping');
    }

    await this.subscriptionRepository.update(id, {
      shippingAddressLine1: updateAddressDto.shippingAddress.line1,
      shippingAddressLine2: updateAddressDto.shippingAddress.line2,
      shippingCity: updateAddressDto.shippingAddress.city,
      shippingState: updateAddressDto.shippingAddress.state,
      shippingCountry: updateAddressDto.shippingAddress.country,
      shippingPostalCode: updateAddressDto.shippingAddress.postalCode,
    });

    return await this.findById(id);
  }

  /**
   * Get all subscriptions (admin)
   */
  async getAllSubscriptions(
    status: string = 'all',
    page: number = 1,
    limit: number = 20,
    shopId?: string,
    customerId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status !== 'all') {
      where.status = status;
    }
    if (shopId) {
      where.shopId = shopId;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const [subscriptions, total] = await this.subscriptionRepository.findAndCount({
      where,
      relations: ['shop', 'customer', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(webhookData: any) {
    const { type, data } = webhookData;

    switch (type) {
      case 'invoice.paid':
        return await this.handleInvoicePaid(data.object);
      case 'customer.subscription.deleted':
        return await this.handleSubscriptionDeleted(data.object);
      case 'invoice.payment_failed':
        return await this.handleInvoicePaymentFailed(data.object);
      default:
        return { message: 'Event type not handled' };
    }
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaid(invoiceData: any) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: invoiceData.subscription },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Update billing period
    const { currentPeriodStart, currentPeriodEnd } = this.calculateBillingDates(
      subscription.billingCycle,
      new Date(invoiceData.period_end * 1000),
    );

    await this.subscriptionRepository.update(subscription.id, {
      status: 'active',
      currentPeriodStart: new Date(invoiceData.period_start * 1000),
      currentPeriodEnd: new Date(invoiceData.period_end * 1000),
      renewalCount: subscription.renewalCount + 1,
    });

    // Create renewal order
    await this.createRenewalOrder(subscription, invoiceData);

    return { subscriptionId: subscription.id, status: 'renewed' };
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionDeleted(subscriptionData: any) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.subscriptionRepository.update(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    return { subscriptionId: subscription.id, status: 'cancelled' };
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(invoiceData: any) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: invoiceData.subscription },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.subscriptionRepository.update(subscription.id, {
      status: 'past_due',
    });

    return { subscriptionId: subscription.id, status: 'past_due' };
  }

  /**
   * Create renewal order
   */
  private async createRenewalOrder(subscription: Subscription, invoiceData: any) {
    const orderNumber = await this.generateOrderNumber();

    await this.orderRepository.save({
      orderNumber,
      subscriptionId: subscription.id,
      shopId: subscription.shopId,
      productId: subscription.productId,
      customerId: subscription.customerId,
      customerEmail: subscription.customer.email,
      customerName: subscription.customer.name,
      shippingAddressLine1: subscription.shippingAddressLine1,
      shippingAddressLine2: subscription.shippingAddressLine2,
      shippingCity: subscription.shippingCity,
      shippingState: subscription.shippingState,
      shippingCountry: subscription.shippingCountry,
      shippingPostalCode: subscription.shippingPostalCode,
      shippingCost: subscription.shippingCost,
      productPrice: subscription.amount,
      totalAmount: subscription.amount + subscription.shippingCost,
      platformFee: subscription.platformFee,
      shopRevenue: subscription.shopRevenue,
      billingCycle: subscription.billingCycle,
      paymentMethod: 'stripe',
      paymentIntentId: invoiceData.payment_intent,
      paymentStatus: 'paid',
      fulfillmentStatus: subscription.shippingCost > 0 ? 'unfulfilled' : 'delivered',
      paidAt: new Date(),
    });
  }

  /**
   * Get subscription statistics (admin)
   */
  async getSubscriptionStats(period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['shop'],
    });

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      pastDueSubscriptions: subscriptions.filter(s => s.status === 'past_due').length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
      totalPlatformFee: subscriptions.reduce((sum, s) => sum + Number(s.platformFee), 0),
      subscriptionsByBillingCycle: {
        weekly: subscriptions.filter(s => s.billingCycle === 'weekly').length,
        monthly: subscriptions.filter(s => s.billingCycle === 'monthly').length,
        yearly: subscriptions.filter(s => s.billingCycle === 'yearly').length,
      },
      topShops: this.getTopShopsBySubscriptions(subscriptions),
    };

    return stats;
  }

  /**
   * Get shop subscription statistics
   */
  async getShopSubscriptionStats(shopId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        shopId,
        createdAt: Between(startDate, endDate),
      },
    });

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
      totalPlatformFee: subscriptions.reduce((sum, s) => sum + Number(s.platformFee), 0),
      subscriptionsByBillingCycle: {
        weekly: subscriptions.filter(s => s.billingCycle === 'weekly').length,
        monthly: subscriptions.filter(s => s.billingCycle === 'monthly').length,
        yearly: subscriptions.filter(s => s.billingCycle === 'yearly').length,
      },
    };

    return stats;
  }

  /**
   * Check if user can access shop
   */
  async canUserAccessShop(userId: string, shopId: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId, ownerId: userId },
    });
    return !!shop;
  }

  /**
   * Get subscription renewal history
   */
  async getSubscriptionRenewals(
    subscriptionId: string,
    user: User,
    page: number = 1,
    limit: number = 10,
  ) {
    const subscription = await this.getSubscription(subscriptionId, user);

    const orders = await this.orderRepository.find({
      where: { subscriptionId },
      relations: ['shop'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.orderRepository.count({
      where: { subscriptionId },
    });

    return {
      orders,
      subscription,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(
    id: string,
    user: User,
    reason: string,
    resumeAt?: string,
  ): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (subscription.status !== 'active') {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    await this.subscriptionRepository.update(id, {
      status: 'paused',
      pauseReason: reason,
      resumeAt: resumeAt ? new Date(resumeAt) : null,
    });

    return await this.findById(id);
  }

  /**
   * Unpause subscription
   */
  async unpauseSubscription(id: string, user: User): Promise<Subscription> {
    const subscription = await this.findById(id, ['shop']);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && subscription.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (subscription.status !== 'paused') {
      throw new BadRequestException('Only paused subscriptions can be unpaused');
    }

    await this.subscriptionRepository.update(id, {
      status: 'active',
      pauseReason: null,
      resumeAt: null,
    });

    return await this.findById(id);
  }

  /**
   * Get shop subscription analytics
   */
  async getShopSubscriptionAnalytics(shopId: string, period: string = '30d') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subYears(now, 1);
        break;
      default:
        startDate = subDays(now, 30);
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: {
        shopId,
        createdAt: MoreThan(startDate),
      },
    });

    const dailyStats = await this.getDailySubscriptionStats(shopId, startDate, now);

    return {
      period,
      totalSubscriptions: subscriptions.length,
      newSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      churnedSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      totalRevenue: subscriptions.reduce((sum, s) => sum + Number(s.amount), 0),
      averageRevenuePerSubscription: subscriptions.length > 0 ?
        subscriptions.reduce((sum, s) => sum + Number(s.amount), 0) / subscriptions.length : 0,
      dailyStats,
    };
  }

  // Helper methods
  private calculateBillingDates(billingCycle: string, fromDate?: Date) {
    const now = fromDate || new Date();
    let currentPeriodStart = startOfMonth(now);
    let currentPeriodEnd: Date;

    switch (billingCycle) {
      case 'weekly':
        currentPeriodStart = startOfWeek(now);
        currentPeriodEnd = endOfWeek(now);
        break;
      case 'monthly':
        currentPeriodStart = startOfMonth(now);
        currentPeriodEnd = endOfMonth(now);
        break;
      case 'yearly':
        currentPeriodStart = startOfYear(now);
        currentPeriodEnd = endOfYear(now);
        break;
      default:
        currentPeriodStart = startOfMonth(now);
        currentPeriodEnd = endOfMonth(now);
    }

    return { currentPeriodStart, currentPeriodEnd };
  }

  private calculateProductPrice(product: Product, billingCycle: string): number {
    switch (billingCycle) {
      case 'weekly':
        return product.weeklyPrice || product.basePrice;
      case 'monthly':
        return product.monthlyPrice || product.basePrice;
      case 'yearly':
        return product.yearlyPrice || product.basePrice;
      default:
        return product.basePrice;
    }
  }

  private calculatePlatformFee(amount: number, feePercent: number): number {
    return (amount * feePercent) / 100;
  }

  private async generateOrderNumber(): Promise<string> {
    // This should be the same logic as in OrdersService
    let orderNumber: string;
    let exists = true;

    while (exists) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      orderNumber = `#${randomNum}`;

      const existingOrder = await this.orderRepository.findOne({
        where: { orderNumber },
      });

      exists = !!existingOrder;
    }

    return orderNumber!;
  }

  private getTopShopsBySubscriptions(subscriptions: Subscription[]) {
    const shopCounts = new Map<string, { name: string; count: number; revenue: number }>();

    subscriptions.forEach(subscription => {
      const existing = shopCounts.get(subscription.shopId);
      if (existing) {
        existing.count += 1;
        existing.revenue += Number(subscription.amount);
      } else {
        shopCounts.set(subscription.shopId, {
          name: subscription.shop.name,
          count: 1,
          revenue: Number(subscription.amount),
        });
      }
    });

    return Array.from(shopCounts.entries())
      .map(([shopId, data]) => ({ shopId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getDailySubscriptionStats(shopId: string, startDate: Date, endDate: Date) {
    // This would typically involve a more complex query with date truncation
    // For now, return a simple structure
    return {
      subscriptions: [],
      revenue: [],
      churn: [],
    };
  }
}

// Helper function for date subtraction
function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function subYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
}