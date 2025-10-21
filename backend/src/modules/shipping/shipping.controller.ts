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
import { ShippingService } from './shipping.service';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { CreateShippingRateDto } from './dto/create-shipping-rate.dto';
import { UpdateShippingRateDto } from './dto/update-shipping-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('shipping')
@Controller('shipping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  // Shipping Zones endpoints (shop owner)
  @Get('shops/:shopId/zones')
  @ApiOperation({ summary: 'Get shipping zones for a shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shipping zones retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShippingZones(
    @Request() req: any,
    @Param('shopId') shopId: string,
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const zones = await this.shippingService.getShippingZones(shopId);
    return {
      success: true,
      data: zones,
    };
  }

  @Post('shops/:shopId/zones')
  @ApiOperation({ summary: 'Create shipping zone for a shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiResponse({ status: 201, description: 'Shipping zone created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async createShippingZone(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Body() createShippingZoneDto: CreateShippingZoneDto,
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const zone = await this.shippingService.createShippingZone(shopId, createShippingZoneDto);
    return {
      success: true,
      data: zone,
    };
  }

  @Put('zones/:zoneId')
  @ApiOperation({ summary: 'Update shipping zone' })
  @ApiParam({ name: 'zoneId', description: 'Shipping zone ID' })
  @ApiResponse({ status: 200, description: 'Shipping zone updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Shipping zone not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async updateShippingZone(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
    @Body() updateShippingZoneDto: UpdateShippingZoneDto,
  ) {
    const user = req.user;

    // Check permissions
    const zone = await this.shippingService.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shipping zone');
      }
    }

    const updatedZone = await this.shippingService.updateShippingZone(zoneId, updateShippingZoneDto);
    return {
      success: true,
      data: updatedZone,
    };
  }

  @Delete('zones/:zoneId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete shipping zone' })
  @ApiParam({ name: 'zoneId', description: 'Shipping zone ID' })
  @ApiResponse({ status: 200, description: 'Shipping zone deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Shipping zone not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async deleteShippingZone(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
  ) {
    const user = req.user;

    // Check permissions
    const zone = await this.shippingService.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shipping zone');
      }
    }

    await this.shippingService.deleteShippingZone(zoneId);
    return {
      success: true,
      message: 'Shipping zone deleted successfully',
    };
  }

  // Shipping Rates endpoints (shop owner)
  @Get('zones/:zoneId/rates')
  @ApiOperation({ summary: 'Get shipping rates for a zone' })
  @ApiParam({ name: 'zoneId', description: 'Shipping zone ID' })
  @ApiResponse({ status: 200, description: 'Shipping rates retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipping zone not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShippingRates(@Param('zoneId') zoneId: string) {
    const zone = await this.shippingService.findZoneById(zoneId);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    const rates = await this.shippingService.getShippingRates(zoneId);
    return {
      success: true,
      data: rates,
    };
  }

  @Post('zones/:zoneId/rates')
  @ApiOperation({ summary: 'Create shipping rate for a zone' })
  @ApiParam({ name: 'zoneId', description: 'Shipping zone ID' })
  @ApiResponse({ status: 201, description: 'Shipping rate created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Shipping zone not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async createShippingRate(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
    @Body() createShippingRateDto: CreateShippingRateDto,
  ) {
    const user = req.user;

    // Check permissions
    const zone = await this.shippingService.findZoneById(zoneId, ['shop']);
    if (!zone) {
      throw new NotFoundException('Shipping zone not found');
    }

    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shipping zone');
      }
    }

    const rate = await this.shippingService.createShippingRate(zoneId, createShippingRateDto);
    return {
      success: true,
      data: rate,
    };
  }

  @Put('rates/:rateId')
  @ApiOperation({ summary: 'Update shipping rate' })
  @ApiParam({ name: 'rateId', description: 'Shipping rate ID' })
  @ApiResponse({ status: 200, description: 'Shipping rate updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Shipping rate not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async updateShippingRate(
    @Request() req: any,
    @Param('rateId') rateId: string,
    @Body() updateShippingRateDto: UpdateShippingRateDto,
  ) {
    const user = req.user;

    // Check permissions
    const rate = await this.shippingService.findRateById(rateId);
    if (!rate) {
      throw new NotFoundException('Shipping rate not found');
    }

    const zone = await this.shippingService.findZoneById(rate.zoneId, ['shop']);
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shipping rate');
      }
    }

    const updatedRate = await this.shippingService.updateShippingRate(rateId, updateShippingRateDto);
    return {
      success: true,
      data: updatedRate,
    };
  }

  @Delete('rates/:rateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete shipping rate' })
  @ApiParam({ name: 'rateId', description: 'Shipping rate ID' })
  @ApiResponse({ status: 200, description: 'Shipping rate deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Shipping rate not found' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async deleteShippingRate(
    @Request() req: any,
    @Param('rateId') rateId: string,
  ) {
    const user = req.user;

    // Check permissions
    const rate = await this.shippingService.findRateById(rateId);
    if (!rate) {
      throw new NotFoundException('Shipping rate not found');
    }

    const zone = await this.shippingService.findZoneById(rate.zoneId, ['shop']);
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, zone.shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shipping rate');
      }
    }

    await this.shippingService.deleteShippingRate(rateId);
    return {
      success: true,
      message: 'Shipping rate deleted successfully',
    };
  }

  // Calculate shipping (public endpoint - no auth required for checkout)
  @Post('calculate')
  @ApiOperation({ summary: 'Calculate shipping rates' })
  @ApiResponse({ status: 200, description: 'Shipping rates calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Product or shop not found' })
  async calculateShipping(@Body() calculateShippingDto: CalculateShippingDto) {
    try {
      const rates = await this.shippingService.calculateShipping(calculateShippingDto);
      return {
        success: true,
        data: {
          rates,
          currency: 'USD',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Calculate shipping by session ID (used in checkout flow)
  @Get('calculate/:sessionId')
  @ApiOperation({ summary: 'Calculate shipping for checkout session' })
  @ApiParam({ name: 'sessionId', description: 'Checkout session ID' })
  @ApiResponse({ status: 200, description: 'Shipping rates calculated successfully' })
  @ApiResponse({ status: 404, description: 'Checkout session not found' })
  async calculateShippingForSession(@Param('sessionId') sessionId: string) {
    try {
      const rates = await this.shippingService.calculateShippingForSession(sessionId);
      return {
        success: true,
        data: {
          rates,
          currency: 'USD',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Shop owner can get shipping settings
  @Get('shops/:shopId/settings')
  @ApiOperation({ summary: 'Get shipping settings for a shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shipping settings retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async getShippingSettings(
    @Request() req: any,
    @Param('shopId') shopId: string,
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const settings = await this.shippingService.getShippingSettings(shopId);
    return {
      success: true,
      data: settings,
    };
  }

  // Update shipping settings (shop owner)
  @Put('shops/:shopId/settings')
  @ApiOperation({ summary: 'Update shipping settings for a shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shipping settings updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('shop_owner', 'platform_admin')
  async updateShippingSettings(
    @Request() req: any,
    @Param('shopId') shopId: string,
    @Body() body: {
      shippingEnabled?: boolean;
      freeShippingThreshold?: number;
    },
  ) {
    const user = req.user;

    // Check if user owns the shop or is admin
    if (user.role !== 'platform_admin') {
      const hasAccess = await this.shippingService.canUserAccessShop(user.id, shopId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this shop');
      }
    }

    const settings = await this.shippingService.updateShippingSettings(shopId, body);
    return {
      success: true,
      data: settings,
    };
  }

  // Admin endpoints
  @Get('admin/all-zones')
  @ApiOperation({ summary: 'Get all shipping zones (admin only)' })
  @ApiResponse({ status: 200, description: 'All shipping zones retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getAllShippingZones() {
    const zones = await this.shippingService.getAllShippingZones();
    return {
      success: true,
      data: zones,
    };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get shipping statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Shipping statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(RolesGuard)
  @Roles('platform_admin')
  async getShippingStats() {
    const stats = await this.shippingService.getShippingStats();
    return {
      success: true,
      data: stats,
    };
  }
}