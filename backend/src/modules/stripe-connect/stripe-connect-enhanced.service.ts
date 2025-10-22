import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { KycVerification, KycVerificationStatus, KycVerificationType, KycBusinessType } from './entities/kyc-verification.entity';
import { KycDocument, KycDocumentStatus, KycDocumentType } from './entities/kyc-document.entity';
import { CreateKycVerificationDto, UpdateKycVerificationDto, UploadKycDocumentDto } from './dto/create-kyc-verification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StripeConnectEnhancedService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeConnectEnhancedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(KycVerification)
    private readonly kycVerificationRepository: Repository<KycVerification>,
    @InjectRepository(KycDocument)
    private readonly kycDocumentRepository: Repository<KycDocument>,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create comprehensive KYC verification for a shop
   */
  async createKycVerification(shopId: string, createKycDto: CreateKycVerificationDto): Promise<KycVerification> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Check if there's already a pending verification
    const existingVerification = await this.kycVerificationRepository.findOne({
      where: {
        shopId,
        status: KycVerificationStatus.PENDING
      },
      order: { createdAt: 'DESC' }
    });

    if (existingVerification) {
      throw new BadRequestException('You already have a pending verification. Please complete or cancel it first.');
    }

    try {
      // Create Stripe Connect account if not exists
      let stripeAccountId = createKycDto.stripeAccountId || shop.stripeAccountId;

      if (!stripeAccountId) {
        const stripeAccount = await this.createStripeConnectAccount(createKycDto);
        stripeAccountId = stripeAccount.id;

        // Update shop with Stripe account ID
        await this.shopRepository.update(shopId, { stripeAccountId });
      }

      // Create KYC verification record
      const verificationId = `kyc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      const kycVerification = await this.kycVerificationRepository.save({
        verificationId,
        shopId,
        stripeAccountId,
        verificationType: createKycDto.verificationType,
        businessType: createKycDto.businessType,
        status: KycVerificationStatus.PENDING,

        // Personal information
        firstName: createKycDto.personalInfo?.firstName,
        lastName: createKycDto.personalInfo?.lastName,
        dateOfBirth: createKycDto.personalInfo?.dateOfBirth ? new Date(createKycDto.personalInfo.dateOfBirth) : null,
        nationality: createKycDto.personalInfo?.nationality,
        idNumber: createKycDto.personalInfo?.idNumber,
        phoneNumber: createKycDto.personalInfo?.phoneNumber,

        // Business information
        companyName: createKycDto.businessInfo?.companyName,
        registrationNumber: createKycDto.businessInfo?.registrationNumber,
        taxId: createKycDto.businessInfo?.taxId,
        businessEstablishedDate: createKycDto.businessInfo?.businessEstablishedDate ?
          new Date(createKycDto.businessInfo.businessEstablishedDate) : null,

        // Address information (use business address first, then personal)
        addressLine1: createKycDto.businessInfo?.businessAddress?.line1 || createKycDto.personalInfo?.address?.line1,
        addressLine2: createKycDto.businessInfo?.businessAddress?.line2 || createKycDto.personalInfo?.address?.line2,
        city: createKycDto.businessInfo?.businessAddress?.city || createKycDto.personalInfo?.address?.city,
        state: createKycDto.businessInfo?.businessAddress?.state || createKycDto.personalInfo?.address?.state,
        postalCode: createKycDto.businessInfo?.businessAddress?.postalCode || createKycDto.personalInfo?.address?.postalCode,
        country: createKycDto.businessInfo?.businessAddress?.country || createKycDto.personalInfo?.address?.country,

        // Bank information
        bankAccountNumber: createKycDto.bankInfo?.accountNumber,
        bankRoutingNumber: createKycDto.bankInfo?.routingNumber,
        bankName: createKycDto.bankInfo?.bankName,
        bankAccountHolderName: createKycDto.bankInfo?.accountHolderName,
      });

      // Update Stripe account with collected information
      await this.updateStripeAccountData(stripeAccountId, createKycDto);

      // Handle document uploads if provided
      if (createKycDto.documents && createKycDto.documents.length > 0) {
        for (const docDto of createKycDto.documents) {
          await this.uploadKycDocument(kycVerification.id, docDto);
        }
      }

      // Update Stripe account status
      await this.syncStripeAccountStatus(kycVerification.id);

      this.logger.log(`Created KYC verification ${verificationId} for shop ${shopId}`);

      return kycVerification;
    } catch (error) {
      this.logger.error(`Failed to create KYC verification for shop ${shopId}:`, error);
      throw new BadRequestException(`Failed to create KYC verification: ${error.message}`);
    }
  }

  /**
   * Create Stripe Connect account with enhanced parameters
   */
  private async createStripeConnectAccount(createKycDto: CreateKycVerificationDto): Promise<Stripe.Account> {
    const accountParams: Stripe.AccountCreateParams = {
      type: 'express',
      country: 'US',
      email: createKycDto.personalInfo?.email,
      business_type: createKycDto.businessType === KycBusinessType.COMPANY ? 'company' : 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };

    // Add individual details
    if (createKycDto.businessType === KycBusinessType.INDIVIDUAL) {
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

    // Add company details
    if (createKycDto.businessType === KycBusinessType.COMPANY) {
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

    // Add business profile
    accountParams.business_profile = {
      name: createKycDto.businessInfo?.companyName ||
             `${createKycDto.personalInfo?.firstName} ${createKycDto.personalInfo?.lastName}`,
      product_description: createKycDto.businessInfo?.businessDescription || 'E-commerce business',
      url: createKycDto.businessInfo?.website,
      mcc: createKycDto.businessInfo?.mcc || '5399', // Default to general merchandise
    };

    return await this.stripe.accounts.create(accountParams);
  }

  /**
   * Update Stripe account with collected data
   */
  private async updateStripeAccountData(stripeAccountId: string, kycData: CreateKycVerificationDto): Promise<void> {
    try {
      const updateData: Stripe.AccountUpdateParams = {};

      // Update individual information for individuals
      if (kycData.businessType === KycBusinessType.INDIVIDUAL && kycData.personalInfo) {
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

      // Update company information for companies
      if (kycData.businessType === KycBusinessType.COMPANY && kycData.businessInfo) {
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

      // Add external account if bank info provided
      if (kycData.bankInfo) {
        // This would need to be handled more carefully in production
        // with proper encryption and security measures
        this.logger.log('Bank information provided - should be handled via Stripe Dashboard for security');
      }

      if (Object.keys(updateData).length > 0) {
        await this.stripe.accounts.update(stripeAccountId, updateData);
      }
    } catch (error) {
      this.logger.error(`Failed to update Stripe account ${stripeAccountId}:`, error);
      throw error;
    }
  }

  /**
   * Upload KYC document
   */
  async uploadKycDocument(kycVerificationId: string, uploadDto: UploadKycDocumentDto): Promise<KycDocument> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    try {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // Handle file upload to Stripe
      let stripeFileId: string | null = null;
      if (uploadDto.base64Data) {
        stripeFileId = await this.uploadFileToStripe(uploadDto.base64Data, uploadDto.fileName, uploadDto.mimeType);
      } else if (uploadDto.fileUrl) {
        // For production, you'd download and upload the file from URL
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
        status: KycDocumentStatus.PROCESSING,
      });

      // Create Stripe verification file if needed
      if (stripeFileId && kycVerification.stripeAccountId) {
        await this.createStripeVerificationFile(
          kycVerification.stripeAccountId,
          stripeFileId,
          uploadDto.documentType
        );
      }

      this.logger.log(`Uploaded KYC document ${documentId} for verification ${kycVerificationId}`);

      return kycDocument;
    } catch (error) {
      this.logger.error(`Failed to upload KYC document for verification ${kycVerificationId}:`, error);
      throw new BadRequestException(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Upload file to Stripe
   */
  private async uploadFileToStripe(base64Data: string, fileName: string, mimeType?: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const base64Content = base64Data.split(',')[1]; // Remove data:application/pdf;base64, prefix if present
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
    } catch (error) {
      this.logger.error('Failed to upload file to Stripe:', error);
      throw error;
    }
  }

  /**
   * Create Stripe verification file
   */
  private async createStripeVerificationFile(
    stripeAccountId: string,
    stripeFileId: string,
    documentType: KycDocumentType
  ): Promise<void> {
    try {
      const fileData: any = {};

      // Map document types to Stripe fields
      switch (documentType) {
        case KycDocumentType.ID_FRONT:
          fileData.id_document_front = stripeFileId;
          break;
        case KycDocumentType.ID_BACK:
          fileData.id_document_back = stripeFileId;
          break;
        case KycDocumentType.PASSPORT:
          fileData.id_document = stripeFileId;
          break;
        case KycDocumentType.DRIVING_LICENSE_FRONT:
          fileData.verification_document_front = stripeFileId;
          break;
        case KycDocumentType.DRIVING_LICENSE_BACK:
          fileData.verification_document_back = stripeFileId;
          break;
        // Add other document types as needed
      }

      await this.stripe.accounts.update(stripeAccountId, {
        individual: fileData,
      });
    } catch (error) {
      this.logger.error(`Failed to create Stripe verification file:`, error);
      // Don't throw here as document is still uploaded, just verification failed
    }
  }

  /**
   * Check if document type is required
   */
  private isRequiredDocument(documentType: KycDocumentType, verificationType: KycVerificationType): boolean {
    const requiredDocuments = [
      KycDocumentType.ID_FRONT,
      KycDocumentType.ID_BACK,
      KycDocumentType.PASSPORT,
    ];

    return requiredDocuments.includes(documentType);
  }

  /**
   * Update KYC verification
   */
  async updateKycVerification(
    kycVerificationId: string,
    updateDto: UpdateKycVerificationDto
  ): Promise<KycVerification> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (kycVerification.status === KycVerificationStatus.APPROVED) {
      throw new BadRequestException('Cannot update approved verification');
    }

    try {
      const updateData: Partial<KycVerification> = {};

      // Update personal information
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

      // Update business information
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

      // Update bank information
      if (updateDto.bankInfo) {
        updateData.bankAccountNumber = updateDto.bankInfo.accountNumber;
        updateData.bankRoutingNumber = updateDto.bankInfo.routingNumber;
        updateData.bankName = updateDto.bankInfo.bankName;
        updateData.bankAccountHolderName = updateDto.bankInfo.accountHolderName;
      }

      // Update additional information
      if (updateDto.additionalInformation) {
        updateData.verificationMetadata = {
          ...kycVerification.verificationMetadata,
          additionalInformation: updateDto.additionalInformation,
        };
      }

      // Update status if submitting for review
      if (updateDto.submitForReview) {
        updateData.status = KycVerificationStatus.IN_REVIEW;
      }

      await this.kycVerificationRepository.update(kycVerificationId, updateData);

      // Sync with Stripe if account exists
      if (kycVerification.stripeAccountId) {
        await this.syncStripeAccountStatus(kycVerificationId);
      }

      return await this.kycVerificationRepository.findOne({
        where: { id: kycVerificationId }
      });
    } catch (error) {
      this.logger.error(`Failed to update KYC verification ${kycVerificationId}:`, error);
      throw new BadRequestException(`Failed to update verification: ${error.message}`);
    }
  }

  /**
   * Sync KYC verification status with Stripe account
   */
  async syncStripeAccountStatus(kycVerificationId: string): Promise<void> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification || !kycVerification.stripeAccountId) {
      return;
    }

    try {
      const account = await this.stripe.accounts.retrieve(kycVerification.stripeAccountId);

      const updateData: Partial<KycVerification> = {
        stripeRequirements: account.requirements,
        stripeCapabilities: account.capabilities,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        transfersEnabled: account.capabilities?.transfers === 'active',
      };

      // Determine status based on Stripe requirements
      if (account.requirements?.currently_due?.length === 0 &&
          account.requirements?.past_due?.length === 0) {
        updateData.status = KycVerificationStatus.APPROVED;
        updateData.verifiedAt = new Date();
      } else if (account.requirements?.currently_due?.length > 0) {
        updateData.status = KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED;
        updateData.additionalInformationRequested = account.requirements.currently_due.join(', ');
      } else if (account.requirements?.past_due?.length > 0) {
        updateData.status = KycVerificationStatus.REJECTED;
        updateData.rejectionReason = account.requirements.past_due.join(', ');
        updateData.rejectedAt = new Date();
      }

      await this.kycVerificationRepository.update(kycVerificationId, updateData);

      // Update shop status as well
      if (kycVerification.shopId) {
        await this.shopRepository.update(kycVerification.shopId, {
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
          stripeOnboardingComplete: updateData.status === KycVerificationStatus.APPROVED,
        });
      }

      this.logger.log(`Synced Stripe account status for KYC verification ${kycVerificationId}`);
    } catch (error) {
      this.logger.error(`Failed to sync Stripe account status for ${kycVerificationId}:`, error);
    }
  }

  /**
   * Get KYC verification details
   */
  async getKycVerification(kycVerificationId: string): Promise<KycVerification> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId },
      relations: ['documents', 'shop'],
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    return kycVerification;
  }

  /**
   * Get shop's KYC verifications
   */
  async getShopKycVerifications(
    shopId: string,
    status?: KycVerificationStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ verifications: KycVerification[]; total: number }> {
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

  /**
   * Create onboarding link for KYC verification
   */
  async createKycOnboardingLink(kycVerificationId: string): Promise<{ url: string }> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (!kycVerification.stripeAccountId) {
      throw new BadRequestException('No Stripe account associated with this verification');
    }

    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: kycVerification.stripeAccountId,
        refresh_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/refresh`,
        return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/shop/kyc/complete`,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (error) {
      this.logger.error(`Failed to create onboarding link for ${kycVerificationId}:`, error);
      throw new BadRequestException('Failed to create onboarding link');
    }
  }

  /**
   * Handle Stripe Connect webhooks for KYC
   */
  async handleKycWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        // TODO: These event types may not be available in Stripe webhooks
        // case 'person.verification.created':
        // case 'person.verification.updated':
        //   await this.handlePersonVerificationUpdated(event.data.object as Stripe.Person);
        //   break;
        default:
          this.logger.log(`Unhandled KYC webhook type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing KYC webhook ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle account updated webhook
   */
  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { stripeAccountId: account.id }
    });

    if (!kycVerification) {
      this.logger.warn(`No KYC verification found for Stripe account ${account.id}`);
      return;
    }

    await this.syncStripeAccountStatus(kycVerification.id);
  }

  /**
   * Handle person verification updated webhook
   */
  // TODO: Implement person verification handling when needed
  // private async handlePersonVerificationUpdated(person: Stripe.Person): Promise<void> {
  //   // Find KYC verification by person relationship
  //   // This would need more complex logic to match persons to verifications
  //   this.logger.log(`Person verification updated: ${person.id}`);
  // }

  /**
   * Submit verification for review
   */
  async submitForReview(kycVerificationId: string): Promise<void> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (kycVerification.status !== KycVerificationStatus.PENDING &&
        kycVerification.status !== KycVerificationStatus.ADDITIONAL_INFORMATION_REQUIRED) {
      throw new BadRequestException('Only pending or additional information required verifications can be submitted');
    }

    await this.kycVerificationRepository.update(kycVerificationId, {
      status: KycVerificationStatus.IN_REVIEW,
    });

    // Sync with Stripe
    await this.syncStripeAccountStatus(kycVerificationId);
  }

  /**
   * Cancel KYC verification
   */
  async cancelKycVerification(kycVerificationId: string): Promise<void> {
    const kycVerification = await this.kycVerificationRepository.findOne({
      where: { id: kycVerificationId }
    });

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found');
    }

    if (kycVerification.status === KycVerificationStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel approved verification');
    }

    await this.kycVerificationRepository.update(kycVerificationId, {
      status: KycVerificationStatus.REJECTED,
      rejectionReason: 'Cancelled by user',
      rejectedAt: new Date(),
    });
  }
}