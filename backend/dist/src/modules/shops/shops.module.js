"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const shop_entity_1 = require("./entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const shops_service_1 = require("./shops.service");
const shops_controller_1 = require("./shops.controller");
const products_module_1 = require("../products/products.module");
const payments_module_1 = require("../payments/payments.module");
const stripe_connect_module_1 = require("../stripe-connect/stripe-connect.module");
let ShopsModule = class ShopsModule {
};
exports.ShopsModule = ShopsModule;
exports.ShopsModule = ShopsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.Shop, user_entity_1.User, product_entity_1.Product]),
            (0, common_1.forwardRef)(() => products_module_1.ProductsModule),
            payments_module_1.PaymentsModule,
            stripe_connect_module_1.StripeConnectModule,
        ],
        controllers: [shops_controller_1.ShopsController],
        providers: [shops_service_1.ShopsService],
        exports: [shops_service_1.ShopsService],
    })
], ShopsModule);
//# sourceMappingURL=shops.module.js.map