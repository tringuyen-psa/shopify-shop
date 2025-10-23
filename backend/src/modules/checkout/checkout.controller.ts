import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { OrdersService } from '../orders/orders.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SaveInformationDto } from './dto/save-information.dto';
import { SelectShippingDto } from './dto/select-shipping.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('create-session')
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async createCheckoutSession(@Body() createCheckoutSessionDto: CreateCheckoutSessionDto) {
    try {
      const session = await this.checkoutService.createSession(createCheckoutSessionDto);
      return {
        success: true,
        data: session,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get checkout session by session ID' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Checkout session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found or expired' })
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.checkoutService.findBySessionId(sessionId);

      if (!session) {
        throw new NotFoundException('Checkout session not found');
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        throw new BadRequestException('Checkout session has expired');
      }

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('sessions/:sessionId/information')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save customer information (Step 1)' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Customer information saved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or session expired' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async saveInformation(
    @Param('sessionId') sessionId: string,
    @Body() saveInformationDto: SaveInformationDto,
  ) {
    try {
      const result = await this.checkoutService.saveInformation(sessionId, saveInformationDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('sessions/:sessionId/shipping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select shipping method (Step 2)' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Shipping method selected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid shipping rate or session expired' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async selectShipping(
    @Param('sessionId') sessionId: string,
    @Body() selectShippingDto: SelectShippingDto,
  ) {
    try {
      const result = await this.checkoutService.selectShipping(sessionId, selectShippingDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('sessions/:sessionId/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create payment session (Step 3)' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Payment session created successfully' })
  @ApiResponse({ status: 400, description: 'Payment failed or session expired' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async createPayment(
    @Param('sessionId') sessionId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    try {
      const result = await this.checkoutService.createPayment(sessionId, createPaymentDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('create-payment-intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create payment intent for direct card payments' })
  @ApiResponse({ status: 200, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Payment intent creation failed' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    try {
      const result = await this.checkoutService.createPaymentIntent(createPaymentIntentDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get('sessions/:sessionId/summary')
  @ApiOperation({ summary: 'Get checkout summary with all details' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Checkout summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getCheckoutSummary(@Param('sessionId') sessionId: string) {
    try {
      const summary = await this.checkoutService.getCheckoutSummary(sessionId);
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Patch('sessions/:sessionId/expire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually expire checkout session (admin use)' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Session expired successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async expireSession(@Param('sessionId') sessionId: string) {
    try {
      await this.checkoutService.expireSession(sessionId);
      return {
        success: true,
        message: 'Checkout session expired successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Public endpoint for checkout page loading
  @Get(':sessionId')
  @ApiOperation({ summary: 'Public endpoint for checkout page (no auth required)' })
  @ApiParam({ name: 'sessionId', description: 'Public session ID' })
  @ApiResponse({ status: 200, description: 'Checkout data for public page' })
  @ApiResponse({ status: 404, description: 'Session not found or expired' })
  async getPublicCheckoutData(@Param('sessionId') sessionId: string) {
    try {
      const data = await this.checkoutService.getPublicCheckoutData(sessionId);
      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('update-session-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update checkout session status (webhook)' })
  @ApiResponse({ status: 200, description: 'Session status updated successfully' })
  async updateSessionStatus(@Body() body: { sessionId: string; status: string }) {
    try {
      await this.checkoutService.updateSessionStatus(body.sessionId, body.status);
      return {
        success: true,
        message: 'Session status updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('orders/confirm')
  @ApiOperation({ summary: 'Confirm order and show confirmation page (public)' })
  @ApiParam({ name: 'session_id', description: 'Stripe checkout session ID' })
  @ApiResponse({ status: 200, description: 'Order confirmation data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found or expired' })
  async confirmOrder(@Query('session_id') sessionId: string) {
    try {
      // Find checkout session by Stripe session ID
      const checkoutSession = await this.checkoutService.findByStripeSessionId(sessionId);

      if (!checkoutSession) {
        throw new NotFoundException('Checkout session not found');
      }

      // Always try to create order (will handle idempotency in service)
      try {
        const order = await this.ordersService.createOrderFromCheckoutSession(checkoutSession.sessionId);
        console.log('Order created successfully:', order.orderNumber);

        return {
          success: true,
          data: {
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            createdAt: order.createdAt,
            customerName: order.customerName,
          },
        };
      } catch (orderError) {
        console.error('Failed to create order from checkout session:', orderError);
        throw new BadRequestException('Failed to create order from checkout session');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('update-session-by-stripe-id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update checkout session status by Stripe ID (webhook)' })
  @ApiResponse({ status: 200, description: 'Session status updated successfully' })
  async updateSessionByStripeId(@Body() body: { stripeSessionId: string; status: string }) {
    try {
      await this.checkoutService.updateSessionByStripeId(body.stripeSessionId, body.status);

      // If payment is completed, create order
      if (body.status === 'completed') {
        try {
          console.log('Payment completed, creating order for Stripe session:', body.stripeSessionId);

          // Find checkout session by Stripe session ID
          const checkoutSession = await this.checkoutService.findByStripeSessionId(body.stripeSessionId);

          if (checkoutSession) {
            // Create order from checkout session
            const order = await this.ordersService.createOrderFromCheckoutSession(checkoutSession.sessionId);
            console.log('Order created successfully:', order.orderNumber);
          } else {
            console.log('Checkout session not found for Stripe session:', body.stripeSessionId);
          }
        } catch (orderError) {
          console.error('Failed to create order from checkout session:', orderError);
          // Don't fail the webhook if order creation fails
        }
      }

      return {
        success: true,
        message: 'Session status updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}