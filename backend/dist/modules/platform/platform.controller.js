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
exports.PlatformController = void 0;
const common_1 = require("@nestjs/common");
const platform_service_1 = require("./platform.service");
const create_platform_setting_dto_1 = require("./dto/create-platform-setting.dto");
const update_platform_setting_dto_1 = require("./dto/update-platform-setting.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let PlatformController = class PlatformController {
    constructor(platformService) {
        this.platformService = platformService;
    }
    async getSettings() {
        const settings = await this.platformService.getAllSettings();
        return {
            success: true,
            data: settings,
        };
    }
    async getSetting(key) {
        const setting = await this.platformService.getSetting(key);
        if (!setting) {
            throw new common_1.NotFoundException('Setting not found');
        }
        return {
            success: true,
            data: setting,
        };
    }
    async createSetting(createPlatformSettingDto) {
        const setting = await this.platformService.createSetting(createPlatformSettingDto);
        return {
            success: true,
            data: setting,
        };
    }
    async updateSetting(key, updatePlatformSettingDto) {
        const setting = await this.platformService.updateSetting(key, updatePlatformSettingDto);
        return {
            success: true,
            data: setting,
        };
    }
    async deleteSetting(key) {
        await this.platformService.deleteSetting(key);
        return {
            success: true,
            message: 'Setting deleted successfully',
        };
    }
    async getDashboard(period = 'month') {
        const dashboard = await this.platformService.getDashboard(period);
        return {
            success: true,
            data: dashboard,
        };
    }
    async getAnalytics(period = 'month') {
        const analytics = await this.platformService.getAnalytics(period);
        return {
            success: true,
            data: analytics,
        };
    }
    async getRevenueAnalytics(period = '30d') {
        const analytics = await this.platformService.getRevenueAnalytics(period);
        return {
            success: true,
            data: analytics,
        };
    }
    async getUserAnalytics(period = '30d') {
        const analytics = await this.platformService.getUserAnalytics(period);
        return {
            success: true,
            data: analytics,
        };
    }
    async getShopAnalytics(period = '30d') {
        const analytics = await this.platformService.getShopAnalytics(period);
        return {
            success: true,
            data: analytics,
        };
    }
    async getSubscriptionAnalytics(period = '30d') {
        const analytics = await this.platformService.getSubscriptionAnalytics(period);
        return {
            success: true,
            data: analytics,
        };
    }
    async getShops(page = 1, limit = 20, status = 'all', search) {
        const result = await this.platformService.getShops(page, limit, status, search);
        return {
            success: true,
            data: result,
        };
    }
    async getShop(id) {
        const shop = await this.platformService.getShop(id);
        return {
            success: true,
            data: shop,
        };
    }
    async approveShop(id) {
        const shop = await this.platformService.approveShop(id);
        return {
            success: true,
            data: shop,
        };
    }
    async suspendShop(id, body) {
        const shop = await this.platformService.suspendShop(id, body.reason, body.duration);
        return {
            success: true,
            data: shop,
        };
    }
    async unsuspendShop(id) {
        const shop = await this.platformService.unsuspendShop(id);
        return {
            success: true,
            data: shop,
        };
    }
    async updateShopFee(id, body) {
        const shop = await this.platformService.updateShopFee(id, body.platformFeePercent);
        return {
            success: true,
            data: shop,
        };
    }
    async getUsers(page = 1, limit = 20, role = 'all', status = 'all', search) {
        const result = await this.platformService.getUsers(page, limit, role, status, search);
        return {
            success: true,
            data: result,
        };
    }
    async getUser(id) {
        const user = await this.platformService.getUser(id);
        return {
            success: true,
            data: user,
        };
    }
    async getOrders(page = 1, limit = 20, status = 'all', shopId, customerId, dateFrom, dateTo) {
        const result = await this.platformService.getOrders(page, limit, status, shopId, customerId, dateFrom, dateTo);
        return {
            success: true,
            data: result,
        };
    }
    async getOrder(id) {
        const order = await this.platformService.getOrder(id);
        return {
            success: true,
            data: order,
        };
    }
    async getTransactions(page = 1, limit = 20, type = 'all', status = 'all', shopId) {
        const result = await this.platformService.getTransactions(page, limit, type, status, shopId);
        return {
            success: true,
            data: result,
        };
    }
    async getTransaction(id) {
        const transaction = await this.platformService.getTransaction(id);
        return {
            success: true,
            data: transaction,
        };
    }
    async getDisputes(page = 1, limit = 20, status = 'all', type = 'all') {
        const result = await this.platformService.getDisputes(page, limit, status, type);
        return {
            success: true,
            data: result,
        };
    }
    async getDispute(id) {
        const dispute = await this.platformService.getDispute(id);
        return {
            success: true,
            data: dispute,
        };
    }
    async resolveDispute(id, body) {
        const dispute = await this.platformService.resolveDispute(id, body);
        return {
            success: true,
            data: dispute,
        };
    }
    async getSalesReport(period = 'monthly', dateFrom, dateTo) {
        const report = await this.platformService.getSalesReport(period, dateFrom, dateTo);
        return {
            success: true,
            data: report,
        };
    }
    async getFeesReport(period = 'monthly', dateFrom, dateTo) {
        const report = await this.platformService.getFeesReport(period, dateFrom, dateTo);
        return {
            success: true,
            data: report,
        };
    }
    async getShopPerformanceReport(period = '30d', shopId) {
        const report = await this.platformService.getShopPerformanceReport(period, shopId);
        return {
            success: true,
            data: report,
        };
    }
    async getHealthStatus() {
        const health = await this.platformService.getHealthStatus();
        return {
            success: true,
            data: health,
        };
    }
    async getMetrics(period = '24h') {
        const metrics = await this.platformService.getMetrics(period);
        return {
            success: true,
            data: metrics,
        };
    }
    async triggerBackup() {
        const result = await this.platformService.triggerBackup();
        return {
            success: true,
            data: result,
        };
    }
    async triggerCleanup() {
        const result = await this.platformService.triggerCleanup();
        return {
            success: true,
            data: result,
        };
    }
    async getNotifications(page = 1, limit = 20, type = 'all') {
        const result = await this.platformService.getNotifications(page, limit, type);
        return {
            success: true,
            data: result,
        };
    }
    async sendNotification(body) {
        const result = await this.platformService.sendNotification(body);
        return {
            success: true,
            data: result,
        };
    }
    async getAuditLogs(page = 1, limit = 50, action, userId, dateFrom, dateTo) {
        const result = await this.platformService.getAuditLogs(page, limit, action, userId, dateFrom, dateTo);
        return {
            success: true,
            data: result,
        };
    }
};
exports.PlatformController = PlatformController;
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all platform settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Platform settings retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)('settings/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform setting by key' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'Setting key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Setting retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Setting not found' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getSetting", null);
__decorate([
    (0, common_1.Post)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create platform setting' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Setting created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Setting already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_platform_setting_dto_1.CreatePlatformSettingDto]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "createSetting", null);
__decorate([
    (0, common_1.Put)('settings/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Update platform setting' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'Setting key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Setting updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Setting not found' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_platform_setting_dto_1.UpdatePlatformSettingDto]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateSetting", null);
__decorate([
    (0, common_1.Delete)('settings/:key'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete platform setting' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'Setting key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Setting deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Setting not found' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "deleteSetting", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform overview analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/revenue'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/shops'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getShopAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/subscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getSubscriptionAnalytics", null);
__decorate([
    (0, common_1.Get)('shops'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all shops with details' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'pending', 'suspended'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shops retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getShops", null);
__decorate([
    (0, common_1.Get)('shops/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getShop", null);
__decorate([
    (0, common_1.Put)('shops/:id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "approveShop", null);
__decorate([
    (0, common_1.Put)('shops/:id/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop suspended successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "suspendShop", null);
__decorate([
    (0, common_1.Put)('shops/:id/unsuspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unsuspend shop' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop unsuspended successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "unsuspendShop", null);
__decorate([
    (0, common_1.Put)('shops/:id/fee'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update shop fee percentage' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Shop ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop fee updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "updateShopFee", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with details' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: ['all', 'customer', 'shop_owner', 'platform_admin'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'suspended'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('shopId')),
    __param(4, (0, common_1.Query)('customerId')),
    __param(5, (0, common_1.Query)('dateFrom')),
    __param(6, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['all', 'payment', 'refund', 'platform_fee'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'completed', 'failed'] }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all disputes' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'open', 'investigating', 'resolved', 'closed'] }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['all', 'payment', 'fraud', 'quality', 'shipping'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disputes retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getDisputes", null);
__decorate([
    (0, common_1.Get)('disputes/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dispute details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getDispute", null);
__decorate([
    (0, common_1.Put)('disputes/:id/resolve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve dispute' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute resolved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "resolveDispute", null);
__decorate([
    (0, common_1.Get)('reports/sales'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate sales report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales report generated successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('reports/fees'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate platform fees report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fees report generated successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getFeesReport", null);
__decorate([
    (0, common_1.Get)('reports/shop-performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate shop performance report' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['30d', '90d', '1y'] }),
    (0, swagger_1.ApiQuery)({ name: 'shopId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop performance report generated successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getShopPerformanceReport", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['1h', '24h', '7d', '30d'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Post)('maintenance/backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger system backup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Backup triggered successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "triggerBackup", null);
__decorate([
    (0, common_1.Post)('maintenance/cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger system cleanup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup triggered successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "triggerCleanup", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['all', 'system', 'security', 'performance'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('notifications/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send platform notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit logs retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('dateFrom')),
    __param(5, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PlatformController.prototype, "getAuditLogs", null);
exports.PlatformController = PlatformController = __decorate([
    (0, swagger_1.ApiTags)('platform'),
    (0, common_1.Controller)('platform'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [platform_service_1.PlatformService])
], PlatformController);
//# sourceMappingURL=platform.controller.js.map