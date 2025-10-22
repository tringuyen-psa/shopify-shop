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
var StripeConnectEnhancedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConnectEnhancedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const kyc_verification_entity_1 = require("./entities/kyc-verification.entity");
const kyc_document_entity_1 = require("./entities/kyc-document.entity");
let StripeConnectEnhancedService = StripeConnectEnhancedService_1 = class StripeConnectEnhancedService {
    constructor(configService, shopRepository, kycVerificationRepository, kycDocumentRepository) {
        this.configService = configService;
        this.shopRepository = shopRepository;
        this.kycVerificationRepository = kycVerificationRepository;
        this.kycDocumentRepository = kycDocumentRepository;
        this.logger = new common_1.Logger(StripeConnectEnhancedService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async createKycVerification(shopId, createKycDto) {
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const existingVerification = await this.kycVerificationRepository.findOne({
            where: {
                shopId,
                status: kyc_verification_entity_1.KycVerificationStatus.PENDING
            },
            order: { createdAt: 'DESC' }
        });
        if (existingVerification) {
            throw new common_1.BadRequestException('You already have a pending verification. Please complete or cancel it first.');
        }
        try {
            let stripeAccountId = createKycDto.stripeAccountId || shop.stripeAccountId;
            if (!stripeAccountId) {
                const stripeAccount = await this.createStripeConnectAccount(createKycDto);
                stripeAccountId = stripeAccount.id;
                await this.shopRepository.update(shopId, { stripeAccountId });
            }
            const verificationId = `kyc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const kycVerification = await this.kycVerificationRepository.save({
                verificationId,
                shopId,
                stripeAccountId,
                verificationType: createKycDto.verificationType,
                businessType: createKycDto.businessType,
                status: kyc_verification_entity_1.KycVerificationStatus.PENDING,
                firstName: createKycDto.personalInfo?.firstName,
                lastName: createKycDto.personalInfo?.lastName,
                dateOfBirth: createKycDto.personalInfo?.dateOfBirth ? new Date(createKycDto.personalInfo.dateOfBirth) : null,
                nationality: createKycDto.personalInfo?.nationality,
                idNumber: createKycDto.personalInfo?.idNumber,
                phoneNumber: createKycDto.personalInfo?.phoneNumber,
                companyName: createKycDto.businessInfo?.companyName,
                registrationNumber: createKycDto.businessInfo?.registrationNumber,
                taxId: createKycDto.businessInfo?.taxId,
                businessEstablishedDate: createKycDto.businessInfo?.businessEstablishedDate ?
                    new Date(createKycDto.businessInfo.businessEstablishedDate) : null,
                addressLine1: createKycDto.businessInfo?.businessAddress?.line1 || createKycDto.personalInfo?.address?.line1,
                addressLine2: createKycDto.businessInfo?.businessAddress?.line2 || createKycDto.personalInfo?.address?.line2,
                city: createKycDto.businessInfo?.businessAddress?.city || createKycDto.personalInfo?.address?.city,
                state: createKycDto.businessInfo?.businessAddress?.state || createKycDto.personalInfo?.address?.state,
                postalCode: createKycDto.businessInfo?.businessAddress?.postalCode || createKycDto.personalInfo?.address?.postalCode,
                country: createKycDto.businessInfo?.businessAddress?.country || createKycDto.personalInfo?.address?.country,
                bankAccountNumber: createKycDto.bankInfo?.accountNumber,
                bankRoutingNumber: createKycDto.bankInfo?.routingNumber,
                bankName: createKycDto.bankInfo?.bankName,
                bankAccountHolderName: createKycDto.bankInfo?.accountHolderName,
            });
            await this.updateStripeAccountData(stripeAccountId, createKycDto);
            if (createKycDto.documents && createKycDto.documents.length > 0) {
                for (const docDto of createKycDto.documents) {
                    await this.uploadKycDocument(kycVerification.id, docDto);
                }
            }
            await this.syncStripeAccountStatus(kycVerification.id);
            this.logger.log(`Created KYC verification ${verificationId} for shop ${shopId}`);
            return kycVerification;
        }
        catch (error) {
            this.logger.error(`Failed to create KYC verification for shop ${shopId}:`, error);
            throw new common_1.BadRequestException(`Failed to create KYC verification: ${error.message}`);
        }
    }
    async createStripeConnectAccount(createKycDto) {
        const accountParams = {
            type: 'express',
            country: 'US',
            email: createKycDto.personalInfo?.email,
            business_type: createKycDto.businessType === kyc_verification_entity_1.KycBusinessType.COMPANY ? 'company' : 'individual',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        };
        if (createKycDto.businessType === kyc_verification_entity_1.KycBusinessType.INDIVIDUAL) {
            accountParams.individual = {
                first_name: createKycDto.personalInfo?.firstName,
                last_name: createKycDto.personalInfo?.lastName,
                email: createKycDto.personalInfo?.email,
                phone: createKycDto.personalInfo?.phoneNumber,
                dob: createKycDto.personalInfo?.dateOfBirth ? {
                    day: parseInt(new Date(createKycDto.personalInfo.dateOfBirth).getDate().toString()),
                    month: parseInt(new Date(createKycDto.personalInfo.dateOfBirth).getMonth().toString()) + 1,
                    year: parseInt(new Date(createKycDto.personalInfo.dateOfBirth).getFullYear().toString()),
                } : undefined,
                address: createKycDto.personalInfo?.address ? {
                    line1: createKycDto.personalInfo.address.line1,
                    line2: createKycDto.personalInfo.address.line2,
                    city: createKycDto.personalInfo.address.city,
                    state: createKycDto.personalInfo.address.state,
                    postal_code: createKycDto.personalInfo.address.postalCode,
                    country: createKycDto.personalInfo.address.country,
                } : undefined,
                id_number: createKycDto.personalInfo?.idNumber,
            };
        }
        if (createKycDto.businessType === kyc_verification_entity_1.KycBusinessType.COMPANY) {
            accountParams.company = {
                name: createKycDto.businessInfo?.companyName,
                tax_id: createKycDto.businessInfo?.taxId,
                address: createKycDto.businessInfo?.businessAddress ? {
                    line1: createKycDto.businessInfo.businessAddress.line1,
                    line2: createKycDto.businessInfo.businessAddress.line2,
                    city: createKycDto.businessInfo.businessAddress.city,
                    state: createKycDto.businessInfo.businessAddress.state,
                    postal_code: createKycDto.businessInfo.businessAddress.postalCode,
                    country: createKycDto.businessInfo.businessAddress.country,
                } : undefined,
                phone: createKycDto.personalInfo?.phoneNumber,
            };
        }
        accountParams.business_profile = {
            name: createKycDto.businessInfo?.companyName ||
                `${createKycDto.personalInfo?.firstName} ${createKycDto.personalInfo?.lastName}`,
            product_description: createKycDto.businessInfo?.businessDescription || 'E-commerce business',
            url: createKycDto.businessInfo?.website,
            mcc: createKycDto.businessInfo?.mcc || '5399',
        };
        return await this.stripe.accounts.create(accountParams);
    }
    async updateStripeAccountData(stripeAccountId, kycData) {
        try {
            const updateData = {};
            if (kycData.businessType === kyc_verification_entity_1.KycBusinessType.INDIVIDUAL && kycData.personalInfo) {
                updateData.individual = {
                    first_name: kycData.personalInfo.firstName,
                    last_name: kycData.personalInfo.lastName,
                    email: kycData.personalInfo.email,
                    phone: kycData.personalInfo.phoneNumber,
                    dob: kycData.personalInfo.dateOfBirth ? {
                        day: parseInt(new Date(kycData.personalInfo.dateOfBirth).getDate().toString()),
                        month: parseInt(new Date(kycData.personalInfo.dateOfBirth).getMonth().toString()) + 1,
                        year: parseInt(new Date(kycData.personalInfo.dateOfBirth).getFullYear().toString()),
                    } : undefined,
                    address: kycData.personalInfo.address ? {
                        line1: kycData.personalInfo.address.line1,
                        line2: kycData.personalInfo.address.line2,
                        city: kycData.personalInfo.address.city,
                        state: kycData.personalInfo.address.state,
                        postal_code: kycData.personalInfo.address.postalCode,
                        country: kycData.personalInfo.address.country,
                    } : undefined,
                };
            }
            if (kycData.businessType === kyc_verification_entity_1.KycBusinessType.COMPANY && kycData.businessInfo) {
                updateData.company = {
                    name: kycData.businessInfo.companyName,
                    tax_id: kycData.businessInfo.taxId,
                    address: kycData.businessInfo.businessAddress ? {
                        line1: kycData.businessInfo.businessAddress.line1,
                        line2: kycData.businessInfo.businessAddress.line2,
                        city: kycData.businessInfo.businessAddress.city,
                        state: kycData.businessInfo.businessAddress.state,
                        postal_code: kycData.businessInfo.businessAddress.postalCode,
                        country: kycData.businessInfo.businessAddress.country,
                    } : undefined,
                };
                updateData.business_profile = {
                    name: kycData.businessInfo.companyName,
                    product_description: kycData.businessInfo.businessDescription,
                    url: kycData.businessInfo.website,
                    mcc: kycData.businessInfo.mcc,
                };
            }
            if (kycData.bankInfo) {
                this.logger.log('Bank information provided - should be handled via Stripe Dashboard for security');
            }
            if (Object.keys(updateData).length > 0) {
                await this.stripe.accounts.update(stripeAccountId, updateData);
            }
        }
        catch (error) {
            this.logger.error(`Failed to update Stripe account ${stripeAccountId}:`, error);
            throw error;
        }
    }
    async uploadKycDocument(kycVerificationId, uploadDto) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        try {
            const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            let stripeFileId = null;
            if (uploadDto.base64Data) {
                stripeFileId = await this.uploadFileToStripe(uploadDto.base64Data, uploadDto.fileName, uploadDto.mimeType);
            }
            else if (uploadDto.fileUrl) {
                this.logger.log(`File URL provided: ${uploadDto.fileUrl} - implement secure file handling`);
            }
            const kycDocument = await this.kycDocumentRepository.save({
                documentId,
                kycVerificationId,
                documentType: uploadDto.documentType,
                fileName: uploadDto.fileName,
                originalFileName: uploadDto.fileName,
                stripeFileId,
                isPrimaryDocument: uploadDto.isPrimaryDocument || false,
                isRequired: this.isRequiredDocument(uploadDto.documentType, kycVerification.verificationType),
                description: uploadDto.description,
                expiresAt: uploadDto.expiresAt ? new Date(uploadDto.expiresAt) : null,
                status: kyc_document_entity_1.KycDocumentStatus.PROCESSING,
            });
            if (stripeFileId && kycVerification.stripeAccountId) {
                await this.createStripeVerificationFile(kycVerification.stripeAccountId, stripeFileId, uploadDto.documentType);
            }
            this.logger.log(`Uploaded KYC document ${documentId} for verification ${kycVerificationId}`);
            return kycDocument;
        }
        catch (error) {
            this.logger.error(`Failed to upload KYC document for verification ${kycVerificationId}:`, error);
            throw new common_1.BadRequestException(`Failed to upload document: ${error.message}`);
        }
    }
    async uploadFileToStripe(base64Data, fileName, mimeType) {
        try {
            const base64Content = base64Data.split(',')[1];
            const fileBuffer = Buffer.from(base64Content, 'base64');
            const file = await this.stripe.files.create({
                purpose: 'identity_document',
                file: {
                    data: fileBuffer,
                    name: fileName,
                    type: mimeType || 'application/octet-stream',
                },
            });
            return file.id;
        }
        catch (error) {
            this.logger.error('Failed to upload file to Stripe:', error);
            throw error;
        }
    }
    async createStripeVerificationFile(stripeAccountId, stripeFileId, documentType) {
        try {
            const fileData = {};
            switch (documentType) {
                case kyc_document_entity_1.KycDocumentType.ID_FRONT:
                    fileData.id_document_front = stripeFileId;
                    break;
                case kyc_document_entity_1.KycDocumentType.ID_BACK:
                    fileData.id_document_back = stripeFileId;
                    break;
                case kyc_document_entity_1.KycDocumentType.PASSPORT:
                    fileData.id_document = stripeFileId;
                    break;
                case kyc_document_entity_1.KycDocumentType.DRIVING_LICENSE_FRONT:
                    fileData.verification_document_front = stripeFileId;
                    break;
                case kyc_document_entity_1.KycDocumentType.DRIVING_LICENSE_BACK:
                    fileData.verification_document_back = stripeFileId;
                    break;
            }
            await this.stripe.accounts.update(stripeAccountId, {
                individual: fileData,
            });
        }
        catch (error) {
            this.logger.error(`Failed to create Stripe verification file:`, error);
        }
    }
    isRequiredDocument(documentType, verificationType) {
        const requiredDocuments = [
            kyc_document_entity_1.KycDocumentType.ID_FRONT,
            kyc_document_entity_1.KycDocumentType.ID_BACK,
            kyc_document_entity_1.KycDocumentType.PASSPORT,
        ];
        return requiredDocuments.includes(documentType);
    }
    async updateKycVerification(kycVerificationId, updateDto) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        if (kycVerification.status === kyc_verification_entity_1.KycVerificationStatus.APPROVED) {
            throw new common_1.BadRequestException('Cannot update approved verification');
        }
        try {
            const updateData = {};
            if (updateDto.personalInfo) {
                updateData.firstName = updateDto.personalInfo.firstName;
                updateData.lastName = updateDto.personalInfo.lastName;
                updateData.dateOfBirth = updateDto.personalInfo.dateOfBirth ?
                    new Date(updateDto.personalInfo.dateOfBirth) : null;
                updateData.nationality = updateDto.personalInfo.nationality;
                updateData.phoneNumber = updateDto.personalInfo.phoneNumber;
                if (updateDto.personalInfo.address) {
                    updateData.addressLine1 = updateDto.personalInfo.address.line1;
                    updateData.addressLine2 = updateDto.personalInfo.address.line2;
                    updateData.city = updateDto.personalInfo.address.city;
                    updateData.state = updateDto.personalInfo.address.state;
                    updateData.postalCode = updateDto.personalInfo.address.postalCode;
                    updateData.country = updateDto.personalInfo.address.country;
                }
            }
            if (updateDto.businessInfo) {
                updateData.companyName = updateDto.businessInfo.companyName;
                updateData.registrationNumber = updateDto.businessInfo.registrationNumber;
                updateData.taxId = updateDto.businessInfo.taxId;
                updateData.businessEstablishedDate = updateDto.businessInfo.businessEstablishedDate ?
                    new Date(updateDto.businessInfo.businessEstablishedDate) : null;
                if (updateDto.businessInfo.businessAddress) {
                    updateData.addressLine1 = updateDto.businessInfo.businessAddress.line1;
                    updateData.addressLine2 = updateDto.businessInfo.businessAddress.line2;
                    updateData.city = updateDto.businessInfo.businessAddress.city;
                    updateData.state = updateDto.businessInfo.businessAddress.state;
                    updateData.postalCode = updateDto.businessInfo.businessAddress.postalCode;
                    updateData.country = updateDto.businessInfo.businessAddress.country;
                }
            }
            if (updateDto.bankInfo) {
                updateData.bankAccountNumber = updateDto.bankInfo.accountNumber;
                updateData.bankRoutingNumber = updateDto.bankInfo.routingNumber;
                updateData.bankName = updateDto.bankInfo.bankName;
                updateData.bankAccountHolderName = updateDto.bankInfo.accountHolderName;
            }
            if (updateDto.additionalInformation) {
                updateData.verificationMetadata = {
                    ...kycVerification.verificationMetadata,
                    additionalInformation: updateDto.additionalInformation,
                };
            }
            if (updateDto.submitForReview) {
                updateData.status = kyc_verification_entity_1.KycVerificationStatus.IN_REVIEW;
            }
            await this.kycVerificationRepository.update(kycVerificationId, updateData);
            if (kycVerification.stripeAccountId) {
                await this.syncStripeAccountStatus(kycVerificationId);
            }
            return await this.kycVerificationRepository.findOne({
                where: { id: kycVerificationId }
            });
        }
        catch (error) {
            this.logger.error(`Failed to update KYC verification ${kycVerificationId}:`, error);
            throw new common_1.BadRequestException(`Failed to update verification: ${error.message}`);
        }
    }
    async syncStripeAccountStatus(kycVerificationId) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification || !kycVerification.stripeAccountId) {
            return;
        }
        try {
            const account = await this.stripe.accounts.retrieve(kycVerification.stripeAccountId);
            const updateData = {
                stripeRequirements: account.requirements,
                stripeCapabilities: account.capabilities,
                chargesEnabled: account.charges_enabled,
                payoutsEnabled: account.payouts_enabled,
                transfersEnabled: account.capabilities?.transfers === 'active',
            };
            if (account.requirements?.currently_due?.length === 0 &&
                account.requirements?.past_due?.length === 0) {
                updateData.status = kyc_verification_entity_1.KycVerificationStatus.APPROVED;
                updateData.verifiedAt = new Date();
            }
            else if (account.requirements?.currently_due?.length > 0) {
                updateData.status = kyc_verification_entity_1.KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED;
                updateData.additionalInformationRequested = account.requirements.currently_due.join(', ');
            }
            else if (account.requirements?.past_due?.length > 0) {
                updateData.status = kyc_verification_entity_1.KycVerificationStatus.REJECTED;
                updateData.rejectionReason = account.requirements.past_due.join(', ');
                updateData.rejectedAt = new Date();
            }
            await this.kycVerificationRepository.update(kycVerificationId, updateData);
            if (kycVerification.shopId) {
                await this.shopRepository.update(kycVerification.shopId, {
                    stripeChargesEnabled: account.charges_enabled,
                    stripePayoutsEnabled: account.payouts_enabled,
                    stripeOnboardingComplete: updateData.status === kyc_verification_entity_1.KycVerificationStatus.APPROVED,
                });
            }
            this.logger.log(`Synced Stripe account status for KYC verification ${kycVerificationId}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync Stripe account status for ${kycVerificationId}:`, error);
        }
    }
    async getKycVerification(kycVerificationId) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId },
            relations: ['documents', 'shop'],
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        return kycVerification;
    }
    async getShopKycVerifications(shopId, status, page = 1, limit = 10) {
        const queryBuilder = this.kycVerificationRepository
            .createQueryBuilder('kyc')
            .leftJoinAndSelect('kyc.documents', 'documents')
            .where('kyc.shopId = :shopId', { shopId })
            .orderBy('kyc.createdAt', 'DESC');
        if (status) {
            queryBuilder.andWhere('kyc.status = :status', { status });
        }
        const [verifications, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { verifications, total };
    }
    async createKycOnboardingLink(kycVerificationId) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        if (!kycVerification.stripeAccountId) {
            throw new common_1.BadRequestException('No Stripe account associated with this verification');
        }
        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: kycVerification.stripeAccountId,
                refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/refresh`,
                return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/complete`,
                type: 'account_onboarding',
            });
            return { url: accountLink.url };
        }
        catch (error) {
            this.logger.error(`Failed to create onboarding link for ${kycVerificationId}:`, error);
            throw new common_1.BadRequestException('Failed to create onboarding link');
        }
    }
    async handleKycWebhook(event) {
        try {
            switch (event.type) {
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled KYC webhook type: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing KYC webhook ${event.type}:`, error);
            throw error;
        }
    }
    async handleAccountUpdated(account) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { stripeAccountId: account.id }
        });
        if (!kycVerification) {
            this.logger.warn(`No KYC verification found for Stripe account ${account.id}`);
            return;
        }
        await this.syncStripeAccountStatus(kycVerification.id);
    }
    async submitForReview(kycVerificationId) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        if (kycVerification.status !== kyc_verification_entity_1.KycVerificationStatus.PENDING &&
            kycVerification.status !== kyc_verification_entity_1.KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED) {
            throw new common_1.BadRequestException('Only pending or additional information required verifications can be submitted');
        }
        await this.kycVerificationRepository.update(kycVerificationId, {
            status: kyc_verification_entity_1.KycVerificationStatus.IN_REVIEW,
        });
        await this.syncStripeAccountStatus(kycVerificationId);
    }
    async cancelKycVerification(kycVerificationId) {
        const kycVerification = await this.kycVerificationRepository.findOne({
            where: { id: kycVerificationId }
        });
        if (!kycVerification) {
            throw new common_1.NotFoundException('KYC verification not found');
        }
        if (kycVerification.status === kyc_verification_entity_1.KycVerificationStatus.APPROVED) {
            throw new common_1.BadRequestException('Cannot cancel approved verification');
        }
        await this.kycVerificationRepository.update(kycVerificationId, {
            status: kyc_verification_entity_1.KycVerificationStatus.REJECTED,
            rejectionReason: 'Cancelled by user',
            rejectedAt: new Date(),
        });
    }
};
exports.StripeConnectEnhancedService = StripeConnectEnhancedService;
exports.StripeConnectEnhancedService = StripeConnectEnhancedService = StripeConnectEnhancedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(kyc_verification_entity_1.KycVerification)),
    __param(3, (0, typeorm_1.InjectRepository)(kyc_document_entity_1.KycDocument)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StripeConnectEnhancedService);
//# sourceMappingURL=stripe-connect-enhanced.service.js.map