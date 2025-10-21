export declare class CreateOrderDto {
    checkoutSessionId: string;
    shopId: string;
    productId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    shippingAddressLine1: string;
    shippingAddressLine2?: string;
    shippingCity: string;
    shippingState: string;
    shippingCountry: string;
    shippingPostalCode: string;
    productPrice: number;
    totalAmount: number;
    platformFeePercent: number;
    shippingCost?: number;
    billingCycle?: string;
    paymentMethod?: string;
    paymentIntentId?: string;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    customerNote?: string;
    paidAt?: string;
    items?: {
        productId: string;
        productName: string;
        productPrice: number;
        quantity: number;
        totalPrice: number;
    }[];
}
