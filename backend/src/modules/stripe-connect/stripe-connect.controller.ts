import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StripeConnectService } from './stripe-connect.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopsService } from '../shops/shops.service';
import { ForceCompleteDto } from './dto/force-complete.dto';

@ApiTags('stripe-connect')
@Controller('stripe-connect')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StripeConnectController {
  constructor(
    private readonly stripeConnectService: StripeConnectService,
    private readonly shopsService: ShopsService,
  ) {}

  @Post('create-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe Express account for shop' })
  @ApiResponse({ status: 200, description: 'Stripe account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async createAccount(@Request() req) {
    try {
      // Get user's shop
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0]; // Assuming one shop per user for now

      const result = await this.stripeConnectService.createExpressAccount(shop.id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('onboarding-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create onboarding link for existing account' })
  @ApiResponse({ status: 200, description: 'Onboarding link created successfully' })
  @ApiResponse({ status: 404, description: 'Shop or Stripe account not found' })
  async createOnboardingLink(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      const result = await this.stripeConnectService.createOnboardingLink(shop.id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create login link for Stripe Express Dashboard' })
  @ApiResponse({ status: 200, description: 'Login link created successfully' })
  @ApiResponse({ status: 404, description: 'Shop or Stripe account not found' })
  async createLoginLink(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      const result = await this.stripeConnectService.createAccountLoginLink(shop.id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('create-account-link/:accountId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create account link for any account' })
  @ApiResponse({ status: 200, description: 'Account link created successfully' })
  async createAccountLink(@Param('accountId') accountId: string) {
    try {
      const result = await this.stripeConnectService.createAccountLink(accountId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('account-status/:accountId')
  @ApiOperation({ summary: 'Get account charges and payouts status' })
  @ApiResponse({ status: 200, description: 'Account status retrieved successfully' })
  async getAccountStatus(@Param('accountId') accountId: string) {
    try {
      const result = await this.stripeConnectService.getAccountStatus(accountId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('account-details')
  @ApiOperation({ summary: 'Get Stripe account details' })
  @ApiResponse({ status: 200, description: 'Account details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop or Stripe account not found' })
  async getAccountDetails(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      const accountDetails = await this.stripeConnectService.getAccountDetails(shop.id);
      return {
        success: true,
        data: accountDetails,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shop Stripe status from Stripe' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Shop or Stripe account not found' })
  async updateStatus(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      const updatedShop = await this.stripeConnectService.updateShopStripeStatus(shop.id);
      return {
        success: true,
        data: {
          stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
          stripeChargesEnabled: updatedShop.stripeChargesEnabled,
          stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('onboarding-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark shop as active when Stripe onboarding is complete' })
  @ApiResponse({ status: 200, description: 'Shop marked as active successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async onboardingComplete(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];

      // First, update Stripe status
      await this.stripeConnectService.updateShopStripeStatus(shop.id);

      // Then, if onboarding is complete, activate the shop
      if (shop.stripeOnboardingComplete || shop.stripeChargesEnabled) {
        const updatedShop = await this.shopsService.stripeOnboardingComplete(shop.id);
        return {
          success: true,
          data: {
            isActive: updatedShop.isActive,
            status: updatedShop.status,
            stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
            stripeChargesEnabled: updatedShop.stripeChargesEnabled,
            stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
          },
        };
      }

      return {
        success: false,
        message: 'Stripe onboarding not yet completed',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Stripe Express account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shop or Stripe account not found' })
  async deleteAccount(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];
      await this.stripeConnectService.deleteStripeAccount(shop.id);
      return {
        success: true,
        message: 'Stripe account deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('check-kyc')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check KYC status for a Stripe account' })
  @ApiResponse({ status: 200, description: 'KYC status checked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async checkKyc(@Body() checkKycDto: { stripeAccountId: string }) {
    try {
      console.log(`Checking KYC status for account: ${checkKycDto.stripeAccountId}`);

      // Get account details directly from Stripe
      const account = await this.stripeConnectService.getAccountDetails(checkKycDto.stripeAccountId);

      console.log('Account details from Stripe:', {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        capabilities: account.capabilities
      });

      // Find shop by Stripe account ID
      const shop = await this.shopsService.findByStripeAccountId(checkKycDto.stripeAccountId);
      if (!shop) {
        throw new NotFoundException('Shop not found for this Stripe account');
      }

      // Update shop with latest Stripe status
      await this.stripeConnectService.updateShopStripeStatus(shop.id);

      // If KYC is complete, activate shop
      if (account.charges_enabled && account.payouts_enabled) {
        console.log('KYC complete, activating shop');
        await this.shopsService.stripeOnboardingComplete(shop.id);
        return {
          success: true,
          kycComplete: true,
          message: 'KYC verification complete, shop activated',
          shopStatus: {
            isActive: true,
            status: 'active',
            stripeChargesEnabled: true,
            stripePayoutsEnabled: true
          }
        };
      } else {
        console.log('KYC not complete yet');
        return {
          success: true,
          kycComplete: false,
          message: 'KYC verification not complete yet',
          shopStatus: {
            isActive: false,
            status: 'pending',
            stripeChargesEnabled: account.charges_enabled || false,
            stripePayoutsEnabled: account.payouts_enabled || false
          },
          requirements: account.requirements || []
        };
      }
    } catch (error) {
      console.error('KYC check error:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Webhook endpoint for Stripe Connect events
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe Connect webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() body: { type: string; data: { object: { id: string } } }) {
    try {
      const { type, data } = body;

      console.log(`Stripe webhook received: ${type}`, { data });

      switch (type) {
        case 'account.updated':
          const accountId = data.object.id;
          console.log(`Processing account.updated for account: ${accountId}`);

          // Get current account status from Stripe
          const account = await this.stripeConnectService.getAccountDetails(accountId);
          console.log('Account details from Stripe:', {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            requirements: account.requirements
          });

          // Update shop status based on KYC completion
          await this.stripeConnectService.updateShopStripeStatus(accountId);

          // If KYC is complete (charges_enabled and payouts_enabled), activate shop
          if (account.charges_enabled && account.payouts_enabled) {
            console.log('KYC complete, activating shop');
            const shop = await this.shopsService.findByStripeAccountId(accountId);
            if (shop) {
              await this.shopsService.stripeOnboardingComplete(shop.id);
              console.log(`Shop ${shop.id} activated successfully`);
            }
          } else {
            console.log('KYC not complete yet');
          }
          break;
        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('force-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force complete Stripe setup (set all status to true)' })
  @ApiResponse({ status: 200, description: 'Stripe setup force completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async forceComplete(@Request() req) {
    try {
      const shops = await this.shopsService.findByOwner(req.user.id);
      if (!shops || shops.length === 0) {
        throw new BadRequestException('You do not have a shop');
      }

      const shop = shops[0];

      // Force update all Stripe status to true
      const updatedShop = await this.stripeConnectService.forceCompleteStripeSetup(shop.id);

      return {
        success: true,
        message: 'Stripe setup force completed successfully',
        shop: {
          id: updatedShop.id,
          stripeOnboardingComplete: updatedShop.stripeOnboardingComplete,
          stripeChargesEnabled: updatedShop.stripeChargesEnabled,
          stripePayoutsEnabled: updatedShop.stripePayoutsEnabled,
          isActive: updatedShop.isActive,
          status: updatedShop.status,
        },
      };
    } catch (error) {
      console.error('Force complete error:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get('check/:accountId')
  @ApiOperation({ summary: 'Check Stripe account status by account ID' })
  @ApiResponse({ status: 200, description: 'Account status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid account ID or Stripe error' })
  async checkAccountStatus(@Param('accountId') accountId: string) {
    try {
      console.log(`Checking status for Stripe account: ${accountId}`);

      // Validate account ID format
      if (!accountId || !accountId.startsWith('acct_')) {
        throw new BadRequestException('Invalid Stripe account ID format');
      }

      // Get account details from Stripe
      const account = await this.stripeConnectService.getAccountDetailsByAccountId(accountId);

      if (!account) {
        throw new NotFoundException('Stripe account not found');
      }

      // Find shop associated with this Stripe account
      const shop = await this.shopsService.findByStripeAccountId(accountId);

      // Check if account is fully enabled
      const isVerified = account.charges_enabled &&
                        account.payouts_enabled &&
                        account.details_submitted &&
                        (!account.requirements?.currently_due || account.requirements.currently_due.length === 0);

      const result = {
        accountId: account.id,
        email: account.email,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        currentlyDue: account.requirements?.currently_due || [],
        isVerified: isVerified,
        capabilities: account.capabilities,
        requirements: account.requirements,
        businessProfile: account.business_profile,
        company: account.company,
        individual: account.individual,
        shop: shop ? {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          isActive: shop.isActive,
          status: shop.status,
          stripeOnboardingComplete: shop.stripeOnboardingComplete,
          stripeChargesEnabled: shop.stripeChargesEnabled,
          stripePayoutsEnabled: shop.stripePayoutsEnabled,
        } : null
      };

      console.log('Account status check result:', {
        accountId: result.accountId,
        chargesEnabled: result.chargesEnabled,
        payoutsEnabled: result.payoutsEnabled,
        isVerified: result.isVerified,
        hasShop: !!shop
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Failed to check account status:', error);

      // Re-throw known exceptions without modification
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestException(`Failed to check account status: ${error.message}`);
    }
  }
}