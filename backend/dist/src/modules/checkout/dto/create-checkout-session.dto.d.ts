export declare class CreateCheckoutSessionDto {
    productId: string;
    billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
    quantity?: number;
}
