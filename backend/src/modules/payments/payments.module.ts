import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Shop } from '../shops/entities/shop.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shop,
      CheckoutSession,
      Order,
      Subscription,
    ]),
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}