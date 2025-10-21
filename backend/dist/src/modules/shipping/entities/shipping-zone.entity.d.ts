import { Shop } from '../../shops/entities/shop.entity';
import { ShippingRate } from './shipping-rate.entity';
export declare class ShippingZone {
    id: string;
    name: string;
    countries: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    shop: Shop;
    shopId: string;
    rates: ShippingRate[];
}
