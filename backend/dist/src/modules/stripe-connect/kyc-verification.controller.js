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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@nestjs/common");
const stripe_connect_enhanced_service_1 = require("./stripe-connect-enhanced.service");
const shops_service_1 = require("../shops/shops.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_kyc_verification_dto_1 = require("./dto/create-kyc-verification.dto");
let KycVerificationController = class KycVerificationController {
    constructor(kycService, shopsService) {
        this.kycService = kycService;
        this.shopsService = shopsService;
    }
    async startKycVerification(req, createKycDto) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getMyKycVerifications(req, query) {
        try {
            const shops = await this.shopsService.findByOwner(req.user.id);
            if (!shops || shops.length === 0) {
                throw new common_1.BadRequestException('You do not have a shop');
            }
            const shop = shops[0];
            const { verifications, total } = await this.kycService.getShopKycVerifications(shop.id, query.status, query.page, query.limit);
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getKycVerification(verificationId, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            return {
                success: true,
                data: kycVerification,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async updateKycVerification(verificationId, updateDto, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            const updatedVerification = await this.kycService.updateKycVerification(verificationId, updateDto);
            return {
                success: true,
                data: updatedVerification,
                message: 'KYC verification updated successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async uploadDocument(verificationId, file, uploadDto, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async submitForReview(verificationId, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            await this.kycService.submitForReview(verificationId);
            return {
                success: true,
                message: 'Verification submitted for review successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async cancelVerification(verificationId, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            await this.kycService.cancelKycVerification(verificationId);
            return {
                success: true,
                message: 'Verification cancelled successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async createOnboardingLink(verificationId, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            const { url } = await this.kycService.createKycOnboardingLink(verificationId);
            return {
                success: true,
                data: { onboardingUrl: url },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async syncStatus(verificationId, req) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            const shops = await this.shopsService.findByOwner(req.user.id);
            const userShopIds = shops.map(shop => shop.id);
            if (!userShopIds.includes(kycVerification.shopId)) {
                throw new common_1.BadRequestException('Access denied');
            }
            await this.kycService.syncStripeAccountStatus(verificationId);
            const updatedVerification = await this.kycService.getKycVerification(verificationId);
            return {
                success: true,
                data: updatedVerification,
                message: 'Status synced successfully',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAllKycVerifications(query) {
        try {
            const { verifications, total } = await this.kycService.getShopKycVerifications(null, query.status, query.page, query.limit);
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
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getAnyKycVerification(verificationId) {
        try {
            const kycVerification = await this.kycService.getKycVerification(verificationId);
            return {
                success: true,
                data: kycVerification,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.KycVerificationController = KycVerificationController;
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Start KYC verification process' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verification started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shop not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_kyc_verification_dto_1.CreateKycVerificationDto]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "startKycVerification", null);
__decorate([
    (0, common_1.Get)('my-verifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user\'s KYC verifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verifications retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_kyc_verification_dto_1.KycVerificationQueryDto]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getMyKycVerifications", null);
__decorate([
    (0, common_1.Get)(':verificationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get KYC verification details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verification details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getKycVerification", null);
__decorate([
    (0, common_1.Put)(':verificationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update KYC verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verification updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_kyc_verification_dto_1.UpdateKycVerificationDto, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "updateKycVerification", null);
__decorate([
    (0, common_1.Post)(':verificationId/documents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Upload KYC document' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    (0, common_2.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_2.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_kyc_verification_dto_1.UploadKycDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)(':verificationId/submit-for-review'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit KYC verification for review' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification submitted for review successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Post)(':verificationId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel KYC verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "cancelVerification", null);
__decorate([
    (0, common_1.Post)(':verificationId/onboarding-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe onboarding link for KYC verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding link created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "createOnboardingLink", null);
__decorate([
    (0, common_1.Post)(':verificationId/sync-status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sync KYC verification status with Stripe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status synced successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "syncStatus", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all KYC verifications (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verifications retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_kyc_verification_dto_1.KycVerificationQueryDto]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getAllKycVerifications", null);
__decorate([
    (0, common_1.Get)('admin/:verificationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get any KYC verification details (admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC verification details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'KYC verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getAnyKycVerification", null);
exports.KycVerificationController = KycVerificationController = __decorate([
    (0, swagger_1.ApiTags)('kyc-verification'),
    (0, common_1.Controller)('kyc-verification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stripe_connect_enhanced_service_1.StripeConnectEnhancedService,
        shops_service_1.ShopsService])
], KycVerificationController);
//# sourceMappingURL=kyc-verification.controller.js.map