import { Shop } from '../../shops/entities/shop.entity';
import { Order } from '../../orders/entities/order.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'customer' | 'shop_owner' | 'platform_admin';
    phone: string;
    avatar: string;
    emailVerified: boolean;
    emailVerificationToken: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    isActive: boolean;
    suspendedReason: string;
    suspendedUntil: Date;
    createdAt: Date;
    updatedAt: Date;
    shops: Shop[];
    orders: Order[];
    subscriptions: Subscription[];
}
