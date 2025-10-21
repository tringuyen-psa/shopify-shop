declare class AddressDto {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}
export declare class UpdateSubscriptionAddressDto {
    shippingAddress?: AddressDto;
}
export {};
