import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
interface FindAllParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ShopsService {
    private shopRepository;
    constructor(shopRepository: Repository<Shop>);
    findById(id: string): Promise<Shop>;
    findBySlug(slug: string): Promise<Shop>;
    findProductsBySlug(slug: string): Promise<any[]>;
    findByUserId(userId: string): Promise<Shop>;
    findByOwner(userId: string): Promise<Shop[]>;
    create(shopData: Partial<Shop>, userId: string): Promise<Shop>;
    private generateSlugFromName;
    private generateSlugFromId;
    update(id: string, shopData: Partial<Shop>): Promise<Shop>;
    findAll(params?: FindAllParams): Promise<{
        shops: Shop[];
        total: number;
        page: number;
        limit: number;
    }>;
    remove(id: string): Promise<void>;
    updateSubscriptionPlan(shopId: string, planData: {
        plan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus';
        price: number;
        period: string;
        stripeSubscriptionId?: string;
    }): Promise<Shop>;
    cancelSubscription(shopId: string): Promise<Shop>;
    getSubscriptionPlans(): Promise<any[]>;
    findByStripeAccountId(stripeAccountId: string): Promise<Shop>;
    stripeOnboardingComplete(shopId: string): Promise<Shop>;
}
export {};
