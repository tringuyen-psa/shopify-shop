"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConnectModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const stripe_connect_controller_1 = require("./stripe-connect.controller");
const stripe_connect_service_1 = require("./stripe-connect.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const shops_module_1 = require("../shops/shops.module");
let StripeConnectModule = class StripeConnectModule {
};
exports.StripeConnectModule = StripeConnectModule;
exports.StripeConnectModule = StripeConnectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.Shop]),
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => shops_module_1.ShopsModule),
        ],
        controllers: [stripe_connect_controller_1.StripeConnectController],
        providers: [stripe_connect_service_1.StripeConnectService],
        exports: [stripe_connect_service_1.StripeConnectService],
    })
], StripeConnectModule);
//# sourceMappingURL=stripe-connect.module.js.map