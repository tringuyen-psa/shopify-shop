"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShippingZoneDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_shipping_zone_dto_1 = require("./create-shipping-zone.dto");
class UpdateShippingZoneDto extends (0, mapped_types_1.PartialType)(create_shipping_zone_dto_1.CreateShippingZoneDto) {
}
exports.UpdateShippingZoneDto = UpdateShippingZoneDto;
//# sourceMappingURL=update-shipping-zone.dto.js.map