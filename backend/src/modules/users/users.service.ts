import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as bcrypt from 'bcrypt';
import 'express-serve-static-core';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  /**
   * Get user profile with detailed information
   */
  async getProfile(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['shops'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateProfileDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update(id, updateProfileDto);
    return await this.getProfile(id);
  }

  /**
   * Change user password
   */
  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository.update(id, { passwordHash: newPasswordHash });
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(id: string, file: Express.Multer.File): Promise<string> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would upload to a cloud storage service
    // For now, we'll just simulate it with a mock URL
    const avatarUrl = `https://example.com/avatars/${id}/${file.originalname}`;

    await this.userRepository.update(id, { avatar: avatarUrl });
    return avatarUrl;
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, { avatar: null });
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
   * Get customer statistics
   */
  async getCustomerStats(customerId: string) {
    const totalOrders = await this.orderRepository.count({
      where: { customerId },
    });

    const totalSubscriptions = await this.subscriptionRepository.count({
      where: { customerId },
    });

    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { customerId, status: 'active' },
    });

    const totalSpent = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.customerId = :customerId', { customerId })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    return {
      totalOrders,
      totalSubscriptions,
      activeSubscriptions,
      totalSpent: parseFloat(totalSpent?.total) || 0,
    };
  }

  /**
   * Get shop by owner
   */
  async getShopByOwner(ownerId: string) {
    const shop = await this.shopRepository.findOne({
      where: { ownerId },
      relations: ['products'],
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  /**
   * Get shop statistics
   */
  async getShopStats(ownerId: string, period: string = 'month') {
    const shop = await this.shopRepository.findOne({ where: { ownerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const { startDate, endDate } = this.getDateRange(period);

    const totalOrders = await this.orderRepository.count({
      where: {
        shopId: shop.id,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.shopId = :shopId', { shopId: shop.id })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    const totalSubscriptions = await this.subscriptionRepository.count({
      where: {
        shopId: shop.id,
        createdAt: Between(startDate, endDate),
      },
    });

    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { shopId: shop.id, status: 'active' },
    });

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue?.total) || 0,
      totalSubscriptions,
      activeSubscriptions,
    };
  }

  /**
   * Get shop dashboard data
   */
  async getShopDashboard(ownerId: string) {
    const shop = await this.shopRepository.findOne({ where: { ownerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const { startDate, endDate } = this.getDateRange('month');

    // Recent orders
    const recentOrders = await this.orderRepository.find({
      where: {
        shopId: shop.id,
        createdAt: Between(startDate, endDate),
      },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Recent subscriptions
    const recentSubscriptions = await this.subscriptionRepository.find({
      where: {
        shopId: shop.id,
        createdAt: Between(startDate, endDate),
      },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Top products
    const topProducts = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.productId', 'productId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.shopId = :shopId', { shopId: shop.id })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('order.productId')
      .orderBy('orderCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      shop,
      recentOrders,
      recentSubscriptions,
      topProducts,
    };
  }

  /**
   * Get all users (admin)
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    role: string = 'all',
    status: string = 'all',
    search?: string,
  ) {
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

  /**
   * Get user by ID (admin)
   */
  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['shops'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Suspend user (admin)
   */
  async suspendUser(id: string, reason: string, duration?: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'platform_admin') {
      throw new ForbiddenException('Cannot suspend platform admin');
    }

    const suspendedUntil = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

    await this.userRepository.update(id, {
      isActive: false,
      suspendedReason: reason,
      suspendedUntil,
    });
  }

  /**
   * Unsuspend user (admin)
   */
  async unsuspendUser(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, {
      isActive: true,
      suspendedReason: null,
      suspendedUntil: null,
    });
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'platform_admin') {
      throw new ForbiddenException('Cannot delete platform admin');
    }

    await this.userRepository.softDelete(id);
  }

  /**
   * Get user statistics (admin)
   */
  async getUserStats(period: string = 'month') {
    const { startDate, endDate } = this.getDateRange(period);

    const totalUsers = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('user.role')
      .getRawMany();

    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    return {
      totalUsers,
      activeUsers,
      usersByRole,
    };
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return default preferences for now
    return {
      emailNotifications: true,
      orderUpdates: true,
      subscriptionRenewals: true,
      promotions: false,
      newsletter: false,
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(id: string, preferences: any) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would store these in a separate table
    // For now, just return the preferences
    return preferences;
  }

  /**
   * Get user addresses
   */
  async getAddresses(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock data for addresses
    return [];
  }

  /**
   * Add address
   */
  async addAddress(id: string, addressData: any) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would store addresses in a separate table
    return {
      id: uuidv4(),
      ...addressData,
      userId: id,
    };
  }

  /**
   * Update address
   */
  async updateAddress(id: string, addressId: string, addressData: any) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would update the address in the database
    return {
      id: addressId,
      ...addressData,
    };
  }

  /**
   * Delete address
   */
  async deleteAddress(id: string, addressId: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would delete the address from the database
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      twoFactorEnabled: false,
      lastPasswordChange: user.updatedAt,
      activeSessions: 1,
    };
  }

  /**
   * Enable 2FA
   */
  async enable2FA(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock 2FA setup
    return {
      secret: 'mock-secret',
      qrCode: 'mock-qr-code',
      backupCodes: ['123456', '789012'],
    };
  }

  /**
   * Disable 2FA
   */
  async disable2FA(id: string, code: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock verification
    if (code !== '123456') {
      throw new BadRequestException('Invalid verification code');
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock session data
    return [
      {
        id: uuidv4(),
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.1',
        location: 'New York, US',
        lastActive: new Date(),
        isCurrent: true,
      },
    ];
  }

  /**
   * Revoke session
   */
  async revokeSession(id: string, sessionId: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would revoke the session
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would revoke all sessions except current
  }

  // Existing methods from original service
  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
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
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return { startDate, endDate };
  }
}