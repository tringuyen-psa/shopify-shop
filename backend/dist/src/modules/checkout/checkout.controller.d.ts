import { CheckoutService } from './checkout.service';
import { OrdersService } from '../orders/orders.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SaveInformationDto } from './dto/save-information.dto';
import { SelectShippingDto } from './dto/select-shipping.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
export declare class CheckoutController {
    private readonly checkoutService;
    private readonly ordersService;
    constructor(checkoutService: CheckoutService, ordersService: OrdersService);
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
            shippingCost: any;
            totalAmount: any;
            nextStep: number;
        };
    }>;
    createPayment(sessionId: string, createPaymentDto: CreatePaymentDto): Promise<{
        success: boolean;
        data: {
            stripeCheckoutUrl: string;
            paymentMethod: "stripe_popup";
            sessionId: string;
        };
    }>;
    createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
        success: boolean;
        data: {
            clientSecret: string;
            paymentIntentId: string;
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
            status: "pending" | "processing" | "completed" | "expired" | "abandoned";
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
                stripeAccountId: string;
            };
            billing: {
                cycle: "one_time" | "weekly" | "monthly" | "yearly";
            };
            currentStep: number;
            expiresAt: Date;
            stripeAccountId: string;
        };
    }>;
    updateSessionStatus(body: {
        sessionId: string;
        status: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSessionByStripeId(body: {
        stripeSessionId: string;
        status: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
