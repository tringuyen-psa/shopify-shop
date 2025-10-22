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
exports.KycDocument = exports.KycDocumentStatus = exports.KycDocumentType = void 0;
const typeorm_1 = require("typeorm");
const kyc_verification_entity_1 = require("./kyc-verification.entity");
var KycDocumentType;
(function (KycDocumentType) {
    KycDocumentType["ID_FRONT"] = "id_front";
    KycDocumentType["ID_BACK"] = "id_back";
    KycDocumentType["PASSPORT"] = "passport";
    KycDocumentType["DRIVING_LICENSE_FRONT"] = "driving_license_front";
    KycDocumentType["DRIVING_LICENSE_BACK"] = "driving_license_back";
    KycDocumentType["PROOF_OF_ADDRESS"] = "proof_of_address";
    KycDocumentType["BUSINESS_REGISTRATION"] = "business_registration";
    KycDocumentType["TAX_DOCUMENT"] = "tax_document";
    KycDocumentType["BANK_STATEMENT"] = "bank_statement";
    KycDocumentType["ARTICLES_OF_ASSOCIATION"] = "articles_of_association";
    KycDocumentType["SHAREHOLDER_REGISTRY"] = "shareholder_registry";
    KycDocumentType["OWNERSHIP_DECLARATION"] = "ownership_declaration";
    KycDocumentType["ADDITIONAL_DOCUMENT"] = "additional_document";
})(KycDocumentType || (exports.KycDocumentType = KycDocumentType = {}));
var KycDocumentStatus;
(function (KycDocumentStatus) {
    KycDocumentStatus["UPLOADED"] = "uploaded";
    KycDocumentStatus["PROCESSING"] = "processing";
    KycDocumentStatus["VERIFIED"] = "verified";
    KycDocumentStatus["REJECTED"] = "rejected";
    KycDocumentStatus["EXPIRED"] = "expired";
})(KycDocumentStatus || (exports.KycDocumentStatus = KycDocumentStatus = {}));
let KycDocument = class KycDocument {
};
exports.KycDocument = KycDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "documentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycDocumentType }),
    __metadata("design:type", String)
], KycDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycDocumentStatus, default: KycDocumentStatus.UPLOADED }),
    __metadata("design:type", String)
], KycDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "originalFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], KycDocument.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "stripeFileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycDocument.prototype, "stripeVerificationDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "extractedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycDocument.prototype, "extractedFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycDocument.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], KycDocument.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycDocument.prototype, "isPrimaryDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], KycDocument.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KycDocument.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => kyc_verification_entity_1.KycVerification, kycVerification => kycVerification.documents, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'kyc_verification_id' }),
    __metadata("design:type", kyc_verification_entity_1.KycVerification)
], KycDocument.prototype, "kycVerification", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KycDocument.prototype, "kycVerificationId", void 0);
exports.KycDocument = KycDocument = __decorate([
    (0, typeorm_1.Entity)('kyc_documents')
], KycDocument);
//# sourceMappingURL=kyc-document.entity.js.map