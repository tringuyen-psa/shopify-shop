import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CheckoutSession } from './entities/checkout-session.entity';
import { ProductsService } from '../products/products.service';
import { ShippingService } from '../shipping/shipping.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SaveInformationDto } from './dto/save-information.dto';
import { SelectShippingDto } from './dto/select-shipping.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class CheckoutService {
    private readonly checkoutSessionRepository;
    private readonly productsService;
    private readonly shippingService;
    private readonly configService;
    constructor(checkoutSessionRepository: Repository<CheckoutSession>, productsService: ProductsService, shippingService: ShippingService, configService: ConfigService);
    createSession(createCheckoutSessionDto: CreateCheckoutSessionDto): Promise<{
        sessionId: string;
        checkoutUrl: string;
        expiresAt: Date;
    }>;
    findBySessionId(sessionId: string): Promise<CheckoutSession>;
    saveInformation(sessionId: string, saveInformationDto: SaveInformationDto): Promise<{
        nextStep: number;
        requiresShipping: boolean;
    }>;
    selectShipping(sessionId: string, selectShippingDto: SelectShippingDto): Promise<{
        shippingCost: number;
        totalAmount: number;
        nextStep: number;
    }>;
    createPayment(sessionId: string, createPaymentDto: CreatePaymentDto): Promise<{
        stripeCheckoutUrl: string;
        paymentMethod: "stripe";
    }>;
    getCheckoutSummary(sessionId: string): Promise<{
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
    }>;
    getPublicCheckoutData(sessionId: string): Promise<{
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
    }>;
    expireSession(sessionId: string): Promise<void>;
    completeCheckoutSession(sessionId: string, paymentData: any): Promise<CheckoutSession>;
    private validateCheckoutSession;
    private calculateProductPrice;
    private generateSessionId;
    cleanupExpiredSessions(): Promise<number>;
}
