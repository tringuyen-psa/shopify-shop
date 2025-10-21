import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private configService;
    constructor(configService: ConfigService);
    getHealth(): {
        status: string;
        timestamp: string;
        environment: any;
        version: string;
        uptime: number;
        database: string;
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
        services: {
            database: string;
            stripe: string;
            email: string;
        };
    };
}
