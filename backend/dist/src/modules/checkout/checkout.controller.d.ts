import { CheckoutService } from './checkout.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SaveInformationDto } from './dto/save-information.dto';
import { SelectShippingDto } from './dto/select-shipping.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
    createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto): Promise<{
        success: boolean;
        data: {
            sessionId: string;
            checkoutUrl: string;
            expiresAt: Date;
        };
    }>;
    getCheckoutSession(sessionId: string): Promise<{
        success: boolean;
        data: import("./entities/checkout-session.entity").CheckoutSession;
    }>;
    saveInformation(sessionId: string, saveInformationDto: SaveInformationDto): Promise<{
        success: boolean;
        data: {
            nextStep: number;
            requiresShipping: boolean;
        };
    }>;
    selectShipping(sessionId: string, selectShippingDto: SelectShippingDto): Promise<{
        success: boolean;
        data: {
            shippingCost: number;
            totalAmount: number;
            nextStep: number;
        };
    }>;
    createPayment(sessionId: string, createPaymentDto: CreatePaymentDto): Promise<{
        success: boolean;
        data: {
            stripeCheckoutUrl: string;
            paymentMethod: "stripe";
        };
    }>;
    getCheckoutSummary(sessionId: string): Promise<{
        success: boolean;
        data: {
            sessionId: string;
            product: {
                id: string;
                name: string;
                description: string;
                images: string[];
                price: number;
                requiresShipping: boolean;
            };
            shop: {
                id: string;
                name: string;
                slug: string;
                logo: string;
            };
            customer: {
                email: string;
                name: string;
                phone: string;
            };
            shipping: {
                method: string;
                cost: number;
                deliveryTime: string;
            };
            pricing: {
                productPrice: number;
                shippingCost: number;
                totalAmount: number;
                discountAmount: number;
            };
            billing: {
                cycle: "one_time" | "weekly" | "monthly" | "yearly";
            };
            status: "pending" | "completed" | "expired" | "abandoned";
            currentStep: number;
            expiresAt: Date;
        };
    }>;
    expireSession(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPublicCheckoutData(sessionId: string): Promise<{
        success: boolean;
        data: {
            sessionId: string;
            product: {
                id: string;
                name: string;
                description: string;
                images: string[];
                price: number;
                requiresShipping: boolean;
                type: "physical" | "digital";
            };
            shop: {
                name: string;
                slug: string;
                logo: string;
            };
            billing: {
                cycle: "one_time" | "weekly" | "monthly" | "yearly";
            };
            currentStep: number;
            expiresAt: Date;
        };
    }>;
}
