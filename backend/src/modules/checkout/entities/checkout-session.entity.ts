import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { ShippingRate } from '../../shipping/entities/shipping-rate.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('checkout_sessions')
export class CheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string; // Public ID

  // Relations
  @ManyToOne(() => Product, product => product.checkoutSessions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => Shop, shop => shop.checkoutSessions)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => ShippingRate, rate => rate.checkoutSessions, { nullable: true })
  @JoinColumn({ name: 'shipping_rate_id' })
  shippingRate: ShippingRate;

  @Column({ nullable: true })
  shippingRateId: string;

  // Customer info
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  phone: string;

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
  shippingCountry: string; // Country code

  @Column({ nullable: true })
  shippingPostalCode: string;

  // Shipping method
  @Column({ nullable: true })
  shippingMethodName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  // Notes
  @Column({ type: 'text', nullable: true })
  customerNote: string;

  // Pricing
  @Column({
    type: 'varchar',
    length: 50,
    default: 'one_time',
  })
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number; // product_price + shipping_cost - discount

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  // Stripe
  @Column({ nullable: true })
  stripeCheckoutSessionId: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeAccountId: string;

  // Current step
  @Column({ default: 1 })
  currentStep: number; // 1: Info, 2: Shipping, 3: Payment

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: 'pending' | 'processing' | 'completed' | 'expired' | 'abandoned';

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, order => order.checkoutSession)
  orders: Order[];
}