import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { KycVerification, KycVerificationStatus } from './entities/kyc-verification.entity';

@Injectable()
export class KycStatusService {
  private readonly logger = new Logger(KycStatusService.name);

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(KycVerification)
    private readonly kycVerificationRepository: Repository<KycVerification>,
  ) {}

  /**
   * Update shop KYC status based on verification status
   */
  async updateShopKycStatus(shopId: string, verificationId?: string): Promise<void> {
    try {
      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) {
        this.logger.error(`Shop not found: ${shopId}`);
        return;
      }

      // Get the latest verification for this shop
      const latestVerification = await this.kycVerificationRepository.findOne({
        where: { shopId },
        order: { createdAt: 'DESC' },
      });

      if (!latestVerification) {
        // No verification exists, set to none
        await this.updateShopStatus(shopId, {
          kycStatus: 'none',
          currentKycVerificationId: null,
          hasValidKyc: false,
          kycRequirements: null,
          kycCapabilities: null,
        });
        return;
      }

      // Update shop based on latest verification status
      const updateData: Partial<Shop> = {
        currentKycVerificationId: latestVerification.id,
        kycRequirements: latestVerification.stripeRequirements,
        kycCapabilities: latestVerification.stripeCapabilities,
        hasValidKyc: latestVerification.status === KycVerificationStatus.APPROVED,
        kycStatus: 'none',
        kycSubmittedAt: null,
        kycVerifiedAt: null,
        kycRejectedAt: null,
        kycRejectionReason: null,
      };

      switch (latestVerification.status) {
        case KycVerificationStatus.PENDING:
          updateData.kycStatus = 'pending';
          updateData.kycSubmittedAt = latestVerification.createdAt;
          break;

        case KycVerificationStatus.IN_REVIEW:
          updateData.kycStatus = 'in_review';
          break;

        case KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED:
          updateData.kycStatus = 'additional_information_required';
          updateData.kycRejectionReason = latestVerification.additionalInformationRequested;
          break;

        case KycVerificationStatus.APPROVED:
          updateData.kycStatus = 'approved';
          updateData.kycVerifiedAt = latestVerification.verifiedAt;
          updateData.kycRejectionReason = null;
          break;

        case KycVerificationStatus.REJECTED:
          updateData.kycStatus = 'rejected';
          updateData.kycRejectedAt = latestVerification.rejectedAt;
          updateData.kycRejectionReason = latestVerification.rejectionReason;
          updateData.hasValidKyc = false;
          break;

        case KycVerificationStatus.RESTRICTED:
          updateData.kycStatus = 'restricted';
          updateData.kycRejectedAt = latestVerification.restrictedAt;
          updateData.kycRejectionReason = 'Account restricted by Stripe';
          updateData.hasValidKyc = false;
          break;

        default:
          updateData.kycStatus = 'none';
          updateData.hasValidKyc = false;
      }

      await this.updateShopStatus(shopId, updateData);

      this.logger.log(`Updated KYC status for shop ${shopId} to ${updateData.kycStatus}`);
    } catch (error) {
      this.logger.error(`Failed to update KYC status for shop ${shopId}:`, error);
    }
  }

  /**
   * Update shop status fields
   */
  private async updateShopStatus(shopId: string, updateData: any): Promise<void> {
    await this.shopRepository.update(shopId, updateData);
  }

  /**
   * Check if shop can receive payments
   */
  async canShopReceivePayments(shopId: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });

    if (!shop) {
      return false;
    }

    // Shop can receive payments if:
    // 1. Stripe charges are enabled, AND
    // 2. KYC is approved (or legacy onboarding is complete)
    return shop.stripeChargesEnabled &&
           (shop.hasValidKyc || shop.stripeOnboardingComplete);
  }

  /**
   * Check if shop can receive payouts
   */
  async canShopReceivePayouts(shopId: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });

    if (!shop) {
      return false;
    }

    // Shop can receive payouts if:
    // 1. Stripe payouts are enabled, AND
    // 2. KYC is approved (or legacy onboarding is complete)
    return shop.stripePayoutsEnabled &&
           (shop.hasValidKyc || shop.stripeOnboardingComplete);
  }

  /**
   * Get KYC status summary for a shop
   */
  async getKycStatusSummary(shopId: string): Promise<any> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new Error('Shop not found');
    }

    const latestVerification = await this.kycVerificationRepository.findOne({
      where: { shopId },
      order: { createdAt: 'DESC' },
      relations: ['documents'],
    });

    const summary = {
      kycStatus: shop.kycStatus,
      hasValidKyc: shop.hasValidKyc,
      canReceivePayments: await this.canShopReceivePayments(shopId),
      canReceivePayouts: await this.canShopReceivePayouts(shopId),
      currentVerification: latestVerification ? {
        id: latestVerification.id,
        verificationId: latestVerification.verificationId,
        status: latestVerification.status,
        createdAt: latestVerification.createdAt,
        updatedAt: latestVerification.updatedAt,
        documentsSubmitted: latestVerification.documents?.length || 0,
      } : null,
      stripeStatus: {
        chargesEnabled: shop.stripeChargesEnabled,
        payoutsEnabled: shop.stripePayoutsEnabled,
        accountId: shop.stripeAccountId,
      },
      requirements: shop.kycRequirements,
      capabilities: shop.kycCapabilities,
    };

    if (shop.kycRejectionReason) {
      summary['rejectionReason'] = shop.kycRejectionReason;
    }

    return summary;
  }

  /**
   * Get shops requiring KYC attention
   */
  async getShopsRequiringAttention(): Promise<Shop[]> {
    return await this.shopRepository
      .createQueryBuilder('shop')
      .where('shop.kycStatus IN (:...statuses)', {
        statuses: ['additional_information_required', 'rejected', 'restricted']
      })
      .orWhere('shop.stripeChargesEnabled = :chargesEnabled AND shop.hasValidKyc = :hasValidKyc', {
        chargesEnabled: true,
        hasValidKyc: false
      })
      .orderBy('shop.updatedAt', 'DESC')
      .getMany();
  }

  /**
   * Get shops by KYC status
   */
  async getShopsByKycStatus(status: string): Promise<Shop[]> {
    return await this.shopRepository
      .createQueryBuilder('shop')
      .where('shop.kycStatus = :status', { status })
      .orderBy('shop.updatedAt', 'DESC')
      .getMany();
  }

  /**
   * Get KYC statistics
   */
  async getKycStatistics(): Promise<any> {
    const totalShops = await this.shopRepository.count();

    const statusCounts = await this.shopRepository
      .createQueryBuilder('shop')
      .select('shop.kycStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('shop.kycStatus')
      .getRawMany();

    const paymentEnabledShops = await this.shopRepository.count({
      where: { stripeChargesEnabled: true }
    });

    const payoutEnabledShops = await this.shopRepository.count({
      where: { stripePayoutsEnabled: true }
    });

    const validKycShops = await this.shopRepository.count({
      where: { hasValidKyc: true }
    });

    return {
      totalShops,
      paymentEnabledShops,
      payoutEnabledShops,
      validKycShops,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
    };
  }

  /**
   * Handle KYC webhook events
   */
  async handleKycWebhook(eventType: string, data: any): Promise<void> {
    try {
      switch (eventType) {
        case 'kyc_verification.created':
        case 'kyc_verification.updated':
          if (data.verificationId) {
            const verification = await this.kycVerificationRepository.findOne({
              where: { verificationId: data.verificationId }
            });
            if (verification) {
              await this.updateShopKycStatus(verification.shopId, verification.id);
            }
          }
          break;

        case 'kyc_verification.approved':
        case 'kyc_verification.rejected':
          if (data.verificationId) {
            const verification = await this.kycVerificationRepository.findOne({
              where: { verificationId: data.verificationId }
            });
            if (verification) {
              await this.updateShopKycStatus(verification.shopId, verification.id);
            }
          }
          break;

        default:
          this.logger.log(`Unhandled KYC webhook type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error handling KYC webhook ${eventType}:`, error);
    }
  }

  /**
   * Periodic sync of all shop KYC statuses
   */
  async syncAllShopKycStatuses(): Promise<void> {
    try {
      const shops = await this.shopRepository.find({
        where: [
          { stripeAccountId: Not(null) },
          { currentKycVerificationId: Not(null) }
        ]
      });

      for (const shop of shops) {
        await this.updateShopKycStatus(shop.id);
      }

      this.logger.log(`Synced KYC status for ${shops.length} shops`);
    } catch (error) {
      this.logger.error('Failed to sync shop KYC statuses:', error);
    }
  }

  /**
   * Cleanup old KYC verifications
   */
  async cleanupOldVerifications(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 year ago

      const result = await this.kycVerificationRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .andWhere('status IN (:...statuses)', {
          statuses: [KycVerificationStatus.APPROVED, KycVerificationStatus.REJECTED]
        })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} old KYC verifications`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Failed to cleanup old KYC verifications:', error);
      return 0;
    }
  }
}