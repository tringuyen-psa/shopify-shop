import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { CheckoutSession } from '../../checkout/entities/checkout-session.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string; // #1001

  // Relations
  @ManyToOne(() => CheckoutSession, session => session.orders)
  @JoinColumn({ name: 'checkout_session_id' })
  checkoutSession: CheckoutSession;

  @Column({ nullable: true })
  checkoutSessionId: string;

  @ManyToOne(() => Shop, shop => shop.orders)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => Product, product => product.orders)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => User, user => user.orders, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ nullable: true })
  customerId: string;

  // Customer info (snapshot)
  @Column()
  customerEmail: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  // Shipping address
  @Column({ nullable: true })
  shippingAddressLine1: string;

  @Column({ nullable: true })
  shippingAddressLine2: string;

  @Column({ nullable: true })
  shippingCity: string;

  @Column({ nullable: true })
  shippingState: string;

  @Column({ nullable: true })
  shippingCountry: string;

  @Column({ nullable: true })
  shippingPostalCode: string;

  // Shipping info
  @Column({ nullable: true })
  shippingMethodName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  carrier: string; // 'USPS', 'FedEx', etc.

  @Column({ nullable: true })
  estimatedDelivery: Date;

  // Pricing breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCostAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // Platform fee
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shopRevenue: number; // Amount shop receives

  // Payment
  @Column({
    type: 'varchar',
    length: 50,
    default: 'one_time',
  })
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';

  @Column({ default: 'stripe' })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Subscription (if applicable)
  @ManyToOne(() => Subscription, subscription => subscription.orders, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ nullable: true })
  subscriptionId: string;

  // Order status
  @Column({
    type: 'varchar',
    length: 50,
    default: 'unfulfilled',
  })
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';

  // Notes
  @Column({ type: 'text', nullable: true })
  customerNote: string;

  @Column({ type: 'text', nullable: true })
  internalNote: string;

  // Timestamps
  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  fulfilledAt: Date;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => OrderItem, item => item.order)
  orderItems: OrderItem[];
}