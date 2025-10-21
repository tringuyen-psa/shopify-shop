import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Shopify Shop API')
    .setDescription('Multi-vendor e-commerce platform API documentation')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('shops')
    .addTag('products')
    .addTag('orders')
    .addTag('payments')
    .addTag('checkout')
    .addTag('shipping')
    .addTag('subscriptions')
    .addTag('platform')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger options for better compatibility with serverless platforms
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Shopify Shop API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
    },
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap();