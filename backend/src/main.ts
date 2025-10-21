import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Shopify Shop API")
    .setDescription(
      "Multi-vendor e-commerce platform API documentation - Universal Access Enabled"
    )
    .setVersion("1.0")
    .addTag("auth", "Authentication and authorization endpoints")
    .addTag("users", "User management and profile endpoints")
    .addTag("shops", "Shop management and configuration")
    .addTag("products", "Product catalog and inventory")
    .addTag("orders", "Order processing and management")
    .addTag("payments", "Payment processing with Stripe")
    .addTag("checkout", "Checkout session management")
    .addTag("shipping", "Shipping and delivery management")
    .addTag("subscriptions", "Subscription and recurring billing")
    .addTag("platform", "Platform administration")
    .addTag("health", "Health check and monitoring")
    .addServer("https://shopify-shop-api.vercel.app", "Production API server")
    .addServer("http://localhost:29000", "Development server")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Check environment for security settings
  const isProduction = process.env.NODE_ENV === 'production';

  // Enhanced Swagger UI setup with CDN fallback
  SwaggerModule.setup("api-docs", app, document, {
    customCss: `
      .topbar { display: none !important; }
      .swagger-ui .topbar { display: none !important; }
      .information-container { display: none !important; }
      .swagger-ui .info .title { color: #61dafb !important; font-size: 24px; }
      .swagger-ui .scheme-container { background: #f8f9fa !important; border-radius: 4px; }
      .swagger-ui .info { margin-bottom: 20px; }
    `,
    customSiteTitle: "Shopify Shop API Documentation",
    customfavIcon: "/favicon.ico",
    customJs: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
    customJsStr: `
      // Load Swagger UI from CDN if local assets fail
      window.onload = function() {
        if (!window.SwaggerUIBundle) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
          document.head.appendChild(script);

          const css = document.createElement('link');
          css.rel = 'stylesheet';
          css.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
          document.head.appendChild(css);
        }
      };
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: !isProduction, // Disabled for production security
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      deepLinking: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get("PORT") || 29000;

  await app.listen(port);
  console.log(`🚀 Shopify Shop API running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`
  );
  console.log(`🌐 CORS enabled for all origins - Universal access granted`);
  console.log(`🔗 Production API: https://shopify-shop-api.vercel.app/docs`);
}
bootstrap();
