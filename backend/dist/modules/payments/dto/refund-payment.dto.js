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
exports.RefundPaymentDto = exports.RefundReason = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RefundReason;
(function (RefundReason) {
    RefundReason["DUPLICATE"] = "duplicate";
    RefundReason["FRAUDULENT"] = "fraudulent";
    RefundReason["REQUESTED_BY_CUSTOMER"] = "requested_by_customer";
})(RefundReason || (exports.RefundReason = RefundReason = {}));
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment Intent ID to refund', example: 'pi_1234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Refund amount (in currency units)', example: 29.99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], RefundPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Refund reason',
        enum: RefundReason,
        example: RefundReason.REQUESTED_BY_CUSTOMER,
    }),
    (0, class_validator_1.IsEnum)(RefundReason),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "reason", void 0);
//# sourceMappingURL=refund-payment.dto.js.map