"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const shipping_zone_entity_1 = require("../src/modules/shipping/entities/shipping-zone.entity");
const shipping_rate_entity_1 = require("../src/modules/shipping/entities/shipping-rate.entity");
const shop_entity_1 = require("../src/modules/shops/entities/shop.entity");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
let ShippingSetupService = class ShippingSetupService {
    constructor(shopRepository, shippingZoneRepository, shippingRateRepository) {
        this.shopRepository = shopRepository;
        this.shippingZoneRepository = shippingZoneRepository;
        this.shippingRateRepository = shippingRateRepository;
    }
    async setupShippingZones() {
        console.log('Setting up shipping zones for shops...');
        const shops = await this.shopRepository.find({
            where: { isActive: true }
        });
        console.log(`Found ${shops.length} active shops`);
        for (const shop of shops) {
            console.log(`Setting up shipping zones for shop: ${shop.name}`);
            const existingZones = await this.shippingZoneRepository.find({
                where: { shopId: shop.id }
            });
            if (existingZones.length > 0) {
                console.log(`Shop ${shop.name} already has ${existingZones.length} shipping zones. Skipping...`);
                continue;
            }
            const domesticZone = await this.shippingZoneRepository.save({
                name: 'Domestic Shipping',
                shopId: shop.id,
                countries: ['US'],
                isActive: true
            });
            const internationalZone = await this.shippingZoneRepository.save({
                name: 'International Shipping',
                shopId: shop.id,
                countries: ['CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'JP', 'AU', 'VN', 'TH', 'SG', 'MY', 'PH', 'ID'],
                isActive: true
            });
            await this.shippingRateRepository.save([
                {
                    zoneId: domesticZone.id,
                    name: 'Standard Shipping',
                    description: '5-7 business days',
                    price: 9.99,
                    deliveryTime: '5-7 days',
                    minOrderAmount: null,
                    maxWeight: 10,
                    isActive: true
                },
                {
                    zoneId: domesticZone.id,
                    name: 'Express Shipping',
                    description: '2-3 business days',
                    price: 19.99,
                    deliveryTime: '2-3 days',
                    minOrderAmount: null,
                    maxWeight: 10,
                    isActive: true
                },
                {
                    zoneId: domesticZone.id,
                    name: 'Free Shipping',
                    description: '7-10 business days',
                    price: 0,
                    deliveryTime: '7-10 days',
                    minOrderAmount: 50,
                    maxWeight: 10,
                    isActive: true
                }
            ]);
            await this.shippingRateRepository.save([
                {
                    zoneId: internationalZone.id,
                    name: 'International Standard',
                    description: '10-15 business days',
                    price: 29.99,
                    deliveryTime: '10-15 days',
                    minOrderAmount: null,
                    maxWeight: 5,
                    isActive: true
                },
                {
                    zoneId: internationalZone.id,
                    name: 'International Express',
                    description: '5-7 business days',
                    price: 59.99,
                    deliveryTime: '5-7 days',
                    minOrderAmount: null,
                    maxWeight: 5,
                    isActive: true
                }
            ]);
            console.log(`Created shipping zones for shop: ${shop.name}`);
        }
        console.log('Shipping zones setup completed!');
    }
};
ShippingSetupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(shop_entity_1.Shop)),
    __param(1, (0, typeorm_2.InjectRepository)(shipping_zone_entity_1.ShippingZone)),
    __param(2, (0, typeorm_2.InjectRepository)(shipping_rate_entity_1.ShippingRate)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], ShippingSetupService);
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const shippingService = app.get(ShippingSetupService);
    try {
        await shippingService.setupShippingZones();
        console.log('✅ Shipping zones setup completed successfully!');
    }
    catch (error) {
        console.error('❌ Error setting up shipping zones:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=setup-shipping-zones.js.map