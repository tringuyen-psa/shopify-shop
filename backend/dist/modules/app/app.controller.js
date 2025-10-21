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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
let AppController = class AppController {
    constructor(configService) {
        this.configService = configService;
    }
    getRoot() {
        const currentTime = new Date().toISOString();
        const nodeEnv = this.configService.get('NODE_ENV') || 'development';
        const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        return {
            message: 'Shopify Shop API is running!',
            status: 'active',
            version: '1.0.0',
            environment: nodeEnv,
            documentation: '/docs',
            endpoints: {
                health: '/health',
                detailed_health: '/health/detailed',
                swagger_docs: '/docs',
                api_base: '/api',
                auth: {
                    login: '/api/auth/login',
                    register: '/api/auth/register',
                    refresh: '/api/auth/refresh'
                },
                shops: '/api/shops',
                products: '/api/products',
                orders: '/api/orders',
                payments: '/api/payments',
                checkout: '/api/checkout'
            },
            links: {
                swagger_ui: '/docs',
                health_check: '/health',
                github_repository: 'https://github.com/tringuyen-psa/shopify-shop'
            },
            timestamp: currentTime,
            supported_methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
        };
    }
    getApiInfo() {
        const currentTime = new Date().toISOString();
        const nodeEnv = this.configService.get('NODE_ENV') || 'development';
        return {
            name: 'Shopify Shop API',
            description: 'Multi-vendor e-commerce platform API',
            version: '1.0.0',
            environment: nodeEnv,
            status: 'active',
            documentation: '/docs',
            base_path: '/api',
            timestamp: currentTime,
            message: 'Use /docs for interactive API documentation'
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'API Root Endpoint',
        description: 'Check if the API is running and get basic information'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API is running successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Shopify Shop API is running!' },
                status: { type: 'string', example: 'active' },
                version: { type: 'string', example: '1.0.0' },
                environment: { type: 'string', example: 'production' },
                documentation: { type: 'string', example: '/docs' },
                endpoints: {
                    type: 'object',
                    properties: {
                        health: { type: 'string', example: '/health' },
                        detailed_health: { type: 'string', example: '/health/detailed' },
                        swagger_docs: { type: 'string', example: '/docs' },
                        api_base: { type: 'string', example: '/api' }
                    }
                },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('api'),
    (0, swagger_1.ApiOperation)({
        summary: 'API Information Endpoint',
        description: 'Get API information and available endpoints'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API information retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getApiInfo", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('app'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppController);
//# sourceMappingURL=app.controller.js.map