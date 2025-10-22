import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { CheckoutSession } from '../../checkout/entities/checkout-session.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { ShippingZone } from '../../shipping/entities/shipping-zone.entity';
import { KycVerification } from '../../stripe-connect/entities/kyc-verification.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  // Stripe Connect fields
  @Column({ unique: true, nullable: true })
  stripeAccountId: string;

  @Column({ default: false })
  stripeOnboardingComplete: boolean;

  @Column({ default: false })
  stripeChargesEnabled: boolean;

  @Column({ default: false })
  stripePayoutsEnabled: boolean;

  // KYC Verification fields
  @Column({ type: 'varchar', length: 50, default: 'none' })
  kycStatus: 'none' | 'pending' | 'in_review' | 'additional_information_required' | 'approved' | 'rejected' | 'restricted';

  @Column({ type: 'date', nullable: true })
  kycSubmittedAt: Date;

  @Column({ type: 'date', nullable: true })
  kycVerifiedAt: Date;

  @Column({ type: 'date', nullable: true })
  kycRejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  kycRejectionReason: string;

  @Column({ type: 'json', nullable: true })
  kycRequirements: any;

  @Column({ type: 'json', nullable: true })
  kycCapabilities: any;

  @Column({ default: false })
  hasValidKyc: boolean;

  @Column({ type: 'uuid', nullable: true })
  currentKycVerificationId: string;

  // Platform settings
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  platformFeePercent: number;

  @Column({ default: false })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: 'pending' | 'active' | 'suspended' | 'rejected';

  // Shipping settings
  @Column({ default: true })
  shippingEnabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  freeShippingThreshold: number;

  // Address
  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'text', nullable: true })
  suspendedReason: string;

  @Column({ nullable: true })
  suspendedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.shops)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => Product, product => product.shop)
  products: Product[];

  @OneToMany(() => Order, order => order.shop)
  orders: Order[];

  @OneToMany(() => CheckoutSession, session => session.shop)
  checkoutSessions: CheckoutSession[];

  @OneToMany(() => Subscription, subscription => subscription.shop)
  subscriptions: Subscription[];

  @OneToMany(() => ShippingZone, zone => zone.shop)
  shippingZones: ShippingZone[];

  @OneToMany(() => KycVerification, kycVerification => kycVerification.shop)
  kycVerifications: KycVerification[];

  // Subscription plan fields
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: null,
  })
  subscriptionPlan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus' | null;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  subscriptionPrice: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  subscriptionPeriod: string; // 'monthly', 'yearly'

  @Column({ type: 'date', nullable: true })
  subscriptionStartsAt: Date;

  @Column({ type: 'date', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ default: false })
  subscriptionActive: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  stripeSubscriptionId: string;
}