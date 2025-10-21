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

  // Configure Swagger UI - CDN setup for Vercel compatibility
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Shopify Shop API Documentation",
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #61dafb; font-size: 24px; }
      .swagger-ui .scheme-container { background: #f8f9fa; }
    `,
    customJs: "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-bundle.js",
    customCssUrl: "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui.css",
    customJsStr: `
      // Fallback loading if CDN fails
      window.onload = function() {
        console.log("Swagger UI loading with CDN fallback");
        if (!window.SwaggerUIBundle) {
          console.log("Loading Swagger UI from backup CDN");
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
          document.head.appendChild(script);

          const css = document.createElement('link');
          css.rel = 'stylesheet';
          css.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
          document.head.appendChild(css);
        }
      };
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
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      onComplete: function() {
        console.log("Swagger UI loaded successfully");
      },
      requestInterceptor: function(request: any) {
        console.log("Request sent:", request);
        return request;
      },
      responseInterceptor: function(response: any) {
        console.log("Response received:", response);
        return response;
      }
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
