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
        .addServer("https://shopify-shop-api.vercel.app/", "Production server")
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
        customCss: ".swagger-ui .topbar { display: none }",
        customfavIcon: "/favicon.ico",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            docExpansion: "none",
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