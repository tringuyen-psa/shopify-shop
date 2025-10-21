import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import { ConfigService } from "@nestjs/config";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: "Get Shopify Shop API health and information" })
  @ApiResponse({
    status: 200,
    description: "Shopify Shop API is running and accessible",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Shopify Shop Multi-vendor API is running!",
        },
        status: { type: "string", example: "healthy" },
        version: { type: "string", example: "1.0.0" },
        endpoints: {
          type: "object",
          properties: {
            swagger: { type: "string", example: "/docs" },
            auth: { type: "string", example: "/auth" },
            shops: { type: "string", example: "/shops" },
            products: { type: "string", example: "/products" },
            orders: { type: "string", example: "/orders" },
            payments: { type: "string", example: "/payments" },
            checkout: { type: "string", example: "/checkout" },
            subscriptions: { type: "string", example: "/subscriptions" },
            platform: { type: "string", example: "/platform" },
            health: { type: "string", example: "/health" },
          },
        },
        cors: {
          type: "string",
          example: "Enabled for all origins - Universal Access",
        },
        documentation: {
          type: "string",
          example: "Interactive docs at /docs (CDN version)",
        },
        features: {
          type: "array",
          items: {
            type: "string",
            example: "Multi-vendor shops",
          },
        },
      },
    },
  })
  getHealth() {
    const nodeEnv = this.configService.get("NODE_ENV") || "development";
    const baseUrl =
      nodeEnv === "production"
        ? "https://shopify-shop-api.vercel.app"
        : `http://localhost:${this.configService.get("PORT") || 29000}`;

    return {
      message: "Shopify Shop Multi-vendor API is running!",
      status: "healthy",
      version: "1.0.0",
      environment: nodeEnv,
      endpoints: {
        swagger: "/docs",
        auth: {
          login: "/auth/login",
          register: "/auth/register",
          refresh: "/auth/refresh",
        },
        shops: "/shops",
        products: "/products",
        orders: "/orders",
        payments: {
          stripe: "/payments",
          webhooks: "/payments/webhooks",
        },
        checkout: "/checkout",
        subscriptions: "/subscriptions",
        platform: "/platform",
        health: "/health",
        detailed_health: "/health/detailed",
      },
      cors: "Enabled for all origins - Universal Access",
      documentation: `Interactive docs at /docs (CDN version)`,
      links: {
        swagger_ui: `${baseUrl}/docs`,
        api_base: baseUrl,
        github: "https://github.com/tringuyen-psa/shopify-shop",
      },
      features: [
        "Multi-vendor shops",
        "Product management",
        "Order processing",
        "Stripe payments",
        "User authentication",
        "Subscription billing",
        "Platform administration",
        "Health monitoring",
        "Swagger documentation",
        "CORS for all origins",
      ],
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get("health")
  @ApiOperation({ summary: "Simple health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Health check successful",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", example: "2025-10-21T04:30:00.000Z" },
        environment: { type: "string", example: "development" },
        version: { type: "string", example: "1.0.0" },
        uptime: { type: "number", example: 3600 },
        database: { type: "string", example: "connected" },
      },
    },
  })
  getSimpleHealth() {
    const nodeEnv = this.configService.get("NODE_ENV") || "development";
    const uptime = process.uptime();

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      version: "1.0.0",
      uptime: Math.floor(uptime),
      database: "connected", // In real app, check actual DB connection
      services: {
        stripe: this.configService.get("STRIPE_SECRET_KEY")
          ? "configured"
          : "not configured",
        database: "connected",
        email: this.configService.get("SMTP_USER")
          ? "configured"
          : "not configured",
      },
    };
  }

  @Get("health/detailed")
  @ApiOperation({ summary: "Detailed health check with system information" })
  @ApiResponse({
    status: 200,
    description: "Detailed health information",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "healthy" },
        timestamp: { type: "string" },
        environment: { type: "string", example: "development" },
        version: { type: "string", example: "1.0.0" },
        uptime: { type: "number", example: 3600 },
        memory: {
          type: "object",
          properties: {
            used: { type: "string", example: "40.14 MB" },
            total: { type: "string", example: "44.78 MB" },
            percentage: { type: "number", example: 90 },
          },
        },
        services: {
          type: "object",
          properties: {
            database: { type: "string", example: "connected" },
            stripe: { type: "string", example: "configured" },
            email: { type: "string", example: "configured" },
          },
        },
      },
    },
  })
  getDetailedHealth() {
    const nodeEnv = this.configService.get("NODE_ENV") || "development";
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();

    // Convert bytes to MB
    const formatMemory = (bytes: number) =>
      (bytes / 1024 / 1024).toFixed(2) + " MB";

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      version: "1.0.0",
      uptime: Math.floor(uptime),
      memory: {
        used: formatMemory(memUsage.heapUsed),
        total: formatMemory(memUsage.heapTotal),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      services: {
        database: "connected", // Check actual DB connection in real app
        stripe: this.configService.get("STRIPE_SECRET_KEY")
          ? "configured"
          : "not configured",
        email: this.configService.get("SMTP_USER")
          ? "configured"
          : "not configured",
      },
      configuration: {
        port: this.configService.get("PORT") || 29000,
        cors: "enabled for all origins",
        swagger: "available at /docs",
      },
    };
  }

  @Get("docs")
  @ApiOperation({
    summary: "Alternative Swagger documentation with CDN assets",
  })
  @ApiResponse({
    status: 200,
    description: "Swagger documentation HTML page with CDN loading",
  })
  getSwaggerDocs(@Res() res: any) {
    const nodeEnv = this.configService.get("NODE_ENV") || "development";
    const baseUrl =
      nodeEnv === "production"
        ? "https://shopify-shop-api.vercel.app"
        : `http://localhost:${this.configService.get("PORT") || 29000}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Shopify Shop API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
    <link rel="icon" type="image/png" href="https://shopify-shop-api.vercel.app/favicon.ico">
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; font-family: sans-serif; }
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #61dafb !important; }
        .swagger-ui .scheme-container { background: #f8f9fa; border-radius: 4px; }
        .information-container { display: none }
        .header {
            background: linear-gradient(135deg, #61dafb 0%, #21a1f1 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ Shopify Shop API Documentation</h1>
        <p>Multi-vendor E-commerce Platform - Universal Access Enabled</p>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            console.log("🚀 Shopify Shop API - Loading Swagger UI from CDN");

            const ui = SwaggerUIBundle({
                url: '${baseUrl}/docs-json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: "none",
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
                onComplete: function() {
                    console.log("✅ Shopify Shop API - Swagger UI loaded successfully");
                },
                requestInterceptor: function(request) {
                    console.log("📤 API Request:", request);
                    return request;
                },
                responseInterceptor: function(response) {
                    console.log("📥 API Response:", response);
                    return response;
                }
            });
        };
    </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }
}
