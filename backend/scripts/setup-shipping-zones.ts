import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { ShippingZone } from '../src/modules/shipping/entities/shipping-zone.entity';
import { ShippingRate } from '../src/modules/shipping/entities/shipping-rate.entity';
import { Shop } from '../src/modules/shops/entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
class ShippingSetupService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(ShippingZone)
    private readonly shippingZoneRepository: Repository<ShippingZone>,
    @InjectRepository(ShippingRate)
    private readonly shippingRateRepository: Repository<ShippingRate>,
  ) {}

  async setupShippingZones() {
    console.log('Setting up shipping zones for shops...');

    // Get active shops
    const shops = await this.shopRepository.find({
      where: { isActive: true }
    });

    console.log(`Found ${shops.length} active shops`);

    for (const shop of shops) {
      console.log(`Setting up shipping zones for shop: ${shop.name}`);

      // Check if shipping zones already exist
      const existingZones = await this.shippingZoneRepository.find({
        where: { shopId: shop.id }
      });

      if (existingZones.length > 0) {
        console.log(`Shop ${shop.name} already has ${existingZones.length} shipping zones. Skipping...`);
        continue;
      }

      // Create Domestic Shipping Zone (US)
      const domesticZone = await this.shippingZoneRepository.save({
        name: 'Domestic Shipping',
        shopId: shop.id,
        countries: ['US'],
        isActive: true
      });

      // Create International Shipping Zone
      const internationalZone = await this.shippingZoneRepository.save({
        name: 'International Shipping',
        shopId: shop.id,
        countries: ['CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'JP', 'AU', 'VN', 'TH', 'SG', 'MY', 'PH', 'ID'],
        isActive: true
      });

      // Create Domestic Shipping Rates
      await this.shippingRateRepository.save([
        {
          zoneId: domesticZone.id,
          name: 'Standard Shipping',
          description: '5-7 business days',
          price: 9.99,
          deliveryTime: '5-7 days',
          minOrderAmount: null,
          maxWeight: 10,
          isActive: true
        },
        {
          zoneId: domesticZone.id,
          name: 'Express Shipping',
          description: '2-3 business days',
          price: 19.99,
          deliveryTime: '2-3 days',
          minOrderAmount: null,
          maxWeight: 10,
          isActive: true
        },
        {
          zoneId: domesticZone.id,
          name: 'Free Shipping',
          description: '7-10 business days',
          price: 0,
          deliveryTime: '7-10 days',
          minOrderAmount: 50,
          maxWeight: 10,
          isActive: true
        }
      ]);

      // Create International Shipping Rates
      await this.shippingRateRepository.save([
        {
          zoneId: internationalZone.id,
          name: 'International Standard',
          description: '10-15 business days',
          price: 29.99,
          deliveryTime: '10-15 days',
          minOrderAmount: null,
          maxWeight: 5,
          isActive: true
        },
        {
          zoneId: internationalZone.id,
          name: 'International Express',
          description: '5-7 business days',
          price: 59.99,
          deliveryTime: '5-7 days',
          minOrderAmount: null,
          maxWeight: 5,
          isActive: true
        }
      ]);

      console.log(`Created shipping zones for shop: ${shop.name}`);
    }

    console.log('Shipping zones setup completed!');
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const shippingService = app.get(ShippingSetupService);

  try {
    await shippingService.setupShippingZones();
    console.log('✅ Shipping zones setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up shipping zones:', error);
  } finally {
    await app.close();
  }
}

bootstrap();