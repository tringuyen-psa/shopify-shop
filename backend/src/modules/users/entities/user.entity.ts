import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { Order } from '../../orders/entities/order.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'customer',
  })
  role: 'customer' | 'shop_owner' | 'platform_admin';

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  suspendedReason: string;

  @Column({ nullable: true })
  suspendedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Shop, shop => shop.owner)
  shops: Shop[];

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Subscription, subscription => subscription.customer)
  subscriptions: Subscription[];
}