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
exports.ShopsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shops_service_1 = require("./shops.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ShopsController = class ShopsController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    create(createShopDto, req) {
        return this.shopsService.create(createShopDto);
    }
    findAll() {
        return this.shopsService.findAll();
    }
    findBySlug(slug) {
        return this.shopsService.findBySlug(slug);
    }
    findOne(id) {
        return this.shopsService.findById(id);
    }
    update(id, updateShopDto) {
        return this.shopsService.update(id, updateShopDto);
    }
    startOnboarding(_id) {
        return { message: 'Stripe onboarding endpoint - to be implemented' };
    }
    getConnectStatus(_id) {
        return { message: 'Stripe Connect status endpoint - to be implemented' };
    }
    refreshOnboardingLink(_id) {
        return { message: 'Stripe refresh onboarding endpoint - to be implemented' };
    }
    getStripeDashboard(_id) {
        return { message: 'Stripe dashboard endpoint - to be implemented' };
    }
};
exports.ShopsController = ShopsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new shop' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shop successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owners can create shops' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.CreateShopDto, Object]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shops' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shops retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop by slug' }),
    (0, swagger_1.ApiParam)({ name: 'slug', description: 'Shop slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin can update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_shop_dto_1.UpdateShopDto]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/connect/onboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start Stripe Connect onboarding' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 501, description: 'Not Implemented' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Get)(':id/connect/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Connect status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connect status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 501, description: 'Not Implemented' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "getConnectStatus", null);
__decorate([
    (0, common_1.Post)(':id/connect/refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh Stripe Connect onboarding link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding link refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 501, description: 'Not Implemented' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "refreshOnboardingLink", null);
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Express dashboard link' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard link retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only shop owner or platform admin' }),
    (0, swagger_1.ApiResponse)({ status: 501, description: 'Not Implemented' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShopsController.prototype, "getStripeDashboard", null);
exports.ShopsController = ShopsController = __decorate([
    (0, swagger_1.ApiTags)('shops'),
    (0, common_1.Controller)('shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], ShopsController);
//# sourceMappingURL=shops.controller.js.map