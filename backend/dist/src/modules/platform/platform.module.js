"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_setting_entity_1 = require("./entities/platform-setting.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const subscription_entity_1 = require("../subscriptions/entities/subscription.entity");
const shops_module_1 = require("../shops/shops.module");
const users_module_1 = require("../users/users.module");
const orders_module_1 = require("../orders/orders.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const platform_service_1 = require("./platform.service");
const platform_controller_1 = require("./platform.controller");
let PlatformModule = class PlatformModule {
};
exports.PlatformModule = PlatformModule;
exports.PlatformModule = PlatformModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([platform_setting_entity_1.PlatformSetting, shop_entity_1.Shop, user_entity_1.User, order_entity_1.Order, subscription_entity_1.Subscription]),
            shops_module_1.ShopsModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            subscriptions_module_1.SubscriptionsModule
        ],
        controllers: [platform_controller_1.PlatformController],
        providers: [platform_service_1.PlatformService],
        exports: [platform_service_1.PlatformService],
    })
], PlatformModule);
//# sourceMappingURL=platform.module.js.map