"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShippingRateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_shipping_rate_dto_1 = require("./create-shipping-rate.dto");
class UpdateShippingRateDto extends (0, mapped_types_1.PartialType)(create_shipping_rate_dto_1.CreateShippingRateDto) {
}
exports.UpdateShippingRateDto = UpdateShippingRateDto;
//# sourceMappingURL=update-shipping-rate.dto.js.map