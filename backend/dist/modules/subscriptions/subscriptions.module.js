"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const product_entity_1 = require("../products/entities/product.entity");
const subscriptions_service_1 = require("./subscriptions.service");
const subscriptions_controller_1 = require("./subscriptions.controller");
let SubscriptionsModule = class SubscriptionsModule {
};
exports.SubscriptionsModule = SubscriptionsModule;
exports.SubscriptionsModule = SubscriptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                subscription_entity_1.Subscription,
                order_entity_1.Order,
                user_entity_1.User,
                shop_entity_1.Shop,
                product_entity_1.Product,
            ]),
        ],
        controllers: [subscriptions_controller_1.SubscriptionsController],
        providers: [subscriptions_service_1.SubscriptionsService],
        exports: [subscriptions_service_1.SubscriptionsService],
    })
], SubscriptionsModule);
//# sourceMappingURL=subscriptions.module.js.map