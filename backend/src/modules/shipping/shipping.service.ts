import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingRate } from './entities/shipping-rate.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingZone)
    private readonly shippingZoneRepository: Repository<ShippingZone>,
    @InjectRepository(ShippingRate)
    private readonly shippingRateRepository: Repository<ShippingRate>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CheckoutSession)
    private readonly checkoutSessionRepository: Repository<CheckoutSession>,
  ) {}

  // Shipping Zones Management
  async getShippingZones(shopId: string): Promise<ShippingZone[]> {
    return await this.shippingZoneRepository.find({
      where: { shopId, isActive: true },
      relations: ['rates'],
      order: { name: 'ASC' },
    });
  }

  async createShippingZone(shopId: string, createShippingZoneDto: CreateShippingZoneDto): Promise<ShippingZone> {
    // Validate shop exists
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Check if zone with same name already exists for this shop
    const existingZone = await this.shippingZoneRepository.findOne({
      where: { shopId, name: createShippingZoneDto.name },
    });

    if (existingZone) {
      throw new BadRequestException('Shipping zone with this name already exists for this shop');
    }

    const zone = await this.shippingZoneRepository.save({
      shopId,
      name: createShippingZoneDto.name,
      countries: createShippingZoneDto.countries,
      isActive: createShippingZoneDto.isActive ?? true,
    });

    return await this.findZoneById(zone.id, ['rates']);
  }

  async updateShippingZone(zoneId: string, updateShippingZoneDto: UpdateShippingZoneDto): Promise<ShippingZone> {
    const zone = await this.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    // Check for duplicate name if name is being updated
    if (updateShippingZoneDto.name && updateShippingZoneDto.name !== zone.name) {
      const existingZone = await this.shippingZoneRepository.findOne({
        where: { shopId: zone.shopId, name: updateShippingZoneDto.name },
      });

      if (existingZone) {
        throw new BadRequestException('Shipping zone with this name already exists for this shop');
      }
    }

    await this.shippingZoneRepository.update(zoneId, updateShippingZoneDto);
    return await this.findZoneById(zoneId, ['rates']);
  }

  async deleteShippingZone(zoneId: string): Promise<void> {
    const zone = await this.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    // Check if zone has rates
    const ratesCount = await this.shippingRateRepository.count({
      where: { zoneId },
    });

    if (ratesCount > 0) {
      throw new BadRequestException('Cannot delete shipping zone with existing rates. Please delete all rates first.');
    }

    await this.shippingZoneRepository.delete(zoneId);
  }

  async findZoneById(zoneId: string, relations?: string[]): Promise<ShippingZone> {
    return await this.shippingZoneRepository.findOne({
      where: { id: zoneId },
      relations,
    });
  }

  // Shipping Rates Management
  async getShippingRates(zoneId: string): Promise<ShippingRate[]> {
    return await this.shippingRateRepository.find({
      where: { zoneId, isActive: true },
      order: { price: 'ASC' },
    });
  }

  async createShippingRate(zoneId: string, createShippingRateDto: CreateShippingRateDto): Promise<ShippingRate> {
    const zone = await this.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    const rate = await this.shippingRateRepository.save({
      zoneId,
      name: createShippingRateDto.name,
      description: createShippingRateDto.description,
      price: createShippingRateDto.price,
      minOrderAmount: createShippingRateDto.minOrderAmount,
      maxWeight: createShippingRateDto.maxWeight,
      minDeliveryDays: createShippingRateDto.minDeliveryDays,
      maxDeliveryDays: createShippingRateDto.maxDeliveryDays,
      isActive: createShippingRateDto.isActive ?? true,
    });

    return rate;
  }

  async updateShippingRate(rateId: string, updateShippingRateDto: UpdateShippingRateDto): Promise<ShippingRate> {
    const rate = await this.findRateById(rateId);
    if (!rate) {
      throw new NotFoundException('Shipping rate not found');
    }

    await this.shippingRateRepository.update(rateId, updateShippingRateDto);
    return await this.findRateById(rateId);
  }

  async deleteShippingRate(rateId: string): Promise<void> {
    const rate = await this.findRateById(rateId);
    if (!rate) {
      throw new NotFoundException('Shipping rate not found');
    }

    await this.shippingRateRepository.delete(rateId);
  }

  async findRateById(rateId: string): Promise<ShippingRate> {
    return await this.shippingRateRepository.findOne({
      where: { id: rateId },
    });
  }

  // Shipping Calculation
  async calculateShipping(calculateShippingDto: CalculateShippingDto): Promise<any[]> {
    const { shopId, productId, country, weight, orderAmount } = calculateShippingDto;

    // Get product to check if it requires shipping
    const product = await this.productRepository.findOne({
      where: { id: productId, shopId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.requiresShipping) {
      return [];
    }

    // Get shop to check if shipping is enabled
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.shippingEnabled) {
      throw new BadRequestException('Shipping is not enabled for this shop');
    }

    // Find applicable shipping zones
    const applicableZones = await this.findApplicableZones(shopId, country);

    if (applicableZones.length === 0) {
      throw new BadRequestException('No shipping available to this country');
    }

    // Get applicable rates from all zones
    const allRates = [];
    for (const zone of applicableZones) {
      const zoneRates = await this.getApplicableRates(zone.id, weight, orderAmount);
      allRates.push(...zoneRates.map(rate => ({
        ...rate,
        zoneName: zone.name,
      })));
    }

    // Apply free shipping if applicable
    const processedRates = this.applyFreeShipping(allRates, orderAmount, shop.freeShippingThreshold);

    return processedRates;
  }

  async calculateShippingForSession(sessionId: string): Promise<any[]> {
    // Get checkout session
    const session = await this.checkoutSessionRepository.findOne({
      where: { sessionId },
      relations: ['product', 'shop'],
    });

    if (!session) {
      throw new NotFoundException('Checkout session not found');
    }

    // If product relation is null, load it manually
    if (!session.product) {
      session.product = await this.productRepository.findOne({
        where: { id: session.productId }
      });
    }

    if (!session.product) {
      throw new NotFoundException('Product not found for this checkout session');
    }

    if (!session.product.requiresShipping) {
      return [];
    }

    // Get shipping address country from session
    let country = session.shippingCountry;

    // If no shipping country provided, assume US as default for demo purposes
    if (!country) {
      console.warn('No shipping country provided, assuming US as default');
      country = 'US';
    }

    try {
      console.log('Attempting to calculate shipping for country:', country);
      console.log('Shop ID:', session.shopId, 'Product ID:', session.productId);

      // Try to calculate shipping using configured zones
      const rates = await this.calculateShipping({
        shopId: session.shopId,
        productId: session.productId,
        quantity: 1, // Default quantity for single product
        country,
        weight: session.product.weight || 1, // Default weight to 1kg if not specified
        orderAmount: session.productPrice,
        city: session.shippingCity || 'Unknown',
        state: session.shippingState || 'Unknown',
        postalCode: session.shippingPostalCode || '00000',
      });

      console.log('Calculated rates:', rates);

      // If we got rates, return them
      if (rates && rates.length > 0) {
        return rates;
      }
    } catch (error) {
      console.warn('Shipping calculation failed, using default rates:', error.message);
      console.warn('Full error:', error);
      // Don't re-throw, continue to default rates
    }

    // If no shipping zones are configured or calculation failed, provide default rates
    const orderAmount = session.productPrice;
    const isDomestic = ['US', 'USA', 'United States'].includes(country);

    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: isDomestic ? 'Standard Shipping' : 'International Standard',
        description: isDomestic ? '5-7 business days' : '10-15 business days',
        price: isDomestic ? 9.99 : 29.99,
        deliveryTime: isDomestic ? '5-7 days' : '10-15 days',
        zoneId: 'default-zone'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: isDomestic ? 'Express Shipping' : 'International Express',
        description: isDomestic ? '2-3 business days' : '5-7 business days',
        price: isDomestic ? 19.99 : 59.99,
        deliveryTime: isDomestic ? '2-3 days' : '5-7 days',
        zoneId: 'default-zone'
      },
      // Add free shipping option for orders over $50 (domestic only)
      ...(orderAmount >= 50 && isDomestic ? [{
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Free Shipping',
        description: '7-10 business days',
        price: 0,
        deliveryTime: '7-10 days',
        zoneId: 'default-zone'
      }] : [])
    ];
  }

  // Helper methods
  private async findApplicableZones(shopId: string, country: string): Promise<ShippingZone[]> {
    // Get all zones for the shop and filter in application code
    const zones = await this.shippingZoneRepository
      .createQueryBuilder('zone')
      .where('zone.shopId = :shopId', { shopId })
      .andWhere('zone.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('zone.rates', 'rates')
      .andWhere('rates.isActive = :ratesActive', { ratesActive: true })
      .orderBy('zone.name', 'ASC')
      .getMany();

    // Filter zones that include the country
    return zones.filter(zone => {
      // Handle different data types for countries field
      if (Array.isArray(zone.countries)) {
        return zone.countries.includes(country);
      } else if (typeof zone.countries === 'string') {
        try {
          const parsed = JSON.parse(zone.countries);
          return Array.isArray(parsed) && parsed.includes(country);
        } catch {
          return false;
        }
      }
      return false;
    });
  }

  private async getApplicableRates(zoneId: string, weight?: number, orderAmount?: number): Promise<ShippingRate[]> {
    const queryBuilder = this.shippingRateRepository.createQueryBuilder('rate')
      .where('rate.zoneId = :zoneId', { zoneId })
      .andWhere('rate.isActive = :isActive', { isActive: true });

    // Apply weight filter if specified
    if (weight !== undefined) {
      queryBuilder.andWhere('(rate.maxWeight IS NULL OR rate.maxWeight >= :weight)', { weight });
    }

    // Apply order amount filter if specified
    if (orderAmount !== undefined) {
      queryBuilder.andWhere('(rate.minOrderAmount IS NULL OR rate.minOrderAmount <= :orderAmount)', { orderAmount });
    }

    return await queryBuilder.orderBy('rate.price', 'ASC').getMany();
  }

  private applyFreeShipping(rates: ShippingRate[], orderAmount?: number, freeShippingThreshold?: number): any[] {
    if (!orderAmount || !freeShippingThreshold) {
      return rates;
    }

    if (orderAmount >= freeShippingThreshold) {
      // Add free shipping option
      return [
        {
          id: 'free_shipping',
          name: 'Free Shipping',
          description: 'Qualifies for free shipping',
          price: 0,
          deliveryTime: 'Standard delivery time',
          zoneName: 'Default',
        },
        ...rates.map(rate => ({
          ...rate,
          originalPrice: rate.price,
          price: 0,
          description: `${rate.description} (FREE)`,
        })),
      ];
    }

    return rates;
  }

  // Permission checks
  async canUserAccessShop(userId: string, shopId: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId, ownerId: userId },
    });
    return !!shop;
  }

  // Shop shipping settings
  async getShippingSettings(shopId: string) {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const zones = await this.getShippingZones(shopId);
    const totalRates = await this.shippingRateRepository.count({
      where: { zone: { shopId }, isActive: true },
    });

    return {
      shopId,
      shippingEnabled: shop.shippingEnabled,
      freeShippingThreshold: shop.freeShippingThreshold,
      totalZones: zones.length,
      totalRates,
      zones,
    };
  }

  async updateShippingSettings(shopId: string, settings: {
    shippingEnabled?: boolean;
    freeShippingThreshold?: number;
  }) {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.shopRepository.update(shopId, settings);
    return await this.getShippingSettings(shopId);
  }

  // Admin methods
  async getAllShippingZones(): Promise<ShippingZone[]> {
    return await this.shippingZoneRepository.find({
      relations: ['shop', 'rates'],
      order: { createdAt: 'DESC' },
    });
  }

  async getShippingStats() {
    const totalZones = await this.shippingZoneRepository.count();
    const totalRates = await this.shippingRateRepository.count();
    const activeZones = await this.shippingZoneRepository.count({ where: { isActive: true } });
    const activeRates = await this.shippingRateRepository.count({ where: { isActive: true } });

    // Get zones per shop
    const zonesPerShop = await this.shippingZoneRepository
      .createQueryBuilder('zone')
      .select('zone.shopId', 'shopId')
      .addSelect('COUNT(zone.id)', 'count')
      .groupBy('zone.shopId')
      .getRawMany();

    // Get average shipping rate
    const avgRateResult = await this.shippingRateRepository
      .createQueryBuilder('rate')
      .select('AVG(rate.price)', 'avgPrice')
      .where('rate.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalZones,
      totalRates,
      activeZones,
      activeRates,
      zonesPerShop: zonesPerShop.length,
      avgShippingRate: parseFloat(avgRateResult?.avgPrice) || 0,
    };
  }
}