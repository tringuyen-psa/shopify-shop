export declare class UpdateSubscriptionDto {
    plan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus';
    price: number;
    period: string;
    stripeSubscriptionId?: string;
}
