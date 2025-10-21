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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { UpdateSubscriptionAddressDto } from './dto/update-subscription-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // Customer endpoints
  @Get()
  @ApiOperation({ summary: 'Get user subscriptions' })
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
    const customer = req.user;
    const result = await this.subscriptionsService.getCustomerSubscriptions(
      customer.id,
      status,
      page,
      limit,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getSubscription(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const subscription = await this.subscriptionsService.getSubscription(id, user);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      success: true,
      data: subscription,
    };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this subscription' })
  async cancelSubscription(
    @Request() req: any,
    @Param('id') id: string,
    @Body() cancelSubscriptionDto: CancelSubscriptionDto,
  ) {
    const user = req.user;
    const subscription = await this.subscriptionsService.cancelSubscription(
      id,
      user,
      cancelSubscriptionDto,
    );
    return {
      success: true,
      data: subscription,
    };
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume cancelled subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription resumed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Cannot resume this subscription' })
  async resumeSubscription(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const subscription = await this.subscriptionsService.resumeSubscription(id, user);
    return {
      success: true,
      data: subscription,
    };
  }

  @Put(':id/change-plan')
  @ApiOperation({ summary: 'Change subscription billing cycle' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription plan changed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Cannot change plan for this subscription' })
  async changePlan(
    @Request() req: any,
    @Param('id') id: string,
    @Body() changePlanDto: ChangePlanDto,
  ) {
    const user = req.user;
    const subscription = await this.subscriptionsService.changePlan(id, user, changePlanDto);
    return {
      success: true,
      data: subscription,
    };
  }

  @Put(':id/update-address')
  @ApiOperation({ summary: 'Update shipping address for subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Cannot update address for digital subscription' })
  async updateShippingAddress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateSubscriptionAddressDto,
  ) {
    const user = req.user;
    const subscription = await this.subscriptionsService.updateShippingAddress(
      id,
      user,
      updateAddressDto,
    );
    return {
      success: true,
      data: subscription,
    };
  }

  // Shop owner endpoints
  @Get('shops/:shopId')
  @ApiOperation({ summary: 'Get shop subscriptions (shop owner)' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Shop subscriptions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShopSubscriptions(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Query('status') status: string = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const result = await this.subscriptionsService.getShopSubscriptions(
      shopId,
      status,
      page,
      limit,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('shops/:shopId/stats')
  @ApiOperation({ summary: 'Get subscription statistics for shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Subscription statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShopSubscriptionStats(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Query('period') period: string = 'month',
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const stats = await this.subscriptionsService.getShopSubscriptionStats(shopId, period);
    return {
      success: true,
      data: stats,
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all subscriptions (admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'cancelled', 'past_due', 'unpaid', 'trialing'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'shopId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'All subscriptions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getAllSubscriptions(
    @Query('status') status: string = 'all',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('shopId') shopId?: string,
    @Query('customerId') customerId?: string,
  ) {
    const result = await this.subscriptionsService.getAllSubscriptions(
      status,
      page,
      limit,
      shopId,
      customerId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get subscription statistics (admin only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Subscription statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getSubscriptionStats(@Query('period') period: string = 'month') {
    const stats = await this.subscriptionsService.getSubscriptionStats(period);
    return {
      success: true,
      data: stats,
    };
  }

  // Internal endpoint for creating subscriptions (usually called from order service)
  @Post()
  @ApiOperation({ summary: 'Create subscription (internal use)' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsService.create(createSubscriptionDto);
    return {
      success: true,
      data: subscription,
    };
  }

  // Webhook endpoint for Stripe subscription events
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe subscription webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(@Body() webhookData: any) {
    const result = await this.subscriptionsService.handleStripeWebhook(webhookData);
    return {
      success: true,
      data: result,
    };
  }

  // Get subscription renewal history
  @Get(':id/renewals')
  @ApiOperation({ summary: 'Get subscription renewal history' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Renewal history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscriptionRenewals(
    @Request() req: any,
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const user = req.user;
    const result = await this.subscriptionsService.getSubscriptionRenewals(id, user, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  // Pause subscription (shop owner or admin)
  @Put(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause subscription (shop owner or admin)' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription paused successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async pauseSubscription(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string; resumeAt?: string },
  ) {
    const user = req.user;
    const subscription = await this.subscriptionsService.pauseSubscription(
      id,
      user,
      body.reason,
      body.resumeAt,
    );
    return {
      success: true,
      data: subscription,
    };
  }

  // Unpause subscription (shop owner or admin)
  @Put(':id/unpause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpause subscription (shop owner or admin)' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription unpaused successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async unpauseSubscription(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const subscription = await this.subscriptionsService.unpauseSubscription(id, user);
    return {
      success: true,
      data: subscription,
    };
  }

  // Get subscription analytics (shop owner)
  @Get('shops/:shopId/analytics')
  @ApiOperation({ summary: 'Get subscription analytics for shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y'] })
  @ApiResponse({ status: 200, description: 'Subscription analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShopSubscriptionAnalytics(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Query('period') period: string = '30d',
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.subscriptionsService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const analytics = await this.subscriptionsService.getShopSubscriptionAnalytics(shopId, period);
    return {
      success: true,
      data: analytics,
    };
  }
}