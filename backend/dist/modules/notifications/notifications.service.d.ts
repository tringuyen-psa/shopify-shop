import { ConfigService } from '@nestjs/config';
interface EmailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
    text?: string;
}
export declare class NotificationsService {
    private readonly configService;
    private readonly logger;
    private transporter;
    private templates;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private loadTemplates;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendOrderConfirmation(order: any): Promise<boolean>;
    sendOrderShipped(order: any): Promise<boolean>;
    sendOrderDelivered(order: any): Promise<boolean>;
    sendSubscriptionWelcome(subscription: any): Promise<boolean>;
    sendSubscriptionRenewal(subscription: any): Promise<boolean>;
    sendSubscriptionCancelled(subscription: any): Promise<boolean>;
    sendSubscriptionPaymentFailed(subscription: any): Promise<boolean>;
    sendNewOrderNotification(shop: any, order: any): Promise<boolean>;
    sendKYCRequired(shop: any): Promise<boolean>;
    sendKYCApproved(shop: any): Promise<boolean>;
    sendPasswordReset(email: string, resetToken: string): Promise<boolean>;
    sendEmailVerification(email: string, verificationToken: string): Promise<boolean>;
    sendNewShopRegistration(shop: any): Promise<boolean>;
    sendSecurityAlert(user: any, alert: string): Promise<boolean>;
    sendPromotionalEmail(users: any[], promotion: any): Promise<boolean>;
    sendSMS(to: string, message: string): Promise<boolean>;
    sendOrderSMS(order: any, message: string): Promise<boolean>;
    sendPushNotification(userId: string, notification: {
        title: string;
        body: string;
        data?: Record<string, any>;
    }): Promise<boolean>;
    canSendEmail(user: any, type: string): Promise<boolean>;
    canSendSMS(user: any, type: string): Promise<boolean>;
    canSendPush(user: any, type: string): Promise<boolean>;
    addTemplate(name: string, template: string): void;
    removeTemplate(name: string): void;
    hasTemplate(name: string): boolean;
    testEmailConfiguration(): Promise<boolean>;
    sendTestEmail(to: string): Promise<boolean>;
}
export {};
