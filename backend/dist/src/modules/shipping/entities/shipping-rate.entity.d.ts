import { ShippingZone } from './shipping-zone.entity';
import { CheckoutSession } from '../../checkout/entities/checkout-session.entity';
export declare class ShippingRate {
    id: string;
    name: string;
    description: string;
    price: number;
    minOrderAmount: number;
    maxWeight: number;
    minDeliveryDays: number;
    maxDeliveryDays: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    zone: ShippingZone;
    zoneId: string;
    checkoutSessions: CheckoutSession[];
}
