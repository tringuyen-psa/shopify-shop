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
} from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreatePlatformSettingDto } from './dto/create-platform-setting.dto';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('platform')
@Controller('platform')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_admin')
@ApiBearerAuth()
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  // Platform Settings
  @Get('settings')
  @ApiOperation({ summary: 'Get all platform settings' })
  @ApiResponse({ status: 200, description: 'Platform settings retrieved successfully' })
  async getSettings() {
    const settings = await this.platformService.getAllSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Get('settings/:key')
  @ApiOperation({ summary: 'Get platform setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async getSetting(@Param('key') key: string) {
    const setting = await this.platformService.getSetting(key);
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return {
      success: true,
      data: setting,
    };
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create platform setting' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  @ApiResponse({ status: 400, description: 'Setting already exists' })
  async createSetting(@Body() createPlatformSettingDto: CreatePlatformSettingDto) {
    const setting = await this.platformService.createSetting(createPlatformSettingDto);
    return {
      success: true,
      data: setting,
    };
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Update platform setting' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async updateSetting(
    @Param('key') key: string,
    @Body() updatePlatformSettingDto: UpdatePlatformSettingDto,
  ) {
    const setting = await this.platformService.updateSetting(key, updatePlatformSettingDto);
    return {
      success: true,
      data: setting,
    };
  }

  @Delete('settings/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete platform setting' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async deleteSetting(@Param('key') key: string) {
    await this.platformService.deleteSetting(key);
    return {
      success: true,
      message: 'Setting deleted successfully',
    };
  }

  // Dashboard & Analytics
  @Get('dashboard')
  @ApiOperation({ summary: 'Get platform dashboard data' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Query('period') period: string = 'month') {
    const dashboard = await this.platformService.getDashboard(period);
    return {
      success: true,
      data: dashboard,
    };
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get platform overview analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query('period') period: string = 'month') {
    const analytics = await this.platformService.getAnalytics(period);
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query('period') period: string = '30d') {
    const analytics = await this.platformService.getRevenueAnalytics(period);
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('analytics/users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  async getUserAnalytics(@Query('period') period: string = '30d') {
    const analytics = await this.platformService.getUserAnalytics(period);
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('analytics/shops')
  @ApiOperation({ summary: 'Get shop analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Shop analytics retrieved successfully' })
  async getShopAnalytics(@Query('period') period: string = '30d') {
    const analytics = await this.platformService.getShopAnalytics(period);
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('analytics/subscriptions')
  @ApiOperation({ summary: 'Get subscription analytics' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Subscription analytics retrieved successfully' })
  async getSubscriptionAnalytics(@Query('period') period: string = '30d') {
    const analytics = await this.platformService.getSubscriptionAnalytics(period);
    return {
      success: true,
      data: analytics,
    };
  }

  // Shop Management
  @Get('shops')
  @ApiOperation({ summary: 'Get all shops with details' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'pending', 'suspended'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  async getShops(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status: string = 'all',
    @Query('search') search?: string,
  ) {
    const result = await this.platformService.getShops(page, limit, status, search);
    return {
      success: true,
      data: result,
    };
  }

  @Get('shops/:id')
  @ApiOperation({ summary: 'Get shop details' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShop(@Param('id') id: string) {
    const shop = await this.platformService.getShop(id);
    return {
      success: true,
      data: shop,
    };
  }

  @Put('shops/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop approved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async approveShop(@Param('id') id: string) {
    const shop = await this.platformService.approveShop(id);
    return {
      success: true,
      data: shop,
    };
  }

  @Put('shops/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop suspended successfully' })
  async suspendShop(
    @Param('id') id: string,
    @Body() body: { reason: string; duration?: number },
  ) {
    const shop = await this.platformService.suspendShop(id, body.reason, body.duration);
    return {
      success: true,
      data: shop,
    };
  }

  @Put('shops/:id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsuspend shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop unsuspended successfully' })
  async unsuspendShop(@Param('id') id: string) {
    const shop = await this.platformService.unsuspendShop(id);
    return {
      success: true,
      data: shop,
    };
  }

  @Put('shops/:id/fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shop fee percentage' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop fee updated successfully' })
  async updateShopFee(
    @Param('id') id: string,
    @Body() body: { platformFeePercent: number },
  ) {
    const shop = await this.platformService.updateShopFee(id, body.platformFeePercent);
    return {
      success: true,
      data: shop,
    };
  }

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users with details' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['all', 'customer', 'shop_owner', 'platform_admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'suspended'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role: string = 'all',
    @Query('status') status: string = 'all',
    @Query('search') search?: string,
  ) {
    const result = await this.platformService.getUsers(page, limit, role, status, search);
    return {
      success: true,
      data: result,
    };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string) {
    const user = await this.platformService.getUser(id);
    return {
      success: true,
      data: user,
    };
  }

  // Order Management
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  @ApiQuery({ name: 'shopId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status: string = 'all',
    @Query('shopId') shopId?: string,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.platformService.getOrders(
      page,
      limit,
      status,
      shopId,
      customerId,
      dateFrom,
      dateTo,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id') id: string) {
    const order = await this.platformService.getOrder(id);
    return {
      success: true,
      data: order,
    };
  }

  // Payment & Transaction Management
  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'payment', 'refund', 'platform_fee'] })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'completed', 'failed'] })
  @ApiQuery({ name: 'shopId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type: string = 'all',
    @Query('status') status: string = 'all',
    @Query('shopId') shopId?: string,
  ) {
    const result = await this.platformService.getTransactions(page, limit, type, status, shopId);
    return {
      success: true,
      data: result,
    };
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string) {
    const transaction = await this.platformService.getTransaction(id);
    return {
      success: true,
      data: transaction,
    };
  }

  // Disputes & Issues
  @Get('disputes')
  @ApiOperation({ summary: 'Get all disputes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'open', 'investigating', 'resolved', 'closed'] })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'payment', 'fraud', 'quality', 'shipping'] })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getDisputes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status: string = 'all',
    @Query('type') type: string = 'all',
  ) {
    const result = await this.platformService.getDisputes(page, limit, status, type);
    return {
      success: true,
      data: result,
    };
  }

  @Get('disputes/:id')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Dispute details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDispute(@Param('id') id: string) {
    const dispute = await this.platformService.getDispute(id);
    return {
      success: true,
      data: dispute,
    };
  }

  @Put('disputes/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve dispute' })
  @ApiParam({ name: 'id', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(
    @Param('id') id: string,
    @Body() body: { resolution: string; action: 'refund' | 'warning' | 'suspend'; notes?: string },
  ) {
    const dispute = await this.platformService.resolveDispute(id, body);
    return {
      success: true,
      data: dispute,
    };
  }

  // Reports
  @Get('reports/sales')
  @ApiOperation({ summary: 'Generate sales report' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Sales report generated successfully' })
  async getSalesReport(
    @Query('period') period: string = 'monthly',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const report = await this.platformService.getSalesReport(period, dateFrom, dateTo);
    return {
      success: true,
      data: report,
    };
  }

  @Get('reports/fees')
  @ApiOperation({ summary: 'Generate platform fees report' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Fees report generated successfully' })
  async getFeesReport(
    @Query('period') period: string = 'monthly',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const report = await this.platformService.getFeesReport(period, dateFrom, dateTo);
    return {
      success: true,
      data: report,
    };
  }

  @Get('reports/shop-performance')
  @ApiOperation({ summary: 'Generate shop performance report' })
  @ApiQuery({ name: 'period', required: false, enum: ['30d', '90d', '1y'] })
  @ApiQuery({ name: 'shopId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Shop performance report generated successfully' })
  async getShopPerformanceReport(
    @Query('period') period: string = '30d',
    @Query('shopId') shopId?: string,
  ) {
    const report = await this.platformService.getShopPerformanceReport(period, shopId);
    return {
      success: true,
      data: report,
    };
  }

  // System Health & Monitoring
  @Get('health')
  @ApiOperation({ summary: 'Get platform health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getHealthStatus() {
    const health = await this.platformService.getHealthStatus();
    return {
      success: true,
      data: health,
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get platform metrics' })
  @ApiQuery({ name: 'period', required: false, enum: ['1h', '24h', '7d', '30d'] })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(@Query('period') period: string = '24h') {
    const metrics = await this.platformService.getMetrics(period);
    return {
      success: true,
      data: metrics,
    };
  }

  // System Maintenance
  @Post('maintenance/backup')
  @ApiOperation({ summary: 'Trigger system backup' })
  @ApiResponse({ status: 200, description: 'Backup triggered successfully' })
  async triggerBackup() {
    const result = await this.platformService.triggerBackup();
    return {
      success: true,
      data: result,
    };
  }

  @Post('maintenance/cleanup')
  @ApiOperation({ summary: 'Trigger system cleanup' })
  @ApiResponse({ status: 200, description: 'Cleanup triggered successfully' })
  async triggerCleanup() {
    const result = await this.platformService.triggerCleanup();
    return {
      success: true,
      data: result,
    };
  }

  // Notifications & Communications
  @Get('notifications')
  @ApiOperation({ summary: 'Get platform notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'system', 'security', 'performance'] })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type: string = 'all',
  ) {
    const result = await this.platformService.getNotifications(page, limit, type);
    return {
      success: true,
      data: result,
    };
  }

  @Post('notifications/send')
  @ApiOperation({ summary: 'Send platform notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() body: {
    title: string;
    message: string;
    type: 'system' | 'security' | 'performance';
    recipients?: 'all' | 'shop_owners' | 'customers';
    userIds?: string[];
  }) {
    const result = await this.platformService.sendNotification(body);
    return {
      success: true,
      data: result,
    };
  }

  // Audit Logs
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result = await this.platformService.getAuditLogs(
      page,
      limit,
      action,
      userId,
      dateFrom,
      dateTo,
    );
    return {
      success: true,
      data: result,
    };
  }
}