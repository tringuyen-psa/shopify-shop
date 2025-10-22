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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerification = exports.KycBusinessType = exports.KycVerificationType = exports.KycVerificationStatus = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const kyc_document_entity_1 = require("./kyc-document.entity");
var KycVerificationStatus;
(function (KycVerificationStatus) {
    KycVerificationStatus["PENDING"] = "pending";
    KycVerificationStatus["IN_REVIEW"] = "in_review";
    KycVerificationStatus["ADDITIONAL_INFORMATION_REQUIRED"] = "additional_information_required";
    KycVerificationStatus["APPROVED"] = "approved";
    KycVerificationStatus["REJECTED"] = "rejected";
    KycVerificationStatus["RESTRICTED"] = "restricted";
})(KycVerificationStatus || (exports.KycVerificationStatus = KycVerificationStatus = {}));
var KycVerificationType;
(function (KycVerificationType) {
    KycVerificationType["INDIVIDUAL"] = "individual";
    KycVerificationType["COMPANY"] = "company";
})(KycVerificationType || (exports.KycVerificationType = KycVerificationType = {}));
var KycBusinessType;
(function (KycBusinessType) {
    KycBusinessType["INDIVIDUAL"] = "individual";
    KycBusinessType["COMPANY"] = "company";
    KycBusinessType["NON_PROFIT"] = "non_profit";
    KycBusinessType["GOVERNMENT_ENTITY"] = "government_entity";
})(KycBusinessType || (exports.KycBusinessType = KycBusinessType = {}));
let KycVerification = class KycVerification {
};
exports.KycVerification = KycVerification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycVerification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "verificationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycVerificationType, default: KycVerificationType.INDIVIDUAL }),
    __metadata("design:type", String)
], KycVerification.prototype, "verificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycBusinessType, default: KycBusinessType.INDIVIDUAL }),
    __metadata("design:type", String)
], KycVerification.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycVerificationStatus, default: KycVerificationStatus.PENDING }),
    __metadata("design:type", String)
], KycVerification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "stripeAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycVerification.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "idNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "taxId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycVerification.prototype, "businessEstablishedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "bankRoutingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "bankAccountHolderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycVerification.prototype, "stripeRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycVerification.prototype, "stripeCapabilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycVerification.prototype, "stripeRestrictions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycVerification.prototype, "additionalInformationRequested", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycVerification.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycVerification.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycVerification.prototype, "restrictedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "chargesEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "payoutsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "transfersEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "identityVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "addressVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "bankAccountVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycVerification.prototype, "businessVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycVerification.prototype, "verificationMetadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KycVerification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KycVerification.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, shop => shop.kycVerifications, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'shop_id' }),
    __metadata("design:type", shop_entity_1.Shop)
], KycVerification.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KycVerification.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => kyc_document_entity_1.KycDocument, document => document.kycVerification),
    __metadata("design:type", Array)
], KycVerification.prototype, "documents", void 0);
exports.KycVerification = KycVerification = __decorate([
    (0, typeorm_1.Entity)('kyc_verifications')
], KycVerification);
//# sourceMappingURL=kyc-verification.entity.js.map