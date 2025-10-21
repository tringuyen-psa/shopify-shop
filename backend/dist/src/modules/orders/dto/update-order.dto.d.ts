export declare enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum FulfillmentStatus {
    UNFULFILLED = "unfulfilled",
    FULFILLED = "fulfilled",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class UpdateOrderDto {
    fulfillmentStatus?: FulfillmentStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    customerNote?: string;
    internalNote?: string;
}
