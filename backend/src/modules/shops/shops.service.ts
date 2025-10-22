import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Shop } from './entities/shop.entity';

interface FindAllParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async findById(id: string): Promise<Shop> {
    return this.shopRepository.findOne({
      where: { id },
      relations: ['owner', 'products'],
    });
  }

  async findBySlug(slug: string): Promise<Shop> {
    return this.shopRepository.findOne({
      where: { slug },
      relations: ['owner', 'products'],
    });
  }

  async findProductsBySlug(slug: string): Promise<any[]> {
    const shop = await this.shopRepository.findOne({
      where: { slug },
      relations: ['products'],
    });

    if (!shop) {
      throw new BadRequestException('Shop not found');
    }

    return shop.products.filter(product => product.isActive);
  }

  async findByUserId(userId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { ownerId: userId },
      relations: ['owner', 'products'],
    });

    if (!shop) {
      throw new BadRequestException('Shop not found for this user');
    }

    return shop;
  }

  async findByOwner(userId: string): Promise<Shop[]> {
    return this.shopRepository.find({
      where: { ownerId: userId },
      relations: ['owner', 'products'],
    });
  }

  async create(shopData: Partial<Shop>, userId: string): Promise<Shop> {
    try {
      // Set owner ID from authenticated user
      const shop = this.shopRepository.create({
        ...shopData,
        ownerId: userId,
        // Generate slug from name initially
        slug: this.generateSlugFromName(shopData.name || 'shop'),
        // Ensure default values are set for required fields
        status: 'pending',
        platformFeePercent: 15.00,
        isActive: false,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        shippingEnabled: true,
      });

      console.log('Creating shop with data:', shop);
      const savedShop = await this.shopRepository.save(shop);

      // Update slug to use shop ID (more unique)
      const slugWithId = this.generateSlugFromId(savedShop.id, shopData.name || 'shop');
      await this.shopRepository.update(savedShop.id, { slug: slugWithId });

      // Return shop with updated slug
      const result = await this.shopRepository.findOne({ where: { id: savedShop.id } });
      console.log('Shop created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  }

  // Generate URL-friendly slug from name
  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }

  // Generate slug using shop ID for uniqueness
  private generateSlugFromId(id: string, name: string): string {
    const nameSlug = this.generateSlugFromName(name);
    const shortId = id.split('-')[0]; // Get first part of UUID
    return `${nameSlug}-${shortId}`;
  }

  async update(id: string, shopData: Partial<Shop>): Promise<Shop> {
    await this.shopRepository.update(id, shopData);
    return this.findById(id);
  }

  async findAll(params?: FindAllParams): Promise<{
    shops: Shop[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 12,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params || {};

    // Build query conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    // Build order conditions
    const order: any = {};
    order[sortBy] = sortOrder;

    try {
      const [shops, total] = await this.shopRepository.findAndCount({
        where,
        relations: ['owner'],
        order,
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        shops,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAll shops:', error);
      throw new BadRequestException(`Invalid query parameters: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    await this.shopRepository.delete(id);
  }

  // Subscription plan methods
  async updateSubscriptionPlan(
    shopId: string,
    planData: {
      plan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus';
      price: number;
      period: string;
      stripeSubscriptionId?: string;
    }
  ): Promise<Shop> {
    const shop = await this.findById(shopId);

    if (!shop) {
      throw new BadRequestException('Shop not found');
    }

    const updateData: Partial<Shop> = {
      subscriptionPlan: planData.plan,
      subscriptionPrice: planData.price,
      subscriptionPeriod: planData.period,
      subscriptionStartsAt: new Date(),
      subscriptionActive: true,
      stripeSubscriptionId: planData.stripeSubscriptionId || null,
    };

    return this.shopRepository.save({
      ...shop,
      ...updateData,
    });
  }

  async cancelSubscription(shopId: string): Promise<Shop> {
    const shop = await this.findById(shopId);

    if (!shop) {
      throw new BadRequestException('Shop not found');
    }

    return this.shopRepository.save({
      ...shop,
      subscriptionActive: false,
      subscriptionEndsAt: new Date(),
    });
  }

  async getSubscriptionPlans(): Promise<any[]> {
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 39,
        period: 'monthly',
        targetAudience: 'Cửa hàng nhỏ, mới bắt đầu',
        purpose: 'Bán online cơ bản',
        features: [
          'Tối đa 100 sản phẩm',
          'Báo cáo cơ bản',
          'Phí giao dịch 2.9% + 30¢',
          'Hỗ trợ email 24/7',
          'Theme cơ bản',
          'SSL miễn phí',
          '1 tài khoản nhân viên'
        ],
        limitations: [
          'Không có API nâng cao',
          'Không có tùy chỉnh theme',
          'Phí giao dịch cao hơn',
          'Báo cáo giới hạn'
        ]
      },
      {
        id: 'shopify',
        name: 'Shopify',
        price: 105,
        period: 'monthly',
        targetAudience: 'Doanh nghiệp đang phát triển',
        purpose: 'Báo cáo chuyên sâu, nhiều tài khoản nhân viên',
        features: [
          'Không giới hạn sản phẩm',
          'Báo cáo nâng cao',
          'Phí giao dịch 2.7% + 30¢',
          'Hỗ trợ ưu tiên 24/7',
          'Tùy chỉnh theme đầy đủ',
          'Gift cards',
          'Tối đa 5 tài khoản nhân viên',
          'Abandoned cart recovery',
          'Professional reports'
        ],
        limitations: [
          'Phí giao dịch vẫn có thể tối ưu hơn',
          'Không có API chuyên nghiệp',
          'Hỗ trợ không riêng tư'
        ],
        recommended: true
      },
      {
        id: 'advanced',
        name: 'Advanced',
        price: 399,
        period: 'monthly',
        targetAudience: 'Doanh nghiệp lớn',
        purpose: 'Phân tích nâng cao, phí giao dịch thấp',
        features: [
          'Tất cả tính năng Shopify',
          'Phí giao dịch 2.4% + 30¢',
          'Hỗ trợ riêng tư 24/7',
          'API chuyên nghiệp (Shopify Plus)',
          'Tối đa 15 tài khoản nhân viên',
          'Advanced report builder',
          'Custom checkout',
          'Fraud analysis',
          'International domains'
        ],
        limitations: [
          'Chi phí đầu tư cao',
          'Phức tạp cho người mới bắt đầu'
        ]
      },
      {
        id: 'shopify_plus',
        name: 'Shopify Plus',
        price: 2000,
        period: 'monthly',
        targetAudience: 'Thương hiệu lớn, volume cao',
        purpose: 'Hỗ trợ riêng, API cao cấp',
        features: [
          'Tất cả tính năng Advanced',
          'Phí giao dịch tùy chỉnh',
          'Dedicated account manager',
          'Tùy chỉnh API hoàn toàn',
          'Không giới hạn tài khoản',
          'Shopify Flow automation',
          'B2B wholesale',
          'Launch engineer support',
          'Performance optimization'
        ],
        limitations: [
          'Yêu cầu cam đồng tối thiểu 1 năm'
        ]
      }
    ];
  }

  /**
   * Find shop by Stripe account ID
   */
  async findByStripeAccountId(stripeAccountId: string): Promise<Shop> {
    return this.shopRepository.findOne({
      where: { stripeAccountId },
      relations: ['owner', 'products'],
    });
  }

  /**
   * Mark shop as active when Stripe onboarding is complete
   */
  async stripeOnboardingComplete(shopId: string): Promise<Shop> {
    const shop = await this.findById(shopId);

    if (!shop) {
      throw new BadRequestException('Shop not found');
    }

    // Update shop to active when onboarding is complete
    return this.shopRepository.save({
      ...shop,
      isActive: true,
      status: 'active',
    });
  }
}