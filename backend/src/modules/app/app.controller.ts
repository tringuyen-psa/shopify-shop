import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({
    summary: 'API Root Endpoint',
    description: 'Check if the API is running and get basic information'
  })
  @ApiResponse({
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
  })
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

  @Get('api')
  @ApiOperation({
    summary: 'API Information Endpoint',
    description: 'Get API information and available endpoints'
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully'
  })
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
}