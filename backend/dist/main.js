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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("docs", app, document, {
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
            onComplete: function () {
                console.log("Swagger UI loaded successfully");
            },
            requestInterceptor: function (request) {
                console.log("Request sent:", request);
                return request;
            },
            responseInterceptor: function (response) {
                console.log("Response received:", response);
                return response;
            }
        },
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get("PORT") || 3001;
    await app.listen(port);
    console.log(`🚀 Backend running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map