export declare class CreateShippingRateDto {
    name: string;
    description?: string;
    price: number;
    minOrderAmount?: number;
    maxWeight?: number;
    minDeliveryDays?: number;
    maxDeliveryDays?: number;
    isActive?: boolean;
}
