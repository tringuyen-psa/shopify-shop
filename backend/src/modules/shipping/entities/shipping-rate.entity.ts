import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';
import { CheckoutSession } from '../../checkout/entities/checkout-session.entity';

@Entity('shipping_rates')
export class ShippingRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Conditions
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number; // Áp dụng khi đơn >= amount này

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxWeight: number; // kg, áp dụng khi đơn <= weight này

  // Delivery time
  @Column({ nullable: true })
  minDeliveryDays: number; // 3 days

  @Column({ nullable: true })
  maxDeliveryDays: number; // 5 days

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ShippingZone, zone => zone.rates)
  @JoinColumn({ name: 'zone_id' })
  zone: ShippingZone;

  @Column()
  zoneId: string;

  @OneToMany(() => CheckoutSession, session => session.shippingRate)
  checkoutSessions: CheckoutSession[];
}