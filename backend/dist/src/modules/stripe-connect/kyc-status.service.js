"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KycStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const kyc_verification_entity_1 = require("./entities/kyc-verification.entity");
let KycStatusService = KycStatusService_1 = class KycStatusService {
    constructor(shopRepository, kycVerificationRepository) {
        this.shopRepository = shopRepository;
        this.kycVerificationRepository = kycVerificationRepository;
        this.logger = new common_1.Logger(KycStatusService_1.name);
    }
    async updateShopKycStatus(shopId, verificationId) {
        try {
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                this.logger.error(`Shop not found: ${shopId}`);
                return;
            }
            const latestVerification = await this.kycVerificationRepository.findOne({
                where: { shopId },
                order: { createdAt: 'DESC' },
            });
            if (!latestVerification) {
                await this.updateShopStatus(shopId, {
                    kycStatus: 'none',
                    currentKycVerificationId: null,
                    hasValidKyc: false,
                    kycRequirements: null,
                    kycCapabilities: null,
                });
                return;
            }
            const updateData = {
                currentKycVerificationId: latestVerification.id,
                kycRequirements: latestVerification.stripeRequirements,
                kycCapabilities: latestVerification.stripeCapabilities,
                hasValidKyc: latestVerification.status === kyc_verification_entity_1.KycVerificationStatus.APPROVED,
                kycStatus: 'none',
                kycSubmittedAt: null,
                kycVerifiedAt: null,
                kycRejectedAt: null,
                kycRejectionReason: null,
            };
            switch (latestVerification.status) {
                case kyc_verification_entity_1.KycVerificationStatus.PENDING:
                    updateData.kycStatus = 'pending';
                    updateData.kycSubmittedAt = latestVerification.createdAt;
                    break;
                case kyc_verification_entity_1.KycVerificationStatus.IN_REVIEW:
                    updateData.kycStatus = 'in_review';
                    break;
                case kyc_verification_entity_1.KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED:
                    updateData.kycStatus = 'additional_information_required';
                    updateData.kycRejectionReason = latestVerification.additionalInformationRequested;
                    break;
                case kyc_verification_entity_1.KycVerificationStatus.APPROVED:
                    updateData.kycStatus = 'approved';
                    updateData.kycVerifiedAt = latestVerification.verifiedAt;
                    updateData.kycRejectionReason = null;
                    break;
                case kyc_verification_entity_1.KycVerificationStatus.REJECTED:
                    updateData.kycStatus = 'rejected';
                    updateData.kycRejectedAt = latestVerification.rejectedAt;
                    updateData.kycRejectionReason = latestVerification.rejectionReason;
                    updateData.hasValidKyc = false;
                    break;
                case kyc_verification_entity_1.KycVerificationStatus.RESTRICTED:
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
        }
        catch (error) {
            this.logger.error(`Failed to update KYC status for shop ${shopId}:`, error);
        }
    }
    async updateShopStatus(shopId, updateData) {
        await this.shopRepository.update(shopId, updateData);
    }
    async canShopReceivePayments(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            return false;
        }
        return shop.stripeChargesEnabled &&
            (shop.hasValidKyc || shop.stripeOnboardingComplete);
    }
    async canShopReceivePayouts(shopId) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            return false;
        }
        return shop.stripePayoutsEnabled &&
            (shop.hasValidKyc || shop.stripeOnboardingComplete);
    }
    async getKycStatusSummary(shopId) {
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
    async getShopsRequiringAttention() {
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
    async getShopsByKycStatus(status) {
        return await this.shopRepository
            .createQueryBuilder('shop')
            .where('shop.kycStatus = :status', { status })
            .orderBy('shop.updatedAt', 'DESC')
            .getMany();
    }
    async getKycStatistics() {
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
    async handleKycWebhook(eventType, data) {
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
        }
        catch (error) {
            this.logger.error(`Error handling KYC webhook ${eventType}:`, error);
        }
    }
    async syncAllShopKycStatuses() {
        try {
            const shops = await this.shopRepository.find({
                where: [
                    { stripeAccountId: (0, typeorm_2.Not)(null) },
                    { currentKycVerificationId: (0, typeorm_2.Not)(null) }
                ]
            });
            for (const shop of shops) {
                await this.updateShopKycStatus(shop.id);
            }
            this.logger.log(`Synced KYC status for ${shops.length} shops`);
        }
        catch (error) {
            this.logger.error('Failed to sync shop KYC statuses:', error);
        }
    }
    async cleanupOldVerifications() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            const result = await this.kycVerificationRepository
                .createQueryBuilder()
                .delete()
                .where('createdAt < :cutoffDate', { cutoffDate })
                .andWhere('status IN (:...statuses)', {
                statuses: [kyc_verification_entity_1.KycVerificationStatus.APPROVED, kyc_verification_entity_1.KycVerificationStatus.REJECTED]
            })
                .execute();
            this.logger.log(`Cleaned up ${result.affected} old KYC verifications`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error('Failed to cleanup old KYC verifications:', error);
            return 0;
        }
    }
};
exports.KycStatusService = KycStatusService;
exports.KycStatusService = KycStatusService = KycStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(1, (0, typeorm_1.InjectRepository)(kyc_verification_entity_1.KycVerification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], KycStatusService);
//# sourceMappingURL=kyc-status.service.js.map