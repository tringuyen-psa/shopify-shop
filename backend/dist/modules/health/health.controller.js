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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    constructor(configService) {
        this.configService = configService;
    }
    getHealth() {
        const currentTime = new Date().toISOString();
        const nodeEnv = this.configService.get('NODE_ENV') || 'development';
        const uptime = process.uptime();
        return {
            status: 'ok',
            timestamp: currentTime,
            environment: nodeEnv,
            version: '1.0.0',
            uptime: Math.floor(uptime),
            database: 'connected',
        };
    }
    getDetailedHealth() {
        const currentTime = new Date().toISOString();
        const nodeEnv = this.configService.get('NODE_ENV') || 'development';
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();
        const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
        return {
            status: 'ok',
            timestamp: currentTime,
            environment: nodeEnv,
            version: '1.0.0',
            uptime: Math.floor(uptime),
            memory: {
                used: formatMemory(memUsage.heapUsed),
                total: formatMemory(memUsage.heapTotal),
                percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
            },
            services: {
                database: 'connected',
                stripe: this.configService.get('STRIPE_SECRET_KEY') ? 'configured' : 'not configured',
                email: this.configService.get('SMTP_USER') ? 'configured' : 'not configured',
            },
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                environment: { type: 'string', example: 'production' },
                version: { type: 'string', example: '1.0.0' },
                uptime: { type: 'number', example: 3600 },
                database: { type: 'string', example: 'connected' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed health check endpoint' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed service health information',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string' },
                environment: { type: 'string' },
                version: { type: 'string' },
                uptime: { type: 'number' },
                memory: {
                    type: 'object',
                    properties: {
                        used: { type: 'string' },
                        total: { type: 'string' },
                        percentage: { type: 'number' }
                    }
                },
                services: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', example: 'connected' },
                        stripe: { type: 'string', example: 'configured' },
                        email: { type: 'string', example: 'configured' }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getDetailedHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map