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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Roles } from '../auth/decorators/roles.decorator'; // Commented out to remove unused warning
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shop' })
  @ApiResponse({ status: 201, description: 'Shop successfully created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owners can create shops' })
  create(@Body() createShopDto: CreateShopDto, @Request() req) {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shops' })
  @ApiResponse({ status: 200, description: 'Shops retrieved successfully' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get shop by slug' })
  @ApiParam({ name: 'slug', description: 'Shop slug' })
  @ApiResponse({ status: 200, description: 'Shop retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.shopsService.findBySlug(slug);
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

  // Stripe Connect endpoints - basic implementation
  @Post(':id/connect/onboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start Stripe Connect onboarding' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Onboarding started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 501, description: 'Not Implemented' })
  startOnboarding(@Param('id', ParseUUIDPipe) _id: string) {
    return { message: 'Stripe onboarding endpoint - to be implemented' };
  }

  @Get(':id/connect/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Connect status' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Connect status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 501, description: 'Not Implemented' })
  getConnectStatus(@Param('id', ParseUUIDPipe) _id: string) {
    return { message: 'Stripe Connect status endpoint - to be implemented' };
  }

  @Post(':id/connect/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Stripe Connect onboarding link' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Onboarding link refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 501, description: 'Not Implemented' })
  refreshOnboardingLink(@Param('id', ParseUUIDPipe) _id: string) {
    return { message: 'Stripe refresh onboarding endpoint - to be implemented' };
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Express dashboard link' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Dashboard link retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only shop owner or platform admin' })
  @ApiResponse({ status: 501, description: 'Not Implemented' })
  getStripeDashboard(@Param('id', ParseUUIDPipe) _id: string) {
    return { message: 'Stripe dashboard endpoint - to be implemented' };
  }
}