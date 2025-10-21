import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
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
      database: 'connected', // In a real app, you would check actual DB connection
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check endpoint' })
  @ApiResponse({
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
  })
  getDetailedHealth() {
    const currentTime = new Date().toISOString();
    const nodeEnv = this.configService.get('NODE_ENV') || 'development';
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    // Convert bytes to MB
    const formatMemory = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

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
        database: 'connected', // Check actual DB connection in real app
        stripe: this.configService.get('STRIPE_SECRET_KEY') ? 'configured' : 'not configured',
        email: this.configService.get('SMTP_USER') ? 'configured' : 'not configured',
      },
    };
  }
}