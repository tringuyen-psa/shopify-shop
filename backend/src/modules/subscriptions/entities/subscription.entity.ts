import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations
  @ManyToOne(() => Order, order => order.subscription)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, product => product.subscriptions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Shop, shop => shop.subscriptions)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column()
  customerId: string;

  // Stripe
  @Column({ unique: true })
  stripeSubscriptionId: string;

  @Column()
  stripeCustomerId: string;

  // Billing
  @Column({
    type: 'varchar',
    length: 50,
  })
  billingCycle: 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shopRevenue: number;

  // Shipping (for physical subscriptions)
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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  // Status
  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing' | 'paused';

  @Column()
  currentPeriodStart: Date;

  @Column()
  currentPeriodEnd: Date;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  // Renewal count
  @Column({ default: 0 })
  renewalCount: number;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  pausedAt: Date;

  @Column({ type: 'text', nullable: true })
  pauseReason: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  resumeAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, order => order.subscription)
  orders: Order[];
}