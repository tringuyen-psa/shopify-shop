import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CheckoutSession } from './entities/checkout-session.entity';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { ProductsModule } from '../products/products.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutSession]),
    ConfigModule,
    ProductsModule,
    ShippingModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}