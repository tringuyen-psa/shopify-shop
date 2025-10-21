import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  RawBody,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateSetupIntentDto } from './dto/create-setup-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Payment Intents
  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    try {
      const paymentIntent = await this.paymentsService.createPaymentIntent(createPaymentIntentDto);
      return {
        success: true,
        data: paymentIntent,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('payment-intents/:intentId')
  @ApiOperation({ summary: 'Get payment intent details' })
  @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async getPaymentIntent(@Param('intentId') intentId: string) {
    try {
      const paymentIntent = await this.paymentsService.getPaymentIntent(intentId);
      return {
        success: true,
        data: paymentIntent,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('payment-intents/:intentId/confirm')
  @ApiOperation({ summary: 'Confirm payment intent' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Payment confirmation failed' })
  async confirmPaymentIntent(@Param('intentId') intentId: string) {
    try {
      const result = await this.paymentsService.confirmPaymentIntent(intentId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('payment-intents/:intentId/cancel')
  @ApiOperation({ summary: 'Cancel payment intent' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Payment cancellation failed' })
  async cancelPaymentIntent(@Param('intentId') intentId: string) {
    try {
      const result = await this.paymentsService.cancelPaymentIntent(intentId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Setup Intents for saved cards
  @Post('create-setup-intent')
  @ApiOperation({ summary: 'Create setup intent for saving payment method' })
  @ApiResponse({ status: 200, description: 'Setup intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createSetupIntent(@Body() createSetupIntentDto: CreateSetupIntentDto) {
    try {
      const setupIntent = await this.paymentsService.createSetupIntent(createSetupIntentDto);
      return {
        success: true,
        data: setupIntent,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Customer Payment Methods
  @Get('customers/:customerId/payment-methods')
  @ApiOperation({ summary: 'Get customer payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getCustomerPaymentMethods(@Param('customerId') customerId: string) {
    try {
      const paymentMethods = await this.paymentsService.getCustomerPaymentMethods(customerId);
      return {
        success: true,
        data: paymentMethods,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('payment-methods/:paymentMethodId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detach payment method' })
  @ApiResponse({ status: 200, description: 'Payment method detached successfully' })
  async detachPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    try {
      await this.paymentsService.detachPaymentMethod(paymentMethodId);
      return {
        success: true,
        message: 'Payment method detached successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Refunds
  @Post('refunds')
  @ApiOperation({ summary: 'Create refund' })
  @ApiResponse({ status: 200, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Refund creation failed' })
  async createRefund(@Body() refundPaymentDto: RefundPaymentDto) {
    try {
      const refund = await this.paymentsService.createRefund(refundPaymentDto);
      return {
        success: true,
        data: refund,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('refunds/:refundId')
  @ApiOperation({ summary: 'Get refund details' })
  @ApiResponse({ status: 200, description: 'Refund details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  async getRefund(@Param('refundId') refundId: string) {
    try {
      const refund = await this.paymentsService.getRefund(refundId);
      return {
        success: true,
        data: refund,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Connect for Shop Owners
  @Post('connect/create-account')
  @ApiOperation({ summary: 'Create Stripe Connect account for shop owner' })
  @ApiResponse({ status: 200, description: 'Connect account created successfully' })
  async createConnectAccount(@Body() body: { shopId: string; userId: string }) {
    try {
      const account = await this.paymentsService.createConnectAccount(body.shopId, body.userId);
      return {
        success: true,
        data: account,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('connect/accounts/:accountId')
  @ApiOperation({ summary: 'Get Connect account details' })
  @ApiResponse({ status: 200, description: 'Account details retrieved successfully' })
  async getConnectAccount(@Param('accountId') accountId: string) {
    try {
      const account = await this.paymentsService.getConnectAccount(accountId);
      return {
        success: true,
        data: account,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('connect/accounts/:accountId/onboard-link')
  @ApiOperation({ summary: 'Create onboarding link for Connect account' })
  @ApiResponse({ status: 200, description: 'Onboarding link created successfully' })
  async createOnboardingLink(@Param('accountId') accountId: string) {
    try {
      const link = await this.paymentsService.createOnboardingLink(accountId);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('connect/accounts/:accountIddashboard-link')
  @ApiOperation({ summary: 'Create dashboard link for Connect account' })
  @ApiResponse({ status: 200, description: 'Dashboard link created successfully' })
  async createDashboardLink(@Param('accountId') accountId: string) {
    try {
      const link = await this.paymentsService.createDashboardLink(accountId);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Webhook handler
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiBody({ type: 'string' })
  async handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const result = await this.paymentsService.handleWebhook(rawBody, signature);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Checkout Sessions (for direct checkout flow)
  @Post('checkout/create-session')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created successfully' })
  async createCheckoutSession(@Body() body: {
    productId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    billingCycle?: string;
  }) {
    try {
      const session = await this.paymentsService.createCheckoutSession(body);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('checkout/sessions/:sessionId')
  @ApiOperation({ summary: 'Get checkout session details' })
  @ApiResponse({ status: 200, description: 'Checkout session retrieved successfully' })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.paymentsService.getCheckoutSession(sessionId);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Subscriptions
  @Post('subscriptions/create')
  @ApiOperation({ summary: 'Create Stripe subscription' })
  @ApiResponse({ status: 200, description: 'Subscription created successfully' })
  async createSubscription(@Body() body: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    paymentMethodId?: string;
  }) {
    try {
      const subscription = await this.paymentsService.createSubscription(body);
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('subscriptions/:subscriptionId/cancel')
  @ApiOperation({ summary: 'Cancel Stripe subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { immediately?: boolean; reason?: string },
  ) {
    try {
      const subscription = await this.paymentsService.cancelSubscription(
        subscriptionId,
        body.immediately,
      );
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Balance and Payouts
  @Get('connect/accounts/:accountId/balance')
  @ApiOperation({ summary: 'Get Connect account balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getAccountBalance(@Param('accountId') accountId: string) {
    try {
      const balance = await this.paymentsService.getAccountBalance(accountId);
      return {
        success: true,
        data: balance,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('connect/accounts/:accountId/payout')
  @ApiOperation({ summary: 'Create payout for Connect account' })
  @ApiResponse({ status: 200, description: 'Payout created successfully' })
  async createPayout(
    @Param('accountId') accountId: string,
    @Body() body: { amount: number; currency?: string },
  ) {
    try {
      const payout = await this.paymentsService.createPayout(accountId, body.amount, body.currency);
      return {
        success: true,
        data: payout,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Admin endpoints
  @Get('admin/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get all transactions (admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getAllTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('shopId') shopId?: string,
  ) {
    try {
      const transactions = await this.paymentsService.getAllTransactions(
        page,
        limit,
        shopId,
      );
      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('admin/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get payment metrics (admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getPaymentMetrics(@Query('period') period: string = 'month') {
    try {
      const metrics = await this.paymentsService.getPaymentMetrics(period);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}