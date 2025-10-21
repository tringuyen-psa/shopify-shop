import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private configService;
    constructor(configService: ConfigService);
    getHealth(): {
        message: string;
        status: string;
        version: string;
        environment: any;
        endpoints: {
            swagger: string;
            auth: {
                login: string;
                register: string;
                refresh: string;
            };
            shops: string;
            products: string;
            orders: string;
            payments: {
                stripe: string;
                webhooks: string;
            };
            checkout: string;
            subscriptions: string;
            platform: string;
            health: string;
            detailed_health: string;
        };
        cors: string;
        documentation: string;
        links: {
            swagger_ui: string;
            api_base: string;
            github: string;
        };
        features: string[];
        timestamp: string;
        uptime: number;
    };
    getSimpleHealth(): {
        status: string;
        timestamp: string;
        environment: any;
        version: string;
        uptime: number;
        database: string;
        services: {
            stripe: string;
            database: string;
            email: string;
        };
    };
    getDetailedHealth(): {
        status: string;
        timestamp: string;
        environment: any;
        version: string;
        uptime: number;
        memory: {
            used: string;
            total: string;
            percentage: number;
        };
        node: {
            version: string;
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
        };
        services: {
            database: string;
            stripe: string;
            email: string;
        };
        configuration: {
            port: any;
            cors: string;
            swagger: string;
        };
    };
    getSwaggerDocs(res: any): void;
}
