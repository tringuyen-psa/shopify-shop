declare class ShippingAddressDto {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}
export declare class SaveInformationDto {
    email: string;
    name: string;
    phone?: string;
    shippingAddress: ShippingAddressDto;
    note?: string;
}
export {};
