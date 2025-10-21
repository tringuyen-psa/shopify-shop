import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingRate } from './entities/shipping-rate.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShippingZone,
      ShippingRate,
      Shop,
      Product,
      CheckoutSession,
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}