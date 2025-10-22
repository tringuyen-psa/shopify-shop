import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ProductsModule } from './modules/products/products.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PlatformModule } from './modules/platform/platform.module';
import { HealthModule } from './modules/health/health.module';
import { StripeConnectModule } from './modules/stripe-connect/stripe-connect.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only for development
      logging: true,
    }),
    AuthModule,
    UsersModule,
    ShopsModule,
    ProductsModule,
    ShippingModule,
    CheckoutModule,
    OrdersModule,
    SubscriptionsModule,
    PaymentsModule,
    PlatformModule,
    HealthModule,
    // StripeConnectModule, // Temporarily disabled due to compilation errors
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}