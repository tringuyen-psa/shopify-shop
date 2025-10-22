import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { StripeConnectEnhancedService } from './stripe-connect-enhanced.service';
import { ShopsService } from '../shops/shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateKycVerificationDto, UpdateKycVerificationDto, UploadKycDocumentDto, KycVerificationQueryDto } from './dto/create-kyc-verification.dto';
import { KycVerificationStatus } from './entities/kyc-verification.entity';

@ApiTags('kyc-verification')
@Controller('kyc-verification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycVerificationController {
  constructor(
    private readonly kycService: StripeConnectEnhancedService,
    private readonly shopsService: ShopsService,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start KYC verification process' })
  @ApiResponse({ status: 200, description: 'KYC verification started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async startKycVerification(@Request() req, @Body() createKycDto: CreateKycVerificationDto) {
    try {
      // Get user's shop
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0]; // Assuming one shop per user for now

      const kycVerification = await this.kycService.createKycVerification(shop.id, createKycDto);

      return {
        success: true,
        data: {
          verificationId: kycVerification.verificationId,
          status: kycVerification.status,
          stripeAccountId: kycVerification.stripeAccountId,
          message: 'KYC verification started successfully',
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('my-verifications')
  @ApiOperation({ summary: 'Get user\'s KYC verifications' })
  @ApiResponse({ status: 200, description: 'KYC verifications retrieved successfully' })
  async getMyKycVerifications(
    @Request() req,
    @Query() query: KycVerificationQueryDto
  ) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      const { verifications, total } = await this.kycService.getShopKycVerifications(
        shop.id,
        query.status as KycVerificationStatus,
        query.page,
        query.limit
      );

      return {
        success: true,
        data: {
          verifications,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            pages: Math.ceil(total / query.limit),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':verificationId')
  @ApiOperation({ summary: 'Get KYC verification details' })
  @ApiResponse({ status: 200, description: 'KYC verification details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async getKycVerification(@Param('verificationId') verificationId: string, @Request() req) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      return {
        success: true,
        data: kycVerification,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':verificationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update KYC verification' })
  @ApiResponse({ status: 200, description: 'KYC verification updated successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async updateKycVerification(
    @Param('verificationId') verificationId: string,
    @Body() updateDto: UpdateKycVerificationDto,
    @Request() req
  ) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      const updatedVerification = await this.kycService.updateKycVerification(verificationId, updateDto);

      return {
        success: true,
        data: updatedVerification,
        message: 'KYC verification updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':verificationId/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload KYC document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('verificationId') verificationId: string,
    @UploadedFile() file: any,
    @Body() uploadDto: UploadKycDocumentDto,
    @Request() req
  ) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      // Convert file to base64 for processing
      const base64Data = file ? file.buffer.toString('base64') : uploadDto.base64Data;

      const documentData = {
        ...uploadDto,
        fileName: file ? file.originalname : uploadDto.fileName,
        mimeType: file ? file.mimetype : uploadDto.mimeType,
        base64Data: base64Data,
      };

      const document = await this.kycService.uploadKycDocument(verificationId, documentData);

      return {
        success: true,
        data: document,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':verificationId/submit-for-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYC verification for review' })
  @ApiResponse({ status: 200, description: 'Verification submitted for review successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async submitForReview(@Param('verificationId') verificationId: string, @Request() req) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      await this.kycService.submitForReview(verificationId);

      return {
        success: true,
        message: 'Verification submitted for review successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':verificationId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel KYC verification' })
  @ApiResponse({ status: 200, description: 'Verification cancelled successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async cancelVerification(@Param('verificationId') verificationId: string, @Request() req) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      await this.kycService.cancelKycVerification(verificationId);

      return {
        success: true,
        message: 'Verification cancelled successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':verificationId/onboarding-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe onboarding link for KYC verification' })
  @ApiResponse({ status: 200, description: 'Onboarding link created successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async createOnboardingLink(@Param('verificationId') verificationId: string, @Request() req) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      const { url } = await this.kycService.createKycOnboardingLink(verificationId);

      return {
        success: true,
        data: { onboardingUrl: url },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(':verificationId/sync-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync KYC verification status with Stripe' })
  @ApiResponse({ status: 200, description: 'Status synced successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async syncStatus(@Param('verificationId') verificationId: string, @Request() req) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      // Verify ownership
      const shops = await this.shopsService.findByOwner(req.user.id);
      const userShopIds = shops.map(shop => shop.id);

      if (!userShopIds.includes(kycVerification.shopId)) {
        throw new BadRequestException('Access denied');
      }

      await this.kycService.syncStripeAccountStatus(verificationId);

      const updatedVerification = await this.kycService.getKycVerification(verificationId);

      return {
        success: true,
        data: updatedVerification,
        message: 'Status synced successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all KYC verifications (admin only)' })
  @ApiResponse({ status: 200, description: 'KYC verifications retrieved successfully' })
  async getAllKycVerifications(
    @Query() query: KycVerificationQueryDto
  ) {
    try {
      // This would need admin role check in production
      const { verifications, total } = await this.kycService.getShopKycVerifications(
        null, // Get all verifications
        query.status as KycVerificationStatus,
        query.page,
        query.limit
      );

      return {
        success: true,
        data: {
          verifications,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            pages: Math.ceil(total / query.limit),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('admin/:verificationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get any KYC verification details (admin only)' })
  @ApiResponse({ status: 200, description: 'KYC verification details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'KYC verification not found' })
  async getAnyKycVerification(@Param('verificationId') verificationId: string) {
    try {
      const kycVerification = await this.kycService.getKycVerification(verificationId);

      return {
        success: true,
        data: kycVerification,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}