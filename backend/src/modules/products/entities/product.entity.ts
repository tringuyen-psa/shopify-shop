import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CheckoutSession } from '../../checkout/entities/checkout-session.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  // Subscription pricing
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weeklyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  yearlyPrice: number;

  // Product type
  @Column({
    type: 'varchar',
    length: 50,
    default: 'physical',
  })
  productType: 'physical' | 'digital';

  // Physical product fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number; // kg

  @Column({ default: true })
  requiresShipping: boolean;

  // Digital product fields
  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  downloadLimit: number;

  // Inventory
  @Column({ default: false })
  trackInventory: boolean;

  @Column({ default: 0 })
  inventoryQuantity: number;

  @Column({ default: false })
  allowBackorder: boolean;

  // Media
  @Column({ type: 'json', nullable: true })
  images: string[];

  // Categorization
  @Column({ nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  // Subscription settings
  @Column({ default: false })
  isSubscription: boolean;

  @Column({ default: 0 })
  trialDays: number;

  // Features
  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerItem: number;

  @Column({ nullable: true })
  barcode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Shop, shop => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @OneToMany(() => Order, order => order.product)
  orders: Order[];

  @OneToMany(() => CheckoutSession, session => session.product)
  checkoutSessions: CheckoutSession[];

  @OneToMany(() => Subscription, subscription => subscription.product)
  subscriptions: Subscription[];

  @OneToMany(() => OrderItem, item => item.product)
  orderItems: OrderItem[];
}