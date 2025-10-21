import { ConfigService } from '@nestjs/config';
export declare class AppController {
    private configService;
    constructor(configService: ConfigService);
    getRoot(): {
        message: string;
        status: string;
        version: string;
        environment: any;
        documentation: string;
        endpoints: {
            health: string;
            detailed_health: string;
            swagger_docs: string;
            api_base: string;
            auth: {
                login: string;
                register: string;
                refresh: string;
            };
            shops: string;
            products: string;
            orders: string;
            payments: string;
            checkout: string;
        };
        links: {
            swagger_ui: string;
            health_check: string;
            github_repository: string;
        };
        timestamp: string;
        supported_methods: string[];
    };
    getApiInfo(): {
        name: string;
        description: string;
        version: string;
        environment: any;
        status: string;
        documentation: string;
        base_path: string;
        timestamp: string;
        message: string;
    };
}
