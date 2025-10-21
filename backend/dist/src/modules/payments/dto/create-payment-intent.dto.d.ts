export declare class CreatePaymentIntentDto {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
    paymentMethodId?: string;
}
