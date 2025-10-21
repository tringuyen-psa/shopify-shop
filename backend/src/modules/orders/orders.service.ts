import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  /**
   * Create a new order
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate platform fee and shop revenue
    const platformFee = this.calculatePlatformFee(createOrderDto.totalAmount, createOrderDto.platformFeePercent);
    const shopRevenue = createOrderDto.totalAmount - platformFee;

    // Create order
    const orderData: any = {
      orderNumber,
      checkoutSessionId: createOrderDto.checkoutSessionId,
      shopId: createOrderDto.shopId,
      productId: createOrderDto.productId,
      customerId: createOrderDto.customerId,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      shippingAddressLine1: createOrderDto.shippingAddressLine1,
      shippingAddressLine2: createOrderDto.shippingAddressLine2,
      shippingCity: createOrderDto.shippingCity,
      shippingState: createOrderDto.shippingState,
      shippingCountry: createOrderDto.shippingCountry,
      shippingPostalCode: createOrderDto.shippingPostalCode,
      shippingCost: createOrderDto.shippingCost,
      productPrice: createOrderDto.productPrice,
      totalAmount: createOrderDto.totalAmount,
      platformFee,
      shopRevenue,
      billingCycle: createOrderDto.billingCycle,
      paymentMethod: createOrderDto.paymentMethod,
      paymentIntentId: createOrderDto.paymentIntentId,
      paymentStatus: createOrderDto.paymentStatus || 'paid',
      fulfillmentStatus: createOrderDto.fulfillmentStatus || 'unfulfilled',
      customerNote: createOrderDto.customerNote,
      paidAt: createOrderDto.paidAt ? new Date(createOrderDto.paidAt) : null,
    };

    const order = await this.orderRepository.save(orderData);

    // Create order items (for future multiple products per order)
    if (createOrderDto.items && createOrderDto.items.length > 0) {
      await this.orderItemRepository.save(
        createOrderDto.items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }))
      );
    }

    return await this.findById(order.id);
  }

  /**
   * Get order by ID
   */
  async findById(id: string, relations?: string[]): Promise<Order> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: relations || ['shop', 'product', 'customer', 'orderItems', 'subscription'],
    });
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string, user?: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['shop', 'product', 'customer', 'orderItems', 'subscription'],
    });

    if (!order) {
      return null;
    }

    // Check access permissions if user is provided
    if (user) {
      if (user.role === 'customer' && order.customerId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
      if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return order;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = 10,
    status: string = 'all',
  ) {
    const skip = (page - 1) * limit;
    const where: any = { customerId };

    if (status !== 'all') {
      where.fulfillmentStatus = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['shop', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get shop orders
   */
  async getShopOrders(
    shopId: string,
    page: number = 1,
    limit: number = 10,
    status: string = 'all',
  ) {
    const skip = (page - 1) * limit;
    const where: any = { shopId };

    if (status !== 'all') {
      where.fulfillmentStatus = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['customer', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get shop order by order number
   */
  async getShopOrderByNumber(shopId: string, orderNumber: string): Promise<Order> {
    return await this.orderRepository.findOne({
      where: { shopId, orderNumber },
      relations: ['customer', 'product', 'orderItems', 'subscription'],
    });
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status: string = 'all',
    shopId?: string,
    customerId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status !== 'all') {
      where.fulfillmentStatus = status;
    }
    if (shopId) {
      where.shopId = shopId;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['shop', 'customer', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
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
   * Fulfill order
   */
  async fulfillOrder(id: string, user: User, fulfillOrderDto: FulfillOrderDto): Promise<Order> {
    const order = await this.findById(id, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.fulfillmentStatus !== 'unfulfilled') {
      throw new BadRequestException('Order is already fulfilled');
    }

    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Order must be paid before fulfillment');
    }

    await this.orderRepository.update(id, {
      fulfillmentStatus: 'fulfilled',
      internalNote: fulfillOrderDto.internalNote,
      fulfilledAt: new Date(),
    });

    return await this.findById(id);
  }

  /**
   * Ship order
   */
  async shipOrder(id: string, user: User, shipOrderDto: ShipOrderDto): Promise<Order> {
    const order = await this.findById(id, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.fulfillmentStatus === 'cancelled') {
      throw new BadRequestException('Cannot ship cancelled order');
    }

    await this.orderRepository.update(id, {
      fulfillmentStatus: 'shipped',
      trackingNumber: shipOrderDto.trackingNumber,
      carrier: shipOrderDto.carrier,
      estimatedDelivery: shipOrderDto.estimatedDelivery ? new Date(shipOrderDto.estimatedDelivery) : null,
      shippedAt: new Date(),
    });

    return await this.findById(id);
  }

  /**
   * Mark order as delivered
   */
  async deliverOrder(id: string, user: User): Promise<Order> {
    const order = await this.findById(id, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.fulfillmentStatus !== 'shipped') {
      throw new BadRequestException('Order must be shipped before delivery');
    }

    await this.orderRepository.update(id, {
      fulfillmentStatus: 'delivered',
      deliveredAt: new Date(),
    });

    return await this.findById(id);
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, user: User, cancelOrderDto: CancelOrderDto): Promise<Order> {
    const order = await this.findById(id, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (user.role === 'customer' && order.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.fulfillmentStatus === 'delivered') {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.fulfillmentStatus === 'shipped') {
      throw new BadRequestException('Cannot cancel shipped order. Please contact support.');
    }

    await this.orderRepository.update(id, {
      fulfillmentStatus: 'cancelled',
      internalNote: cancelOrderDto.reason,
      cancelledAt: new Date(),
    });

    return await this.findById(id);
  }

  /**
   * Update internal note
   */
  async updateInternalNote(id: string, user: User, internalNote: string): Promise<Order> {
    const order = await this.findById(id, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check permissions
    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.orderRepository.update(id, { internalNote });
    return await this.findById(id);
  }

  /**
   * Get order statistics (admin)
   */
  async getOrderStats(period: string = 'month') {
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

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['shop'],
    });

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      totalPlatformFee: orders.reduce((sum, order) => sum + Number(order.platformFee), 0),
      ordersByStatus: {
        pending: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length,
        fulfilled: orders.filter(o => o.fulfillmentStatus === 'fulfilled').length,
        shipped: orders.filter(o => o.fulfillmentStatus === 'shipped').length,
        delivered: orders.filter(o => o.fulfillmentStatus === 'delivered').length,
        cancelled: orders.filter(o => o.fulfillmentStatus === 'cancelled').length,
      },
      ordersByPaymentStatus: {
        pending: orders.filter(o => o.paymentStatus === 'pending').length,
        paid: orders.filter(o => o.paymentStatus === 'paid').length,
        failed: orders.filter(o => o.paymentStatus === 'failed').length,
        refunded: orders.filter(o => o.paymentStatus === 'refunded').length,
      },
      topShops: this.getTopShops(orders),
    };

    return stats;
  }

  /**
   * Get order tracking information (public)
   */
  async getOrderTracking(orderNumber: string, email: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber, customerEmail: email },
      relations: ['shop', 'product'],
    });

    if (!order) {
      return null;
    }

    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shopName: order.shop.name,
      productName: order.product.name,
      productImage: order.product.images?.[0],
      fulfillmentStatus: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    };
  }

  /**
   * Request refund (customer)
   */
  async requestRefund(orderId: string, user: User, reason: string, description?: string) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Only paid orders can be refunded');
    }

    if (order.fulfillmentStatus === 'delivered') {
      throw new BadRequestException('Refund requests for delivered orders must be made within 7 days');
    }

    // Store refund request in internal note
    const refundInfo = `REFUND REQUEST - ${new Date().toISOString()}\nReason: ${reason}\nDescription: ${description || 'N/A'}\nStatus: Pending`;
    await this.orderRepository.update(orderId, {
      internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
    });

    return { message: 'Refund request submitted successfully' };
  }

  /**
   * Process refund (shop owner)
   */
  async processRefund(orderId: string, user: User, approve: boolean, reason?: string, refundAmount?: number) {
    const order = await this.findById(orderId, ['shop']);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === 'shop_owner' && order.shop.ownerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    // Update refund status in internal note
    const refundInfo = `REFUND DECISION - ${new Date().toISOString()}\nApproved: ${approve}\nReason: ${reason || 'N/A'}\nRefund Amount: ${refundAmount || order.totalAmount}\nProcessed by: ${user.name}`;

    if (approve) {
      await this.orderRepository.update(orderId, {
        paymentStatus: 'refunded',
        internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
      });
    } else {
      await this.orderRepository.update(orderId, {
        internalNote: order.internalNote ? `${order.internalNote}\n\n${refundInfo}` : refundInfo,
      });
    }

    return { message: `Refund ${approve ? 'approved' : 'rejected'} successfully` };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
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

  /**
   * Calculate platform fee
   */
  private calculatePlatformFee(totalAmount: number, feePercent: number): number {
    return (totalAmount * feePercent) / 100;
  }

  /**
   * Get top performing shops
   */
  private getTopShops(orders: Order[]) {
    const shopRevenue = new Map<string, { name: string; revenue: number; orders: number }>();

    orders.forEach(order => {
      const existing = shopRevenue.get(order.shopId);
      if (existing) {
        existing.revenue += Number(order.totalAmount);
        existing.orders += 1;
      } else {
        shopRevenue.set(order.shopId, {
          name: order.shop.name,
          revenue: Number(order.totalAmount),
          orders: 1,
        });
      }
    });

    return Array.from(shopRevenue.entries())
      .map(([shopId, data]) => ({ shopId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}