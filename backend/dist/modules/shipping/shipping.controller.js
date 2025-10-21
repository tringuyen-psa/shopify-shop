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
exports.ShippingController = void 0;
const common_1 = require("@nestjs/common");
const shipping_service_1 = require("./shipping.service");
const create_shipping_zone_dto_1 = require("./dto/create-shipping-zone.dto");
const update_shipping_zone_dto_1 = require("./dto/update-shipping-zone.dto");
const create_shipping_rate_dto_1 = require("./dto/create-shipping-rate.dto");
const update_shipping_rate_dto_1 = require("./dto/update-shipping-rate.dto");
const calculate_shipping_dto_1 = require("./dto/calculate-shipping.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let ShippingController = class ShippingController {
    constructor(shippingService) {
        this.shippingService = shippingService;
    }
    async getShippingZones(req, shopId) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const zones = await this.shippingService.getShippingZones(shopId);
        return {
            success: true,
            data: zones,
        };
    }
    async createShippingZone(req, shopId, createShippingZoneDto) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const zone = await this.shippingService.createShippingZone(shopId, createShippingZoneDto);
        return {
            success: true,
            data: zone,
        };
    }
    async updateShippingZone(req, zoneId, updateShippingZoneDto) {
        const user = req.user;
        const zone = await this.shippingService.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shipping zone');
            }
        }
        const updatedZone = await this.shippingService.updateShippingZone(zoneId, updateShippingZoneDto);
        return {
            success: true,
            data: updatedZone,
        };
    }
    async deleteShippingZone(req, zoneId) {
        const user = req.user;
        const zone = await this.shippingService.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shipping zone');
            }
        }
        await this.shippingService.deleteShippingZone(zoneId);
        return {
            success: true,
            message: 'Shipping zone deleted successfully',
        };
    }
    async getShippingRates(zoneId) {
        const zone = await this.shippingService.findZoneById(zoneId);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        const rates = await this.shippingService.getShippingRates(zoneId);
        return {
            success: true,
            data: rates,
        };
    }
    async createShippingRate(req, zoneId, createShippingRateDto) {
        const user = req.user;
        const zone = await this.shippingService.findZoneById(zoneId, ['shop']);
        if (!zone) {
            throw new common_1.NotFoundException('Shipping zone not found');
        }
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shipping zone');
            }
        }
        const rate = await this.shippingService.createShippingRate(zoneId, createShippingRateDto);
        return {
            success: true,
            data: rate,
        };
    }
    async updateShippingRate(req, rateId, updateShippingRateDto) {
        const user = req.user;
        const rate = await this.shippingService.findRateById(rateId);
        if (!rate) {
            throw new common_1.NotFoundException('Shipping rate not found');
        }
        const zone = await this.shippingService.findZoneById(rate.zoneId, ['shop']);
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shipping rate');
            }
        }
        const updatedRate = await this.shippingService.updateShippingRate(rateId, updateShippingRateDto);
        return {
            success: true,
            data: updatedRate,
        };
    }
    async deleteShippingRate(req, rateId) {
        const user = req.user;
        const rate = await this.shippingService.findRateById(rateId);
        if (!rate) {
            throw new common_1.NotFoundException('Shipping rate not found');
        }
        const zone = await this.shippingService.findZoneById(rate.zoneId, ['shop']);
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shipping rate');
            }
        }
        await this.shippingService.deleteShippingRate(rateId);
        return {
            success: true,
            message: 'Shipping rate deleted successfully',
        };
    }
    async calculateShipping(calculateShippingDto) {
        try {
            const rates = await this.shippingService.calculateShipping(calculateShippingDto);
            return {
                success: true,
                data: {
                    rates,
                    currency: 'USD',
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async calculateShippingForSession(sessionId) {
        try {
            const rates = await this.shippingService.calculateShippingForSession(sessionId);
            return {
                success: true,
                data: {
                    rates,
                    currency: 'USD',
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getShippingSettings(req, shopId) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const settings = await this.shippingService.getShippingSettings(shopId);
        return {
            success: true,
            data: settings,
        };
    }
    async updateShippingSettings(req, shopId, body) {
        const user = req.user;
        if (user.role !== 'platform_admin') {
            const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You do not have access to this shop');
            }
        }
        const settings = await this.shippingService.updateShippingSettings(shopId, body);
        return {
            success: true,
            data: settings,
        };
    }
    async getAllShippingZones() {
        const zones = await this.shippingService.getAllShippingZones();
        return {
            success: true,
            data: zones,
        };
    }
    async getShippingStats() {
        const stats = await this.shippingService.getShippingStats();
        return {
            success: true,
            data: stats,
        };
    }
};
exports.ShippingController = ShippingController;
__decorate([
    (0, common_1.Get)('shops/:shopId/zones'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping zones for a shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping zones retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getShippingZones", null);
__decorate([
    (0, common_1.Post)('shops/:shopId/zones'),
    (0, swagger_1.ApiOperation)({ summary: 'Create shipping zone for a shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shipping zone created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_shipping_zone_dto_1.CreateShippingZoneDto]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "createShippingZone", null);
__decorate([
    (0, common_1.Put)('zones/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipping zone' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Shipping zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping zone updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping zone not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('zoneId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shipping_zone_dto_1.UpdateShippingZoneDto]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "updateShippingZone", null);
__decorate([
    (0, common_1.Delete)('zones/:zoneId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete shipping zone' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Shipping zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping zone deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping zone not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "deleteShippingZone", null);
__decorate([
    (0, common_1.Get)('zones/:zoneId/rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping rates for a zone' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Shipping zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rates retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping zone not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getShippingRates", null);
__decorate([
    (0, common_1.Post)('zones/:zoneId/rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create shipping rate for a zone' }),
    (0, swagger_1.ApiParam)({ name: 'zoneId', description: 'Shipping zone ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shipping rate created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping zone not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('zoneId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_shipping_rate_dto_1.CreateShippingRateDto]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "createShippingRate", null);
__decorate([
    (0, common_1.Put)('rates/:rateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipping rate' }),
    (0, swagger_1.ApiParam)({ name: 'rateId', description: 'Shipping rate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rate updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping rate not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shipping_rate_dto_1.UpdateShippingRateDto]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "updateShippingRate", null);
__decorate([
    (0, common_1.Delete)('rates/:rateId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete shipping rate' }),
    (0, swagger_1.ApiParam)({ name: 'rateId', description: 'Shipping rate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rate deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipping rate not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "deleteShippingRate", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate shipping rates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rates calculated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product or shop not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_shipping_dto_1.CalculateShippingDto]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "calculateShipping", null);
__decorate([
    (0, common_1.Get)('calculate/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate shipping for checkout session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Checkout session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rates calculated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Checkout session not found' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "calculateShippingForSession", null);
__decorate([
    (0, common_1.Get)('shops/:shopId/settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping settings for a shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping settings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getShippingSettings", null);
__decorate([
    (0, common_1.Put)('shops/:shopId/settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipping settings for a shop' }),
    (0, swagger_1.ApiParam)({ name: 'shopId', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping settings updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner', 'platform_admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('shopId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "updateShippingSettings", null);
__decorate([
    (0, common_1.Get)('admin/all-zones'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shipping zones (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All shipping zones retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getAllShippingZones", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping statistics (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShippingController.prototype, "getShippingStats", null);
exports.ShippingController = ShippingController = __decorate([
    (0, swagger_1.ApiTags)('shipping'),
    (0, common_1.Controller)('shipping'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [shipping_service_1.ShippingService])
], ShippingController);
//# sourceMappingURL=shipping.controller.js.map