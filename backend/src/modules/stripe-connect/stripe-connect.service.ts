import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shop } from "../shops/entities/shop.entity";

@Injectable()
export class StripeConnectService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>
  ) {
    this.stripe = new Stripe(this.configService.get("STRIPE_SECRET_KEY"), {
      apiVersion: "2023-10-16",
    });
  }

  /**
   * Create Stripe Express account for a shop
   */
  async createExpressAccount(
    shopId: string
  ): Promise<{ accountId: string; onboardingUrl: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException("Shop not found");
    }

    if (shop.stripeAccountId) {
      throw new BadRequestException("Shop already has a Stripe account");
    }

    try {
      // Create Express account
      const account = await this.stripe.accounts.create({
        type: "express",
        country: "US", // Changed back to US per user request
        email: shop.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          name: shop.name,
          url: shop.website || `https://your-platform.com/shops/${shop.slug}`,
        },
        metadata: {
          shop_id: shop.id, // Map to system shop ID
        },
      });

      // Update shop with Stripe account ID
      await this.shopRepository.update(shopId, {
        stripeAccountId: account.id,
      });

      // Create onboarding link
      const frontendUrl = this.configService.get("FRONTEND_URL");
      const isLiveMode =
        this.configService.get("NODE_ENV") === "production" ||
        this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");

      // In livemode, Stripe requires HTTPS URLs
      const baseUrl = isLiveMode
        ? frontendUrl.replace(/^http:/, "https:")
        : frontendUrl;

      const onboardingLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/shop/stripe/refresh`,
        return_url: `${baseUrl}/shop/stripe/complete`,
        type: "account_onboarding",
      });

      console.log(`Created Express account ${account.id} for shop ${shopId}`);

      return {
        accountId: account.id,
        onboardingUrl: onboardingLink.url,
      };
    } catch (error) {
      console.error("Failed to create Express account:", error);
      throw new BadRequestException("Failed to create Stripe Express account");
    }
  }

  /**
   * Get account login link for existing Stripe account
   */
  async createAccountLoginLink(shopId: string): Promise<{ loginUrl: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    try {
      const loginLink = await this.stripe.accounts.createLoginLink(
        shop.stripeAccountId
      );
      return { loginUrl: loginLink.url };
    } catch (error) {
      console.error("Failed to create login link:", error);
      throw new BadRequestException("Failed to create account login link");
    }
  }

  /**
   * Create onboarding link for existing incomplete account
   */
  async createOnboardingLink(
    shopId: string
  ): Promise<{ onboardingUrl: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    try {
      const frontendUrl = this.configService.get("FRONTEND_URL");
      const isLiveMode =
        this.configService.get("NODE_ENV") === "production" ||
        this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");

      // In livemode, Stripe requires HTTPS URLs
      const baseUrl = isLiveMode
        ? frontendUrl.replace(/^http:/, "https:")
        : frontendUrl;

      const onboardingLink = await this.stripe.accountLinks.create({
        account: shop.stripeAccountId,
        refresh_url: `${baseUrl}/shop/stripe/refresh`,
        return_url: `${baseUrl}/shop/stripe/complete`,
        type: "account_onboarding",
      });

      return { onboardingUrl: onboardingLink.url };
    } catch (error) {
      console.error("Failed to create onboarding link:", error);
      throw new BadRequestException("Failed to create onboarding link");
    }
  }

  /**
   * Get Stripe account details
   */
  async getAccountDetails(shopId: string): Promise<any> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    try {
      const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);
      return account;
    } catch (error) {
      console.error("Failed to retrieve account details:", error);
      throw new BadRequestException("Failed to retrieve account details");
    }
  }

  /**
   * Create account link for any account (standalone function like your example)
   */
  async createAccountLink(accountId: string): Promise<{ url: string }> {
    try {
      const frontendUrl = this.configService.get("FRONTEND_URL");
      const isLiveMode =
        this.configService.get("NODE_ENV") === "production" ||
        this.configService.get("STRIPE_SECRET_KEY")?.startsWith("sk_live_");

      // In livemode, Stripe requires HTTPS URLs
      const baseUrl = isLiveMode
        ? frontendUrl.replace(/^http:/, "https:")
        : frontendUrl;

      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/reauth`,
        return_url: `${baseUrl}/success`,
        type: "account_onboarding",
      });

      console.log("Onboarding link:", accountLink.url);
      return { url: accountLink.url };
    } catch (error) {
      console.error("Failed to create account link:", error);
      throw new BadRequestException("Failed to create account link");
    }
  }

  /**
   * Get account details by Stripe account ID (not shop ID)
   */
  async getAccountDetailsByAccountId(accountId: string): Promise<any> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account;
    } catch (error: any) {
      console.error("Failed to retrieve account details by account ID:", error);

      // Handle specific Stripe errors with proper HTTP status codes
      if (error.type === 'StripeInvalidRequestError') {
        if (error.message.includes('No such account')) {
          throw new NotFoundException(`Stripe account ${accountId} not found`);
        }
        throw new BadRequestException(`Invalid request: ${error.message}`);
      }

      if (error.type === 'StripeAuthenticationError') {
        throw new BadRequestException('Stripe authentication failed. Check your API keys.');
      }

      if (error.type === 'StripePermissionError') {
        throw new BadRequestException('Insufficient permissions to access this Stripe account.');
      }

      if (error.type === 'StripeRateLimitError') {
        throw new BadRequestException('Stripe API rate limit exceeded. Please try again later.');
      }

      if (error.type === 'StripeAPIError') {
        throw new BadRequestException('Stripe API error. Please try again later.');
      }

      if (error.type === 'StripeConnectionError') {
        throw new BadRequestException('Failed to connect to Stripe. Please check your network connection.');
      }

      // Generic fallback
      throw new BadRequestException(`Failed to retrieve account details: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get account status (charges_enabled, payouts_enabled)
   */
  async getAccountStatus(accountId: string): Promise<{
    charges_enabled: boolean;
    payouts_enabled: boolean;
  }> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      console.log(account.charges_enabled, account.payouts_enabled);
      return {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      };
    } catch (error) {
      console.error("Failed to retrieve account:", error);
      throw new BadRequestException("Failed to retrieve account status");
    }
  }

  /**
   * Update shop status based on Stripe account status
   */
  async updateShopStripeStatus(shopId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    try {
      const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);

      const updateData: Partial<Shop> = {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete:
          account.charges_enabled && account.payouts_enabled,
      };

      await this.shopRepository.update(shopId, updateData);

      console.log(`Updated Stripe status for shop ${shopId}:`, updateData);

      return await this.shopRepository.findOne({ where: { id: shopId } });
    } catch (error) {
      console.error("Failed to update shop Stripe status:", error);
      throw new BadRequestException("Failed to update shop Stripe status");
    }
  }

  /**
   * Handle Stripe webhook events for Connect accounts
   */
  async handleAccountUpdated(accountId: string): Promise<void> {
    const shop = await this.shopRepository.findOne({
      where: { stripeAccountId: accountId },
    });
    if (!shop) {
      console.log(`No shop found for Stripe account ${accountId}`);
      return;
    }

    await this.updateShopStripeStatus(shop.id);
  }

  /**
   * Create payment to shop's Stripe account (for direct charges)
   */
  async createDirectCharge(
    shopId: string,
    amount: number,
    paymentMethodId: string,
    metadata?: Record<string, string>
  ): Promise<{ paymentIntentId: string; clientSecret: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    if (!shop.stripeChargesEnabled) {
      throw new BadRequestException("Shop cannot receive payments yet");
    }

    try {
      // Calculate platform fee
      const platformFeePercent = shop.platformFeePercent || 15;
      const platformFee = Math.round((amount * platformFeePercent) / 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        transfer_data: {
          destination: shop.stripeAccountId,
        },
        application_fee_amount: platformFee,
        metadata: {
          shopId: shopId,
          ...metadata,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error("Failed to create direct charge:", error);
      throw new BadRequestException("Failed to create payment");
    }
  }

  /**
   * Delete Stripe account (for testing/cleanup)
   */
  async deleteStripeAccount(shopId: string): Promise<void> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException("Shop does not have a Stripe account");
    }

    try {
      await this.stripe.accounts.del(shop.stripeAccountId);
      await this.shopRepository.update(shopId, {
        stripeAccountId: null,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      });

      console.log(
        `Deleted Stripe account ${shop.stripeAccountId} for shop ${shopId}`
      );
    } catch (error) {
      console.error("Failed to delete Stripe account:", error);
      throw new BadRequestException("Failed to delete Stripe account");
    }
  }

  /**
   * Force complete Stripe setup by setting all status to true
   */
  async forceCompleteStripeSetup(shopId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException("Shop not found");
    }

    // Update all Stripe status to true
    const updatedShop = await this.shopRepository.save({
      ...shop,
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
      isActive: true,
      status: "active",
    });

    console.log(`Force completed Stripe setup for shop ${shopId}`);
    return updatedShop;
  }
}
