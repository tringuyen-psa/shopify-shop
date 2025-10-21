import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
export declare class ShopsController {
    private readonly shopsService;
    constructor(shopsService: ShopsService);
    create(createShopDto: CreateShopDto, req: any): Promise<import("./entities/shop.entity").Shop>;
    findAll(): Promise<import("./entities/shop.entity").Shop[]>;
    findBySlug(slug: string): Promise<import("./entities/shop.entity").Shop>;
    findOne(id: string): Promise<import("./entities/shop.entity").Shop>;
    update(id: string, updateShopDto: UpdateShopDto): Promise<import("./entities/shop.entity").Shop>;
    startOnboarding(_id: string): {
        message: string;
    };
    getConnectStatus(_id: string): {
        message: string;
    };
    refreshOnboardingLink(_id: string): {
        message: string;
    };
    getStripeDashboard(_id: string): {
        message: string;
    };
}
