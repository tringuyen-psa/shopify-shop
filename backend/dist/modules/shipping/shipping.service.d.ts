import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingRate } from './entities/shipping-rate.entity';
import { Shop } from '../shops/entities/shop.entity';
import { Product } from '../products/entities/product.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
export declare class ShippingService {
    private readonly shippingZoneRepository;
    private readonly shippingRateRepository;
    private readonly shopRepository;
    private readonly productRepository;
    private readonly checkoutSessionRepository;
    constructor(shippingZoneRepository: Repository<ShippingZone>, shippingRateRepository: Repository<ShippingRate>, shopRepository: Repository<Shop>, productRepository: Repository<Product>, checkoutSessionRepository: Repository<CheckoutSession>);
    getShippingZones(shopId: string): Promise<ShippingZone[]>;
    createShippingZone(shopId: string, createShippingZoneDto: CreateShippingZoneDto): Promise<ShippingZone>;
    updateShippingZone(zoneId: string, updateShippingZoneDto: UpdateShippingZoneDto): Promise<ShippingZone>;
    deleteShippingZone(zoneId: string): Promise<void>;
    findZoneById(zoneId: string, relations?: string[]): Promise<ShippingZone>;
    getShippingRates(zoneId: string): Promise<ShippingRate[]>;
    createShippingRate(zoneId: string, createShippingRateDto: CreateShippingRateDto): Promise<ShippingRate>;
    updateShippingRate(rateId: string, updateShippingRateDto: UpdateShippingRateDto): Promise<ShippingRate>;
    deleteShippingRate(rateId: string): Promise<void>;
    findRateById(rateId: string): Promise<ShippingRate>;
    calculateShipping(calculateShippingDto: CalculateShippingDto): Promise<any[]>;
    calculateShippingForSession(sessionId: string): Promise<any[]>;
    private findApplicableZones;
    private getApplicableRates;
    private applyFreeShipping;
    canUserAccessShop(userId: string, shopId: string): Promise<boolean>;
    getShippingSettings(shopId: string): Promise<{
        shopId: string;
        shippingEnabled: boolean;
        freeShippingThreshold: number;
        totalZones: number;
        totalRates: number;
        zones: ShippingZone[];
    }>;
    updateShippingSettings(shopId: string, settings: {
        shippingEnabled?: boolean;
        freeShippingThreshold?: number;
    }): Promise<{
        shopId: string;
        shippingEnabled: boolean;
        freeShippingThreshold: number;
        totalZones: number;
        totalRates: number;
        zones: ShippingZone[];
    }>;
    getAllShippingZones(): Promise<ShippingZone[]>;
    getShippingStats(): Promise<{
        totalZones: number;
        totalRates: number;
        activeZones: number;
        activeRates: number;
        zonesPerShop: number;
        avgShippingRate: number;
    }>;
}
