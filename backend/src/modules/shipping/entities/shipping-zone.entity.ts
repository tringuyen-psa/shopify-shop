import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { ShippingRate } from './shipping-rate.entity';

@Entity('shipping_zones')
export class ShippingZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'json' })
  countries: string[]; // ["VN", "US", "JP"]

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Shop, shop => shop.shippingZones)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shopId: string;

  @OneToMany(() => ShippingRate, rate => rate.zone)
  rates: ShippingRate[];
}