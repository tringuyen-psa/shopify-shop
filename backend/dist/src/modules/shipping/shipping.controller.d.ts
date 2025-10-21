import { ShippingService } from './shipping.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    getShippingZones(req: any, shopId: string): Promise<{
        success: boolean;
        data: import("./entities/shipping-zone.entity").ShippingZone[];
    }>;
    createShippingZone(req: any, shopId: string, createShippingZoneDto: CreateShippingZoneDto): Promise<{
        success: boolean;
        data: import("./entities/shipping-zone.entity").ShippingZone;
    }>;
    updateShippingZone(req: any, zoneId: string, updateShippingZoneDto: UpdateShippingZoneDto): Promise<{
        success: boolean;
        data: import("./entities/shipping-zone.entity").ShippingZone;
    }>;
    deleteShippingZone(req: any, zoneId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getShippingRates(zoneId: string): Promise<{
        success: boolean;
        data: import("./entities/shipping-rate.entity").ShippingRate[];
    }>;
    createShippingRate(req: any, zoneId: string, createShippingRateDto: CreateShippingRateDto): Promise<{
        success: boolean;
        data: import("./entities/shipping-rate.entity").ShippingRate;
    }>;
    updateShippingRate(req: any, rateId: string, updateShippingRateDto: UpdateShippingRateDto): Promise<{
        success: boolean;
        data: import("./entities/shipping-rate.entity").ShippingRate;
    }>;
    deleteShippingRate(req: any, rateId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    calculateShipping(calculateShippingDto: CalculateShippingDto): Promise<{
        success: boolean;
        data: {
            rates: any[];
            currency: string;
        };
    }>;
    calculateShippingForSession(sessionId: string): Promise<{
        success: boolean;
        data: {
            rates: any[];
            currency: string;
        };
    }>;
    getShippingSettings(req: any, shopId: string): Promise<{
        success: boolean;
        data: {
            shopId: string;
            shippingEnabled: boolean;
            freeShippingThreshold: number;
            totalZones: number;
            totalRates: number;
            zones: import("./entities/shipping-zone.entity").ShippingZone[];
        };
    }>;
    updateShippingSettings(req: any, shopId: string, body: {
        shippingEnabled?: boolean;
        freeShippingThreshold?: number;
    }): Promise<{
        success: boolean;
        data: {
            shopId: string;
            shippingEnabled: boolean;
            freeShippingThreshold: number;
            totalZones: number;
            totalRates: number;
            zones: import("./entities/shipping-zone.entity").ShippingZone[];
        };
    }>;
    getAllShippingZones(): Promise<{
        success: boolean;
        data: import("./entities/shipping-zone.entity").ShippingZone[];
    }>;
    getShippingStats(): Promise<{
        success: boolean;
        data: {
            totalZones: number;
            totalRates: number;
            activeZones: number;
            activeRates: number;
            zonesPerShop: number;
            avgShippingRate: number;
        };
    }>;
}
