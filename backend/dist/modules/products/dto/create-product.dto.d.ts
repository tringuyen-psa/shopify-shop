export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    compareAtPrice?: number;
    weeklyPrice?: number;
    monthlyPrice?: number;
    yearlyPrice?: number;
    productType: 'physical' | 'digital';
    weight?: number;
    requiresShipping?: boolean;
    downloadUrl?: string;
    downloadLimit?: number;
    trackInventory?: boolean;
    inventoryQuantity?: number;
    allowBackorder?: boolean;
    images?: string[];
    category?: string;
    tags?: string[];
    isSubscription?: boolean;
    trialDays?: number;
    features?: string[];
}
