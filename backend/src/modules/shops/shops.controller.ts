import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Roles } from '../auth/decorators/roles.decorator'; // Commented out to remove unused warning
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop' })
  @ApiResponse({ status: 201, description: 'Shop successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owners can create shops' })
  create(@Body() createShopDto: CreateShopDto, @Request() req) {
    // Extract user ID from JWT token - JWT strategy returns user.id
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.shopsService.create(createShopDto, userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user shop' })
  @ApiResponse({ status: 200, description: 'Current user shop retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  findMyShop(@Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.shopsService.findByUserId(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid query parameters' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const params = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      search,
      sortBy,
      sortOrder,
    };
    return this.shopsService.findAll(params);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get shop by slug' })
  @ApiParam({ name: 'slug', description: 'Shop slug' })
  @ApiResponse({ status: 200, description: 'Shop retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.shopsService.findBySlug(slug);
  }

  @Get(':slug/products')
  @ApiOperation({ summary: 'Get all products for a shop by slug' })
  @ApiParam({ name: 'slug', description: 'Shop slug' })
  @ApiResponse({ status: 200, description: 'Shop products retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  findProductsBySlug(@Param('slug') slug: string) {
    return this.shopsService.findProductsBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin can update' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    return this.shopsService.update(id, updateShopDto);
  }

  // Stripe Connect endpoints
  @Post(':id/connect/create-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Connect account' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 201, description: 'Stripe Connect account created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async createConnectAccount(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    const account = await this.paymentsService.createConnectAccount(shopId, userId);
    return {
      message: 'Stripe Connect account created successfully',
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  }

  @Post(':id/connect/onboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start Stripe Connect onboarding' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Onboarding started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async startOnboarding(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Create Stripe account if it doesn't exist
    let accountId = shop.stripeAccountId;
    if (!accountId) {
      const account = await this.paymentsService.createConnectAccount(shopId, userId);
      accountId = account.id;
    }

    // Create onboarding link
    const onboardingLink = await this.paymentsService.createOnboardingLink(accountId);

    return {
      message: 'Onboarding started successfully',
      onboardingUrl: onboardingLink.url,
      accountId: accountId,
    };
  }

  @Post(':id/connect/kyc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create KYC verification link' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'KYC verification link created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async createKYCLink(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Create Stripe account if it doesn't exist
    let accountId = shop.stripeAccountId;
    if (!accountId) {
      const account = await this.paymentsService.createConnectAccount(shopId, userId);
      accountId = account.id;
    }

    // Create KYC verification link
    const kycLink = await this.paymentsService.createKYCLink(accountId);

    return {
      message: 'KYC verification link created successfully',
      kycUrl: kycLink.url,
      accountId: accountId,
    };
  }

  @Get(':id/connect/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Connect status' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Connect status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getConnectStatus(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Update account status if Stripe account exists
    if (shop.stripeAccountId) {
      await this.paymentsService.updateAccountStatus(shop.stripeAccountId);

      // Get updated shop data
      const updatedShop = await this.shopsService.findById(shopId);

      return {
        accountId: updatedShop.stripeAccountId,
        onboardingComplete: updatedShop.stripeOnboardingComplete,
        chargesEnabled: updatedShop.stripeChargesEnabled,
        payoutsEnabled: updatedShop.stripePayoutsEnabled,
      };
    }

    return {
      accountId: null,
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }

  @Post(':id/connect/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Stripe Connect onboarding link' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Onboarding link refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async refreshOnboardingLink(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId || !shop.stripeAccountId) {
      throw new BadRequestException('Access denied or no Stripe account found');
    }

    const onboardingLink = await this.paymentsService.createOnboardingLink(shop.stripeAccountId);

    return {
      message: 'Onboarding link refreshed successfully',
      onboardingUrl: onboardingLink.url,
    };
  }

  @Get(':id/connect/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Express dashboard link' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Dashboard link retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getStripeDashboard(@Param('id', ParseUUIDPipe) shopId: string, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId || !shop.stripeAccountId) {
      throw new BadRequestException('Access denied or no Stripe account found');
    }

    const dashboardLink = await this.paymentsService.createDashboardLink(shop.stripeAccountId);

    return {
      message: 'Dashboard link retrieved successfully',
      dashboardUrl: dashboardLink.url,
    };
  }

  // Subscription endpoints
  @Get('subscriptions/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'Subscription plans retrieved successfully' })
  async getSubscriptionPlans() {
    const plans = await this.shopsService.getSubscriptionPlans();
    return {
      message: 'Subscription plans retrieved successfully',
      plans,
    };
  }

  @Post(':id/subscription/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update shop subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  async updateSubscription(
    @Param('id', ParseUUIDPipe) shopId: string,
    @Request() req,
    @Body() updateData: UpdateSubscriptionDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied');
    }

    const updatedShop = await this.shopsService.updateSubscriptionPlan(shopId, updateData);

    return {
      message: 'Subscription updated successfully',
      shop: updatedShop,
    };
  }

  @Post(':id/subscription/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Cancel shop subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  async cancelSubscription(
    @Param('id', ParseUUIDPipe) shopId: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied');
    }

    const updatedShop = await this.shopsService.cancelSubscription(shopId);

    return {
      message: 'Subscription cancelled successfully',
      shop: updatedShop,
    };
  }
}