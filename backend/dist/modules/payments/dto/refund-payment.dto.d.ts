export declare enum RefundReason {
    DUPLICATE = "duplicate",
    FRAUDULENT = "fraudulent",
    REQUESTED_BY_CUSTOMER = "requested_by_customer"
}
export declare class RefundPaymentDto {
    paymentIntentId: string;
    amount?: number;
    reason?: RefundReason;
}
