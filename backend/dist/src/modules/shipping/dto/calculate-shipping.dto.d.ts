export declare class CalculateShippingDto {
    shopId?: string;
    productId: string;
    quantity: number;
    weight?: number;
    orderAmount?: number;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    items?: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}
