export declare class CreatePaymentIntentDto {
    sessionId: string;
    paymentMethodId: string;
    amount: number;
    stripeAccountId?: string;
}
