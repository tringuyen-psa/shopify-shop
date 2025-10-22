import { ShopsService } from './shops.service';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { StripeConnectService } from '../stripe-connect/stripe-connect.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
export declare class ShopsController {
    private readonly shopsService;
    private readonly productsService;
    private readonly paymentsService;
    private readonly stripeConnectService;
    constructor(shopsService: ShopsService, productsService: ProductsService, paymentsService: PaymentsService, stripeConnectService: StripeConnectService);
    create(createShopDto: CreateShopDto, req: any): Promise<import("./entities/shop.entity").Shop>;
    getMyShops(req: any): Promise<import("./entities/shop.entity").Shop[]>;
    findAll(query: any): Promise<{
        shops: import("./entities/shop.entity").Shop[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBySlug(slug: string): Promise<import("./entities/shop.entity").Shop>;
    findProductsBySlug(slug: string): Promise<any[]>;
    findProductsById(id: string): Promise<import("../products/entities/product.entity").Product[]>;
    createProduct(shopId: string, createProductDto: CreateProductDto, req: any): Promise<import("../products/entities/product.entity").Product>;
    findOne(id: string): Promise<import("./entities/shop.entity").Shop>;
    update(id: string, updateShopDto: UpdateShopDto, req: any): Promise<import("./entities/shop.entity").Shop>;
    remove(id: string, req: any): Promise<void>;
    subscribe(id: string, updateSubscriptionDto: UpdateSubscriptionDto, req: any): Promise<import("./entities/shop.entity").Shop>;
    startOnboarding(shopId: string, req: any): Promise<{
        message: string;
        onboardingUrl: string;
        accountId: string;
    }>;
}
