import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for API routes - removed as user wants direct routes
  // app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: "*", // Allow all origins - AI, frontend, any client
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Shopify Shop API")
    .setDescription("Multi-vendor e-commerce platform API documentation")
    .setVersion("1.0")
    .addServer("http://localhost:29000", "Development server")
    .addServer("https://shopify-shop-api.vercel.app", "Production server")
    .addTag("auth")
    .addTag("users")
    .addTag("shops")
    .addTag("products")
    .addTag("orders")
    .addTag("payments")
    .addTag("checkout")
    .addTag("shipping")
    .addTag("subscriptions")
    .addTag("platform")
    .addTag("health")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configure Swagger UI - Simple setup for localhost and production
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Shopify Shop API Documentation",
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #61dafb; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "list",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      deepLinking: true,
    },
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get("PORT") || 3001;

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at http://localhost:${port}/docs`
  );
}
bootstrap();
