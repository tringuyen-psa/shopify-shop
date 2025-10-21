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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
require("express-serve-static-core");
const users_service_1 = require("./users.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        const user = req.user;
        const profile = await this.usersService.getProfile(user.id);
        return {
            success: true,
            data: profile,
        };
    }
    async updateProfile(req, updateProfileDto) {
        const user = req.user;
        const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);
        return {
            success: true,
            data: updatedUser,
        };
    }
    async changePassword(req, changePasswordDto) {
        const user = req.user;
        await this.usersService.changePassword(user.id, changePasswordDto);
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
    async uploadAvatar(req, file) {
        const user = req.user;
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Only image files are allowed');
        }
        const avatarUrl = await this.usersService.uploadAvatar(user.id, file);
        return {
            success: true,
            data: { avatarUrl },
        };
    }
    async deleteAvatar(req) {
        const user = req.user;
        await this.usersService.deleteAvatar(user.id);
        return {
            success: true,
            message: 'Avatar deleted successfully',
        };
    }
    async getCustomerOrders(req, page = 1, limit = 10, status = 'all') {
        const user = req.user;
        const orders = await this.usersService.getCustomerOrders(user.id, page, limit, status);
        return {
            success: true,
            data: orders,
        };
    }
    async getCustomerSubscriptions(req, status = 'all', page = 1, limit = 10) {
        const user = req.user;
        const subscriptions = await this.usersService.getCustomerSubscriptions(user.id, status, page, limit);
        return {
            success: true,
            data: subscriptions,
        };
    }
    async getCustomerStats(req) {
        const user = req.user;
        const stats = await this.usersService.getCustomerStats(user.id);
        return {
            success: true,
            data: stats,
        };
    }
    async getShop(req) {
        const user = req.user;
        const shop = await this.usersService.getShopByOwner(user.id);
        return {
            success: true,
            data: shop,
        };
    }
    async getShopStats(req, period = 'month') {
        const user = req.user;
        const stats = await this.usersService.getShopStats(user.id, period);
        return {
            success: true,
            data: stats,
        };
    }
    async getShopDashboard(req) {
        const user = req.user;
        const dashboard = await this.usersService.getShopDashboard(user.id);
        return {
            success: true,
            data: dashboard,
        };
    }
    async getAllUsers(page = 1, limit = 20, role = 'all', status = 'all', search) {
        const result = await this.usersService.getAllUsers(page, limit, role, status, search);
        return {
            success: true,
            data: result,
        };
    }
    async getUserById(id) {
        const user = await this.usersService.getUserById(id);
        return {
            success: true,
            data: user,
        };
    }
    async suspendUser(id, body) {
        await this.usersService.suspendUser(id, body.reason, body.duration);
        return {
            success: true,
            message: 'User suspended successfully',
        };
    }
    async unsuspendUser(id) {
        await this.usersService.unsuspendUser(id);
        return {
            success: true,
            message: 'User unsuspended successfully',
        };
    }
    async deleteUser(id) {
        await this.usersService.deleteUser(id);
        return {
            success: true,
            message: 'User deleted successfully',
        };
    }
    async getUserStats(period = 'month') {
        const stats = await this.usersService.getUserStats(period);
        return {
            success: true,
            data: stats,
        };
    }
    async getNotificationPreferences(req) {
        const user = req.user;
        const preferences = await this.usersService.getNotificationPreferences(user.id);
        return {
            success: true,
            data: preferences,
        };
    }
    async updateNotificationPreferences(req, preferences) {
        const user = req.user;
        const updatedPreferences = await this.usersService.updateNotificationPreferences(user.id, preferences);
        return {
            success: true,
            data: updatedPreferences,
        };
    }
    async getAddresses(req) {
        const user = req.user;
        const addresses = await this.usersService.getAddresses(user.id);
        return {
            success: true,
            data: addresses,
        };
    }
    async addAddress(req, addressData) {
        const user = req.user;
        const address = await this.usersService.addAddress(user.id, addressData);
        return {
            success: true,
            data: address,
        };
    }
    async updateAddress(req, addressId, addressData) {
        const user = req.user;
        const address = await this.usersService.updateAddress(user.id, addressId, addressData);
        return {
            success: true,
            data: address,
        };
    }
    async deleteAddress(req, addressId) {
        const user = req.user;
        await this.usersService.deleteAddress(user.id, addressId);
        return {
            success: true,
            message: 'Address deleted successfully',
        };
    }
    async getSecuritySettings(req) {
        const user = req.user;
        const security = await this.usersService.getSecuritySettings(user.id);
        return {
            success: true,
            data: security,
        };
    }
    async enable2FA(req) {
        const user = req.user;
        const result = await this.usersService.enable2FA(user.id);
        return {
            success: true,
            data: result,
        };
    }
    async disable2FA(req, body) {
        const user = req.user;
        await this.usersService.disable2FA(user.id, body.code);
        return {
            success: true,
            message: '2FA disabled successfully',
        };
    }
    async getActiveSessions(req) {
        const user = req.user;
        const sessions = await this.usersService.getActiveSessions(user.id);
        return {
            success: true,
            data: sessions,
        };
    }
    async revokeSession(req, sessionId) {
        const user = req.user;
        await this.usersService.revokeSession(user.id, sessionId);
        return {
            success: true,
            message: 'Session revoked successfully',
        };
    }
    async revokeAllSessions(req) {
        const user = req.user;
        await this.usersService.revokeAllSessions(user.id);
        return {
            success: true,
            message: 'All sessions revoked successfully',
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload user avatar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar uploaded successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Delete)('delete-avatar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user avatar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAvatar", null);
__decorate([
    (0, common_1.Get)('customer/orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer orders' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orders retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Get)('customer/subscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer subscriptions' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscriptions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCustomerSubscriptions", null);
__decorate([
    (0, common_1.Get)('customer/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer statistics retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCustomerStats", null);
__decorate([
    (0, common_1.Get)('shop'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop owner shop' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getShop", null);
__decorate([
    (0, common_1.Get)('shop/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop owner statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shop statistics retrieved successfully' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getShopStats", null);
__decorate([
    (0, common_1.Get)('shop/dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shop owner dashboard data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('shop_owner'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getShopDashboard", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: ['all', 'customer', 'shop_owner', 'platform_admin'] }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'suspended'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user details (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('admin/:id/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User suspended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Put)('admin/:id/unsuspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unsuspend user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User unsuspended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unsuspendUser", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('notifications/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, common_1.Put)('notifications/preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences updated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Get)('addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user addresses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Addresses retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAddresses", null);
__decorate([
    (0, common_1.Post)('addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Add new address' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Address added successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Put)('addresses/:addressId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update address' }),
    (0, swagger_1.ApiParam)({ name: 'addressId', description: 'Address ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('addresses/:addressId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete address' }),
    (0, swagger_1.ApiParam)({ name: 'addressId', description: 'Address ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('security'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user security settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security settings retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSecuritySettings", null);
__decorate([
    (0, common_1.Post)('security/enable-2fa'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable two-factor authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '2FA enabled successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('security/disable-2fa'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable two-factor authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '2FA disabled successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "disable2FA", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active sessions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sessions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Delete)('sessions/:sessionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke session' }),
    (0, swagger_1.ApiParam)({ name: 'sessionId', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session revoked successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Delete)('sessions/all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all sessions except current' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All sessions revoked successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "revokeAllSessions", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map