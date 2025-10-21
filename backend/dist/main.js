"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: "*",
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Shopify Shop API")
        .setDescription("Multi-vendor e-commerce platform API documentation - Universal Access Enabled")
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document, {
        customCss: `
      .topbar { display: none }
      .swagger-ui .topbar { display: none }
      .information-container { display: none }
      .swagger-ui .info .title { color: #61dafb; font-size: 24px; }
      .swagger-ui .scheme-container { background: #f8f9fa; border-radius: 4px; }
    `,
        customSiteTitle: "Shopify Shop API Documentation",
        customfavIcon: "/favicon.ico",
        customJs: "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        customJsStr: `
      // Load Swagger UI from CDN if local assets fail
      window.onload = function() {
        console.log("🚀 Shopify Shop API - Swagger UI loading with CDN fallback");
        if (!window.SwaggerUIBundle) {
          console.log("🔄 Loading Swagger UI from backup CDN");
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
            docExpansion: "none",
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
            supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
            deepLinking: true,
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            onComplete: function () {
                console.log("✅ Shopify Shop API - Swagger UI loaded successfully");
            },
            requestInterceptor: function (request) {
                console.log("📤 API Request:", request);
                return request;
            },
            responseInterceptor: function (response) {
                console.log("📥 API Response:", response);
                return response;
            },
        },
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT") || 29000;
    await app.listen(port);
    console.log(`🚀 Shopify Shop API running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
    console.log(`🌐 CORS enabled for all origins - Universal access granted`);
    console.log(`🔗 Production API: https://shopify-shop-api.vercel.app/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map