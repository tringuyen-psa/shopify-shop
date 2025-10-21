import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    const user = req.user;
    const profile = await this.usersService.getProfile(user.id);
    return {
      success: true,
      data: profile,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = req.user;
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);
    return {
      success: true,
      data: updatedUser,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user;
    await this.usersService.changePassword(user.id, changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user;

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const avatarUrl = await this.usersService.uploadAvatar(user.id, file);
    return {
      success: true,
      data: { avatarUrl },
    };
  }

  @Delete('delete-avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted successfully' })
  async deleteAvatar(@Request() req: any) {
    const user = req.user;
    await this.usersService.deleteAvatar(user.id);
    return {
      success: true,
      message: 'Avatar deleted successfully',
    };
  }

  // Customer specific endpoints
  @Get('customer/orders')
  @ApiOperation({ summary: 'Get customer orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getCustomerOrders(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: string = 'all',
  ) {
    const user = req.user;
    const orders = await this.usersService.getCustomerOrders(user.id, page, limit, status);
    return {
      success: true,
      data: orders,
    };
  }

  @Get('customer/subscriptions')
  @ApiOperation({ summary: 'Get customer subscriptions' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getCustomerSubscriptions(
    @Request() req: any,
    @Query('status') status: string = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const user = req.user;
    const subscriptions = await this.usersService.getCustomerSubscriptions(user.id, status, page, limit);
    return {
      success: true,
      data: subscriptions,
    };
  }

  @Get('customer/stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics retrieved successfully' })
  async getCustomerStats(@Request() req: any) {
    const user = req.user;
    const stats = await this.usersService.getCustomerStats(user.id);
    return {
      success: true,
      data: stats,
    };
  }

  // Shop owner specific endpoints
  @Get('shop')
  @ApiOperation({ summary: 'Get shop owner shop' })
  @ApiResponse({ status: 200, description: 'Shop information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner')
  async getShop(@Request() req: any) {
    const user = req.user;
    const shop = await this.usersService.getShopByOwner(user.id);
    return {
      success: true,
      data: shop,
    };
  }

  @Get('shop/stats')
  @ApiOperation({ summary: 'Get shop owner statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Shop statistics retrieved successfully' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner')
  async getShopStats(
    @Request() req: any,
    @Query('period') period: string = 'month',
  ) {
    const user = req.user;
    const stats = await this.usersService.getShopStats(user.id, period);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('shop/dashboard')
  @ApiOperation({ summary: 'Get shop owner dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner')
  async getShopDashboard(@Request() req: any) {
    const user = req.user;
    const dashboard = await this.usersService.getShopDashboard(user.id);
    return {
      success: true,
      data: dashboard,
    };
  }

  // Admin specific endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['all', 'customer', 'shop_owner', 'platform_admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'suspended'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role: string = 'all',
    @Query('status') status: string = 'all',
    @Query('search') search?: string,
  ) {
    const result = await this.usersService.getAllUsers(page, limit, role, status, search);
    return {
      success: true,
      data: result,
    };
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get user details (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return {
      success: true,
      data: user,
    };
  }

  @Put('admin/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend user (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async suspendUser(
    @Param('id') id: string,
    @Body() body: { reason: string; duration?: number },
  ) {
    await this.usersService.suspendUser(id, body.reason, body.duration);
    return {
      success: true,
      message: 'User suspended successfully',
    };
  }

  @Put('admin/:id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsuspend user (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User unsuspended successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async unsuspendUser(@Param('id') id: string) {
    await this.usersService.unsuspendUser(id);
    return {
      success: true,
      message: 'User unsuspended successfully',
    };
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getUserStats(@Query('period') period: string = 'month') {
    const stats = await this.usersService.getUserStats(period);
    return {
      success: true,
      data: stats,
    };
  }

  // Notification preferences
  @Get('notifications/preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  async getNotificationPreferences(@Request() req: any) {
    const user = req.user;
    const preferences = await this.usersService.getNotificationPreferences(user.id);
    return {
      success: true,
      data: preferences,
    };
  }

  @Put('notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() preferences: {
      emailNotifications?: boolean;
      orderUpdates?: boolean;
      subscriptionRenewals?: boolean;
      promotions?: boolean;
      newsletter?: boolean;
    },
  ) {
    const user = req.user;
    const updatedPreferences = await this.usersService.updateNotificationPreferences(
      user.id,
      preferences,
    );
    return {
      success: true,
      data: updatedPreferences,
    };
  }

  // Address management
  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  async getAddresses(@Request() req: any) {
    const user = req.user;
    const addresses = await this.usersService.getAddresses(user.id);
    return {
      success: true,
      data: addresses,
    };
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  async addAddress(
    @Request() req: any,
    @Body() addressData: {
      type: 'shipping' | 'billing';
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    const user = req.user;
    const address = await this.usersService.addAddress(user.id, addressData);
    return {
      success: true,
      data: address,
    };
  }

  @Put('addresses/:addressId')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddress(
    @Request() req: any,
    @Param('addressId') addressId: string,
    @Body() addressData: {
      type?: 'shipping' | 'billing';
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ) {
    const user = req.user;
    const address = await this.usersService.updateAddress(user.id, addressId, addressData);
    return {
      success: true,
      data: address,
    };
  }

  @Delete('addresses/:addressId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(@Request() req: any, @Param('addressId') addressId: string) {
    const user = req.user;
    await this.usersService.deleteAddress(user.id, addressId);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }

  // Security settings
  @Get('security')
  @ApiOperation({ summary: 'Get user security settings' })
  @ApiResponse({ status: 200, description: 'Security settings retrieved successfully' })
  async getSecuritySettings(@Request() req: any) {
    const user = req.user;
    const security = await this.usersService.getSecuritySettings(user.id);
    return {
      success: true,
      data: security,
    };
  }

  @Post('security/enable-2fa')
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable2FA(@Request() req: any) {
    const user = req.user;
    const result = await this.usersService.enable2FA(user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Post('security/disable-2fa')
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(
    @Request() req: any,
    @Body() body: { code: string },
  ) {
    const user = req.user;
    await this.usersService.disable2FA(user.id, body.code);
    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getActiveSessions(@Request() req: any) {
    const user = req.user;
    const sessions = await this.usersService.getActiveSessions(user.id);
    return {
      success: true,
      data: sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async revokeSession(@Request() req: any, @Param('sessionId') sessionId: string) {
    const user = req.user;
    await this.usersService.revokeSession(user.id, sessionId);
    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }

  @Delete('sessions/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  async revokeAllSessions(@Request() req: any) {
    const user = req.user;
    await this.usersService.revokeAllSessions(user.id);
    return {
      success: true,
      message: 'All sessions revoked successfully',
    };
  }
}