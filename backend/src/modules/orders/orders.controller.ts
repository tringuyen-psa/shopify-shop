import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer endpoints
  @Get()
  @ApiOperation({ summary: 'Get user orders (customer)' })
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
    const customer = req.user;
    const result = await this.ordersService.getCustomerOrders(
      customer.id,
      page,
      limit,
      status,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order details by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number (e.g., #1001)' })
  @ApiResponse({ status: 200, description: 'Order details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderByNumber(
    @Request() req: any,
    @Param('orderNumber') orderNumber: string,
  ) {
    const user = req.user;
    const order = await this.ordersService.getOrderByNumber(orderNumber, user);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  // Shop owner endpoints
  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get shop orders (shop owner)' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  @ApiResponse({ status: 200, description: 'Shop orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShopOrders(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: string = 'all',
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.ordersService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const result = await this.ordersService.getShopOrders(
      shopId,
      page,
      limit,
      status,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('shop/:shopId/:orderNumber')
  @ApiOperation({ summary: 'Get shop order details (shop owner)' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({ status: 200, description: 'Order details retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShopOrderByNumber(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Param('orderNumber') orderNumber: string,
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.ordersService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const order = await this.ordersService.getShopOrderByNumber(shopId, orderNumber);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  // Order management endpoints (shop owner)
  @Put(':id/fulfill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as fulfilled' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order marked as fulfilled' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async fulfillOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() fulfillOrderDto: FulfillOrderDto,
  ) {
    const user = req.user;
    const order = await this.ordersService.fulfillOrder(id, user, fulfillOrderDto);
    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/ship')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add tracking information and mark as shipped' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order marked as shipped' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async shipOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() shipOrderDto: ShipOrderDto,
  ) {
    const user = req.user;
    const order = await this.ordersService.shipOrder(id, user, shipOrderDto);
    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/deliver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark order as delivered' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order marked as delivered' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async deliverOrder(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const order = await this.ordersService.deliverOrder(id, user);
    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  async cancelOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    const user = req.user;
    const order = await this.ordersService.cancelOrder(id, user, cancelOrderDto);
    return {
      success: true,
      data: order,
    };
  }

  @Put(':id/internal-note')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update internal note (shop owner only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Internal note updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async updateInternalNote(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { internalNote: string },
  ) {
    const user = req.user;
    const order = await this.ordersService.updateInternalNote(id, user, body.internalNote);
    return {
      success: true,
      data: order,
    };
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  @ApiQuery({ name: 'shopId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'All orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status: string = 'all',
    @Query('shopId') shopId?: string,
    @Query('customerId') customerId?: string,
  ) {
    const result = await this.ordersService.getAllOrders(
      page,
      limit,
      status,
      shopId,
      customerId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get order statistics (admin only)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getOrderStats(@Query('period') period: string = 'month') {
    const stats = await this.ordersService.getOrderStats(period);
    return {
      success: true,
      data: stats,
    };
  }

  // Internal endpoint for creating orders (usually called from checkout service)
  @Post()
  @ApiOperation({ summary: 'Create order (internal use)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    return {
      success: true,
      data: order,
    };
  }

  // Get order tracking information (public endpoint)
  @Get(':orderNumber/tracking')
  @ApiOperation({ summary: 'Get order tracking information (public)' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiQuery({ name: 'email', required: true, description: 'Customer email for verification' })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found or email mismatch' })
  async getOrderTracking(
    @Param('orderNumber') orderNumber: string,
    @Query('email') email: string,
  ) {
    const tracking = await this.ordersService.getOrderTracking(orderNumber, email);

    if (!tracking) {
      throw new NotFoundException('Order not found or email does not match');
    }

    return {
      success: true,
      data: tracking,
    };
  }

  // Customer can request refund
  @Post(':id/refund-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request refund (customer)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Refund request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Refund request not allowed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async requestRefund(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string; description?: string },
  ) {
    const user = req.user;
    const result = await this.ordersService.requestRefund(id, user, body.reason, body.description);
    return {
      success: true,
      data: result,
    };
  }

  // Shop owner can process refund
  @Put(':id/process-refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process refund (shop owner)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async processRefund(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { approve: boolean; reason?: string; refundAmount?: number },
  ) {
    const user = req.user;
    const result = await this.ordersService.processRefund(
      id,
      user,
      body.approve,
      body.reason,
      body.refundAmount,
    );
    return {
      success: true,
      data: result,
    };
  }
}