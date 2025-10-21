import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreatePlatformSettingDto } from './dto/create-platform-setting.dto';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  constructor(
    @InjectRepository(PlatformSetting)
    private readonly platformSettingRepository: Repository<PlatformSetting>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  // Platform Settings
  async getAllSettings(): Promise<PlatformSetting[]> {
    return await this.platformSettingRepository.find({
      order: { key: 'ASC' },
    });
  }

  async getSetting(key: string): Promise<string> {
    const setting = await this.platformSettingRepository.findOne({
      where: { key },
    });
    return setting ? setting.value : null;
  }

  async createSetting(createPlatformSettingDto: CreatePlatformSettingDto): Promise<PlatformSetting> {
    const existingSetting = await this.platformSettingRepository.findOne({
      where: { key: createPlatformSettingDto.key },
    });

    if (existingSetting) {
      throw new BadRequestException('Setting with this key already exists');
    }

    const setting = this.platformSettingRepository.create(createPlatformSettingDto);
    return await this.platformSettingRepository.save(setting);
  }

  async updateSetting(key: string, updatePlatformSettingDto: UpdatePlatformSettingDto): Promise<PlatformSetting> {
    const setting = await this.platformSettingRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    await this.platformSettingRepository.update(setting.id, updatePlatformSettingDto);
    return await this.platformSettingRepository.findOne({ where: { id: setting.id } });
  }

  async deleteSetting(key: string): Promise<void> {
    const setting = await this.platformSettingRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    await this.platformSettingRepository.delete(setting.id);
  }

  async setSetting(key: string, value: string, description?: string): Promise<PlatformSetting> {
    const existingSetting = await this.platformSettingRepository.findOne({
      where: { key },
    });

    if (existingSetting) {
      await this.platformSettingRepository.update(existingSetting.id, { value, description });
      return this.platformSettingRepository.findOne({ where: { id: existingSetting.id } });
    }

    const setting = this.platformSettingRepository.create({ key, value, description });
    return this.platformSettingRepository.save(setting);
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      { key: 'default_platform_fee', value: '15', description: 'Default platform fee percentage' },
      { key: 'min_platform_fee', value: '10', description: 'Minimum platform fee percentage' },
      { key: 'max_platform_fee', value: '30', description: 'Maximum platform fee percentage' },
      { key: 'stripe_platform_account_id', value: '', description: 'Stripe Platform Account ID' },
      { key: 'checkout_session_expiry_hours', value: '24', description: 'Hours before checkout session expires' },
    ];

    for (const setting of defaultSettings) {
      const exists = await this.platformSettingRepository.findOne({
        where: { key: setting.key },
      });

      if (!exists) {
        await this.platformSettingRepository.save(setting);
      }
    }
  }

  // Dashboard & Analytics
  async getDashboard(period: string = 'month') {
    const { startDate, endDate } = this.getDateRange(period);

    const [
      totalUsers,
      totalShops,
      totalOrders,
      totalSubscriptions,
      totalRevenue,
      platformFees,
    ] = await Promise.all([
      this.userRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      }),
      this.shopRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      }),
      this.orderRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
          paymentStatus: 'paid',
        },
      }),
      this.subscriptionRepository.count({
        where: {
          createdAt: Between(startDate, endDate),
        },
      }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('order.paymentStatus = :status', { status: 'paid' })
        .getRawOne(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.platformFee)', 'total')
        .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('order.paymentStatus = :status', { status: 'paid' })
        .getRawOne(),
    ]);

    return {
      period,
      totalUsers,
      totalShops,
      totalOrders,
      totalSubscriptions,
      totalRevenue: parseFloat(totalRevenue?.total) || 0,
      platformFees: parseFloat(platformFees?.total) || 0,
      conversionRate: totalShops > 0 ? (totalOrders / totalShops) * 100 : 0,
    };
  }

  async getAnalytics(period: string = 'month') {
    const { startDate, endDate } = this.getDateRange(period);

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('user.role')
      .getRawMany();

    const shopsByStatus = await this.shopRepository
      .createQueryBuilder('shop')
      .select('shop.status', 'status')
      .addSelect('COUNT(shop.id)', 'count')
      .where('shop.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('shop.status')
      .getRawMany();

    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.fulfillmentStatus', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.fulfillmentStatus')
      .getRawMany();

    return {
      period,
      usersByRole,
      shopsByStatus,
      ordersByStatus,
    };
  }

  async getRevenueAnalytics(period: string = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    const dailyRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('SUM(order.platformFee)', 'platformFee')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
      .getRawMany();

    const topProducts = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.productId', 'productId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .groupBy('order.productId')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    const topShops = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.shopId', 'shopId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .leftJoin('shop', 'shop', 'shop.id = order.shopId')
      .addSelect('shop.name', 'shopName')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .groupBy('order.shopId')
      .addGroupBy('shop.name')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      period,
      dailyRevenue,
      topProducts,
      topShops,
    };
  }

  async getUserAnalytics(period: string = 'month') {
    return this.getAnalytics(period);
  }

  async getShopAnalytics(period: string = 'month') {
    return this.getAnalytics(period);
  }

  async getSubscriptionAnalytics(period: string = 'month') {
    return this.getAnalytics(period);
  }

  // Shop Management
  async getShops(page: number = 1, limit: number = 20, status: string = 'all', search?: string) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.shopRepository
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'owner');

    if (status !== 'all') {
      queryBuilder.andWhere('shop.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(shop.name ILIKE :search OR shop.email ILIKE :search OR owner.name ILIKE :search OR owner.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [shops, total] = await queryBuilder
      .orderBy('shop.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      shops,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getShop(id: string) {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['owner', 'products', 'orders'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async approveShop(id: string) {
    const shop = await this.shopRepository.findOne({ where: { id: id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.shopRepository.update(id, {
      status: 'active',
    });

    return await this.getShop(id);
  }

  async suspendShop(id: string, reason: string, duration?: number) {
    const shop = await this.shopRepository.findOne({ where: { id: id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    await this.shopRepository.update(id, {
      status: 'suspended',
      suspendedReason: reason,
      suspendedUntil,
    });

    return await this.getShop(id);
  }

  async unsuspendShop(id: string) {
    const shop = await this.shopRepository.findOne({ where: { id: id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.shopRepository.update(id, {
      status: 'active',
      suspendedReason: null,
      suspendedUntil: null,
    });

    return await this.getShop(id);
  }

  async updateShopFee(id: string, platformFeePercent: number) {
    const shop = await this.shopRepository.findOne({ where: { id: id } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.shopRepository.update(id, {
      platformFeePercent,
    });

    return await this.getShop(id);
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 20, role: string = 'all', status: string = 'all', search?: string) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.shops', 'shops');

    if (role !== 'all') {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status !== 'all') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: status === 'active' });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['shops'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Order Management
  async getOrders(
    page: number = 1,
    limit: number = 20,
    status: string = 'all',
    shopId?: string,
    customerId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.product', 'product');

    if (status !== 'all') {
      queryBuilder.andWhere('order.fulfillmentStatus = :status', { status });
    }

    if (shopId) {
      queryBuilder.andWhere('order.shopId = :shopId', { shopId });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        'order.createdAt BETWEEN :dateFrom AND :dateTo',
        { dateFrom: new Date(dateFrom), dateTo: new Date(dateTo) },
      );
    }

    const [orders, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  async getOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['shop', 'customer', 'product', 'orderItems'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Mock implementations for other methods
  async getTransactions(page: number, limit: number, type: string, status: string, shopId?: string) {
    return {
      transactions: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  async getTransaction(id: string) {
    throw new NotFoundException('Transaction not found');
  }

  async getDisputes(page: number, limit: number, status: string, type: string) {
    return {
      disputes: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  async getDispute(id: string) {
    throw new NotFoundException('Dispute not found');
  }

  async resolveDispute(id: string, data: any) {
    return { message: 'Dispute resolved' };
  }

  async getSalesReport(period: string, dateFrom?: string, dateTo?: string) {
    return { period, totalSales: 0, orders: 0 };
  }

  async getFeesReport(period: string, dateFrom?: string, dateTo?: string) {
    return { period, totalFees: 0, transactions: 0 };
  }

  async getShopPerformanceReport(period: string, shopId?: string) {
    return { period, performance: {} };
  }

  async getHealthStatus() {
    return {
      status: 'healthy',
      database: 'connected',
      services: 'operational',
    };
  }

  async getMetrics(period: string) {
    return { period, metrics: {} };
  }

  async triggerBackup() {
    return { message: 'Backup triggered', backupId: 'backup_' + Date.now() };
  }

  async triggerCleanup() {
    return { message: 'Cleanup completed', itemsRemoved: 0 };
  }

  async getNotifications(page: number, limit: number, type: string) {
    return {
      notifications: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  async sendNotification(data: any) {
    return { message: 'Notification sent', recipients: 0 };
  }

  async getAuditLogs(
    page: number,
    limit: number,
    action?: string,
    userId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    return {
      logs: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  // Helper methods
  private getDateRange(period: string) {
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
      case '30d':
        startDate = subDays(now, 30);
        endDate = now;
        break;
      case '90d':
        startDate = subDays(now, 90);
        endDate = now;
        break;
      case '1y':
        startDate = subDays(now, 365);
        endDate = now;
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return { startDate, endDate };
  }
}