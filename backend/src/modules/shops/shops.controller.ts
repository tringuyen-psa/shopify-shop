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
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { StripeConnectService } from '../stripe-connect/stripe-connect.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Roles } from '../auth/decorators/roles.decorator'; // Commented out to remove unused warning
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => StripeConnectService))
    private readonly stripeConnectService: StripeConnectService,
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
  @ApiOperation({ summary: 'Get current user\'s shops' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyShops(@Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.shopsService.findByOwner(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  findAll(@Query() query: any) {
    return this.shopsService.findAll(query);
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

  @Get(':id/products')
  @ApiOperation({ summary: 'Get all products for a shop by ID or slug' })
  @ApiParam({ name: 'id', description: 'Shop ID or slug' })
  @ApiResponse({ status: 200, description: 'Shop products retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async findProductsById(@Param('id') id: string) {
    try {
      console.log(`Finding shop with identifier: ${id}`);

      // First try to find by UUID
      const shopById = await this.shopsService.findById(id);
      console.log('Shop found by ID:', shopById?.id || 'not found');

      if (shopById) {
        return this.productsService.findByShopId(id);
      }

      // If not found, try to find by slug
      console.log('Trying to find by slug...');
      const shopBySlug = await this.shopsService.findBySlug(id);
      console.log('Shop found by slug:', shopBySlug?.id || 'not found');

      if (shopBySlug) {
        return this.productsService.findByShopId(shopBySlug.id);
      }

      throw new NotFoundException('Shop not found');
    } catch (error) {
      console.error('Error finding shop by ID/slug:', error);
      // Re-throw the original error instead of masking it
      throw error;
    }
  }

  @Post(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product for a shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  async createProduct(
    @Param('id', ParseUUIDPipe) shopId: string,
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ) {
    return this.productsService.create(createProductDto, shopId);
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
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can update shop' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
    @Request() req,
  ) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can delete shop' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.shopsService.remove(id);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe shop to platform plan' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can subscribe' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  subscribe(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    return this.shopsService.updateSubscriptionPlan(id, updateSubscriptionDto);
  }

  // TODO: Implement analytics service method
  // @Get(':id/analytics')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get shop analytics' })
  // @ApiParam({ name: 'id', description: 'Shop ID' })
  // @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can view analytics' })
  // @ApiResponse({ status: 404, description: 'Shop not found' })
  // getAnalytics(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
  //   return this.shopsService.getAnalytics(id, req.user.id);
  // }

  // TODO: Implement ownership transfer service method
  // @Post(':id/transfer-ownership')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Transfer shop ownership' })
  // @ApiParam({ name: 'id', description: 'Shop ID' })
  // @ApiResponse({ status: 200, description: 'Ownership transferred successfully' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can transfer ownership' })
  // @ApiResponse({ status: 404, description: 'Shop not found' })
  // transferOwnership(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() body: { newOwnerId: string },
  //   @Request() req,
  // ) {
  //   return this.shopsService.transferOwnership(id, body.newOwnerId, req.user.id);
  // }

  @Post(':id/connect/onboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start Stripe Connect onboarding' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Onboarding started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner can access' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async startOnboarding(
    @Param('id', ParseUUIDPipe) shopId: string,
    @Request() req
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    // Verify shop ownership
    const shop = await this.shopsService.findById(shopId);
    if (shop.ownerId !== userId) {
      throw new BadRequestException('Access denied - Only shop owner can start onboarding');
    }

    try {
      // Create or get Stripe Express account and onboarding link
      const result = await this.stripeConnectService.createExpressAccount(shopId);

      return {
        message: 'Onboarding started successfully',
        onboardingUrl: result.onboardingUrl,
        accountId: result.accountId,
      };
    } catch (error) {
      // If account already exists, just create onboarding link
      if (error.message.includes('already has a Stripe account')) {
        const onboardingResult = await this.stripeConnectService.createOnboardingLink(shopId);
        return {
          message: 'Onboarding link created successfully',
          onboardingUrl: onboardingResult.onboardingUrl,
          accountId: shop.stripeAccountId,
        };
      }
      throw new BadRequestException(error.message);
    }
  }
}