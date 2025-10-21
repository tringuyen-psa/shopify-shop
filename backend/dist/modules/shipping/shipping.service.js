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
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shipping_zone_entity_1 = require("./entities/shipping-zone.entity");
const shipping_rate_entity_1 = require("./entities/shipping-rate.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const product_entity_1 = require("../products/entities/product.entity");
const checkout_session_entity_1 = require("../checkout/entities/checkout-session.entity");
let ShippingService = class ShippingService {
    constructor(shippingZoneRepository, shippingRateRepository, shopRepository, productRepository, checkoutSessionRepository) {
        this.shippingZoneRepository = shippingZoneRepository;
        this.shippingRateRepository = shippingRateRepository;
        this.shopRepository = shopRepository;
        this.productRepository = productRepository;
        this.checkoutSessionRepository = checkoutSessionRepository;
    }
    async getShippingZones(shopId) {
        return await this.shippingZoneRepository.find({
            where: { shopId, isActive: true },
            relations: ['rates'],
            order: { name: 'ASC' },
        });
    }
    async createShippingZone(shopId, createShippingZoneDto) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const existingZone = await this.shippingZoneRepository.findOne({
            where: { shopId, name: createShippingZoneDto.name },
        });
        if (existingZone) {
            throw new common_1.BadRequestException('Shipping zone with this name already exists for this shop');
        }
        const zone = await this.shippingZoneRepository.save({
            shopId,
            name: createShippingZoneDto.name,
            countries: createShippingZoneDto.countries,
            isActive: createShippingZoneDto.isActive ?? true,
        });
        return await this.findZoneById(zone.id, ['rates']);
    }
    async updateShippingZone(zoneId, updateShippingZoneDto) {
        const zone = await this.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        if (updateShippingZoneDto.name && updateShippingZoneDto.name !== zone.name) {
            const existingZone = await this.shippingZoneRepository.findOne({
                where: { shopId: zone.shopId, name: updateShippingZoneDto.name },
            });
            if (existingZone) {
                throw new common_1.BadRequestException('Shipping zone with this name already exists for this shop');
            }
        }
        await this.shippingZoneRepository.update(zoneId, updateShippingZoneDto);
        return await this.findZoneById(zoneId, ['rates']);
    }
    async deleteShippingZone(zoneId) {
        const zone = await this.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        const ratesCount = await this.shippingRateRepository.count({
            where: { zoneId },
        });
        if (ratesCount > 0) {
            throw new common_1.BadRequestException('Cannot delete shipping zone with existing rates. Please delete all rates first.');
        }
        await this.shippingZoneRepository.delete(zoneId);
    }
    async findZoneById(zoneId, relations) {
        return await this.shippingZoneRepository.findOne({
            where: { id: zoneId },
            relations,
        });
    }
    async getShippingRates(zoneId) {
        return await this.shippingRateRepository.find({
            where: { zoneId, isActive: true },
            order: { price: 'ASC' },
        });
    }
    async createShippingRate(zoneId, createShippingRateDto) {
        const zone = await this.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        const rate = await this.shippingRateRepository.save({
            zoneId,
            name: createShippingRateDto.name,
            description: createShippingRateDto.description,
            price: createShippingRateDto.price,
            minOrderAmount: createShippingRateDto.minOrderAmount,
            maxWeight: createShippingRateDto.maxWeight,
            minDeliveryDays: createShippingRateDto.minDeliveryDays,
            maxDeliveryDays: createShippingRateDto.maxDeliveryDays,
            isActive: createShippingRateDto.isActive ?? true,
        });
        return rate;
    }
    async updateShippingRate(rateId, updateShippingRateDto) {
        const rate = await this.findRateById(rateId);
        if (!rate) {
            throw new common_1.NotFoundException('Shipping rate not found');
        }
        await this.shippingRateRepository.update(rateId, updateShippingRateDto);
        return await this.findRateById(rateId);
    }
    async deleteShippingRate(rateId) {
        const rate = await this.findRateById(rateId);
        if (!rate) {
            throw new common_1.NotFoundException('Shipping rate not found');
        }
        await this.shippingRateRepository.delete(rateId);
    }
    async findRateById(rateId) {
        return await this.shippingRateRepository.findOne({
            where: { id: rateId },
        });
    }
    async calculateShipping(calculateShippingDto) {
        const { shopId, productId, country, weight, orderAmount } = calculateShippingDto;
        const product = await this.productRepository.findOne({
            where: { id: productId, shopId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.requiresShipping) {
            return [];
        }
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop || !shop.shippingEnabled) {
            throw new common_1.BadRequestException('Shipping is not enabled for this shop');
        }
        const applicableZones = await this.findApplicableZones(shopId, country);
        if (applicableZones.length === 0) {
            throw new common_1.BadRequestException('No shipping available to this country');
        }
        const allRates = [];
        for (const zone of applicableZones) {
            const zoneRates = await this.getApplicableRates(zone.id, weight, orderAmount);
            allRates.push(...zoneRates.map(rate => ({
                ...rate,
                zoneName: zone.name,
            })));
        }
        const processedRates = this.applyFreeShipping(allRates, orderAmount, shop.freeShippingThreshold);
        return processedRates;
    }
    async calculateShippingForSession(sessionId) {
        const session = await this.checkoutSessionRepository.findOne({
            where: { sessionId },
            relations: ['product', 'shop'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Checkout session not found');
        }
        if (!session.product.requiresShipping) {
            return [];
        }
        const country = session.shippingCountry;
        if (!country) {
            throw new common_1.BadRequestException('Shipping country not specified');
        }
        return await this.calculateShipping({
            shopId: session.shopId,
            productId: session.productId,
            quantity: 1,
            country,
            weight: session.product.weight,
            orderAmount: session.productPrice,
            city: session.shippingCity || 'Unknown',
            state: session.shippingState || 'Unknown',
            postalCode: session.shippingPostalCode || '00000',
        });
    }
    async findApplicableZones(shopId, country) {
        return await this.shippingZoneRepository
            .createQueryBuilder('zone')
            .where('zone.shopId = :shopId', { shopId })
            .andWhere('zone.isActive = :isActive', { isActive: true })
            .andWhere(':country = ANY(zone.countries)', { country })
            .leftJoinAndSelect('zone.rates', 'rates')
            .andWhere('rates.isActive = :ratesActive', { ratesActive: true })
            .orderBy('zone.name', 'ASC')
            .getMany();
    }
    async getApplicableRates(zoneId, weight, orderAmount) {
        const queryBuilder = this.shippingRateRepository.createQueryBuilder('rate')
            .where('rate.zoneId = :zoneId', { zoneId })
            .andWhere('rate.isActive = :isActive', { isActive: true });
        if (weight !== undefined) {
            queryBuilder.andWhere('(rate.maxWeight IS NULL OR rate.maxWeight >= :weight)', { weight });
        }
        if (orderAmount !== undefined) {
            queryBuilder.andWhere('(rate.minOrderAmount IS NULL OR rate.minOrderAmount <= :orderAmount)', { orderAmount });
        }
        return await queryBuilder.orderBy('rate.price', 'ASC').getMany();
    }
    applyFreeShipping(rates, orderAmount, freeShippingThreshold) {
        if (!orderAmount || !freeShippingThreshold) {
            return rates;
        }
        if (orderAmount >= freeShippingThreshold) {
            return [
                {
                    id: 'free_shipping',
                    name: 'Free Shipping',
                    description: 'Qualifies for free shipping',
                    price: 0,
                    deliveryTime: 'Standard delivery time',
                    zoneName: 'Default',
                },
                ...rates.map(rate => ({
                    ...rate,
                    originalPrice: rate.price,
                    price: 0,
                    description: `${rate.description} (FREE)`,
                })),
            ];
        }
        return rates;
    }
    async canUserAccessShop(userId, shopId) {
        const shop = await this.shopRepository.findOne({
            where: { id: shopId, ownerId: userId },
        });
        return !!shop;
    }
    async getShippingSettings(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const zones = await this.getShippingZones(shopId);
        const totalRates = await this.shippingRateRepository.count({
            where: { zone: { shopId }, isActive: true },
        });
        return {
            shopId,
            shippingEnabled: shop.shippingEnabled,
            freeShippingThreshold: shop.freeShippingThreshold,
            totalZones: zones.length,
            totalRates,
            zones,
        };
    }
    async updateShippingSettings(shopId, settings) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        await this.shopRepository.update(shopId, settings);
        return await this.getShippingSettings(shopId);
    }
    async getAllShippingZones() {
        return await this.shippingZoneRepository.find({
            relations: ['shop', 'rates'],
            order: { createdAt: 'DESC' },
        });
    }
    async getShippingStats() {
        const totalZones = await this.shippingZoneRepository.count();
        const totalRates = await this.shippingRateRepository.count();
        const activeZones = await this.shippingZoneRepository.count({ where: { isActive: true } });
        const activeRates = await this.shippingRateRepository.count({ where: { isActive: true } });
        const zonesPerShop = await this.shippingZoneRepository
            .createQueryBuilder('zone')
            .select('zone.shopId', 'shopId')
            .addSelect('COUNT(zone.id)', 'count')
            .groupBy('zone.shopId')
            .getRawMany();
        const avgRateResult = await this.shippingRateRepository
            .createQueryBuilder('rate')
            .select('AVG(rate.price)', 'avgPrice')
            .where('rate.isActive = :isActive', { isActive: true })
            .getRawOne();
        return {
            totalZones,
            totalRates,
            activeZones,
            activeRates,
            zonesPerShop: zonesPerShop.length,
            avgShippingRate: parseFloat(avgRateResult?.avgPrice) || 0,
        };
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipping_zone_entity_1.ShippingZone)),
    __param(1, (0, typeorm_1.InjectRepository)(shipping_rate_entity_1.ShippingRate)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_1.InjectRepository)(checkout_session_entity_1.CheckoutSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map