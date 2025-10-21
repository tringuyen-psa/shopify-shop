export declare class CreateSubscriptionDto {
    productId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    billingCycle?: string;
    paymentMethodId?: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingCity?: string;
    shippingState?: string;
    shippingCountry?: string;
    shippingPostalCode?: string;
    platformFee?: number;
    shopRevenue?: number;
    shippingCost?: number;
    orderId?: string;
    shopId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    amount?: number;
}
