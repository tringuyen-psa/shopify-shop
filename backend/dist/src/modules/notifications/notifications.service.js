"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = require("nodemailer");
const hbs = require("handlebars");
const fs = require("fs");
const path = require("path");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.templates = new Map();
        this.initializeTransporter();
        this.loadTemplates();
    }
    initializeTransporter() {
        const isDevelopment = this.configService.get('NODE_ENV') === 'development';
        if (isDevelopment) {
            this.transporter = (0, nodemailer_1.createTransport)({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: this.configService.get('ETHEREAL_USER'),
                    pass: this.configService.get('ETHEREAL_PASS'),
                },
            });
        }
        else {
            this.transporter = (0, nodemailer_1.createTransport)({
                host: this.configService.get('SMTP_HOST'),
                port: parseInt(this.configService.get('SMTP_PORT') || '587'),
                secure: this.configService.get('SMTP_SECURE') === 'true',
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASS'),
                },
            });
        }
    }
    loadTemplates() {
        try {
            const templatesPath = path.join(__dirname, 'templates');
            if (fs.existsSync(templatesPath)) {
                const templateFiles = fs.readdirSync(templatesPath).filter(file => file.endsWith('.hbs'));
                templateFiles.forEach(file => {
                    const templateName = path.basename(file, '.hbs');
                    const templateContent = fs.readFileSync(path.join(templatesPath, file), 'utf8');
                    const template = hbs.compile(templateContent);
                    this.templates.set(templateName, template);
                });
            }
        }
        catch (error) {
            this.logger.warn('Failed to load email templates', error);
        }
    }
    async sendEmail(options) {
        try {
            let html = options.html;
            let text = options.text;
            if (options.template && this.templates.has(options.template)) {
                const template = this.templates.get(options.template);
                html = template(options.context || {});
            }
            const mailOptions = {
                from: this.configService.get('FROM_EMAIL') || 'noreply@shopify-shop.com',
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html,
                text,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully: ${result.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error);
            return false;
        }
    }
    async sendOrderConfirmation(order) {
        return await this.sendEmail({
            to: order.customerEmail,
            subject: `Order Confirmation #${order.orderNumber}`,
            template: 'order-confirmation',
            context: {
                order,
                customerName: order.customerName,
                shopName: order.shop.name,
                items: order.items || [order.product],
                totalAmount: order.totalAmount,
            },
        });
    }
    async sendOrderShipped(order) {
        return await this.sendEmail({
            to: order.customerEmail,
            subject: `Your Order #${order.orderNumber} Has Shipped!`,
            template: 'order-shipped',
            context: {
                order,
                trackingNumber: order.trackingNumber,
                carrier: order.carrier,
                estimatedDelivery: order.estimatedDelivery,
            },
        });
    }
    async sendOrderDelivered(order) {
        return await this.sendEmail({
            to: order.customerEmail,
            subject: `Your Order #${order.orderNumber} Has Been Delivered!`,
            template: 'order-delivered',
            context: {
                order,
                shopName: order.shop.name,
            },
        });
    }
    async sendSubscriptionWelcome(subscription) {
        return await this.sendEmail({
            to: subscription.customer.email,
            subject: 'Welcome to Your Subscription!',
            template: 'subscription-welcome',
            context: {
                subscription,
                productName: subscription.product.name,
                shopName: subscription.shop.name,
                billingCycle: subscription.billingCycle,
                nextBillingDate: subscription.currentPeriodEnd,
            },
        });
    }
    async sendSubscriptionRenewal(subscription) {
        return await this.sendEmail({
            to: subscription.customer.email,
            subject: 'Your Subscription Has Been Renewed',
            template: 'subscription-renewal',
            context: {
                subscription,
                nextBillingDate: subscription.currentPeriodEnd,
            },
        });
    }
    async sendSubscriptionCancelled(subscription) {
        return await this.sendEmail({
            to: subscription.customer.email,
            subject: 'Your Subscription Has Been Cancelled',
            template: 'subscription-cancelled',
            context: {
                subscription,
                endDate: subscription.currentPeriodEnd,
            },
        });
    }
    async sendSubscriptionPaymentFailed(subscription) {
        return await this.sendEmail({
            to: subscription.customer.email,
            subject: 'Action Required: Subscription Payment Failed',
            template: 'subscription-payment-failed',
            context: {
                subscription,
                retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async sendNewOrderNotification(shop, order) {
        return await this.sendEmail({
            to: shop.email,
            subject: `New Order Received! #${order.orderNumber}`,
            template: 'shop-new-order',
            context: {
                shop,
                order,
                customerName: order.customerName,
                totalAmount: order.totalAmount,
            },
        });
    }
    async sendKYCRequired(shop) {
        return await this.sendEmail({
            to: shop.email,
            subject: 'Action Required: Complete Your Account Verification',
            template: 'shop-kyc-required',
            context: {
                shop,
                onboardingUrl: `${this.configService.get('FRONTEND_URL')}/shop/onboarding`,
            },
        });
    }
    async sendKYCApproved(shop) {
        return await this.sendEmail({
            to: shop.email,
            subject: 'Your Account Has Been Approved!',
            template: 'shop-kyc-approved',
            context: {
                shop,
                dashboardUrl: `${this.configService.get('FRONTEND_URL')}/shop/dashboard`,
            },
        });
    }
    async sendPasswordReset(email, resetToken) {
        return await this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            template: 'password-reset',
            context: {
                resetUrl: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`,
                expiresIn: '1 hour',
            },
        });
    }
    async sendEmailVerification(email, verificationToken) {
        return await this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address',
            template: 'email-verification',
            context: {
                verificationUrl: `${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`,
                expiresIn: '24 hours',
            },
        });
    }
    async sendNewShopRegistration(shop) {
        return await this.sendEmail({
            to: this.configService.get('ADMIN_EMAIL'),
            subject: `New Shop Registration: ${shop.name}`,
            template: 'admin-new-shop',
            context: {
                shop,
                adminUrl: `${this.configService.get('FRONTEND_URL')}/admin/shops/${shop.id}`,
            },
        });
    }
    async sendSecurityAlert(user, alert) {
        return await this.sendEmail({
            to: user.email,
            subject: 'Security Alert',
            template: 'security-alert',
            context: {
                user,
                alert,
                timestamp: new Date().toISOString(),
            },
        });
    }
    async sendPromotionalEmail(users, promotion) {
        const promises = users.map(user => this.sendEmail({
            to: user.email,
            subject: promotion.subject,
            template: 'promotional',
            context: {
                user,
                promotion,
                unsubscribeUrl: `${this.configService.get('FRONTEND_URL')}/unsubscribe?email=${user.email}`,
            },
        }));
        try {
            await Promise.all(promises);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send promotional emails', error);
            return false;
        }
    }
    async sendSMS(to, message) {
        this.logger.log(`SMS would be sent to ${to}: ${message}`);
        return true;
    }
    async sendOrderSMS(order, message) {
        if (order.customerPhone) {
            return this.sendSMS(order.customerPhone, message);
        }
        return false;
    }
    async sendPushNotification(userId, notification) {
        this.logger.log(`Push notification would be sent to user ${userId}: ${notification.title}`);
        return true;
    }
    async canSendEmail(user, type) {
        return true;
    }
    async canSendSMS(user, type) {
        return user.phone ? true : false;
    }
    async canSendPush(user, type) {
        return true;
    }
    addTemplate(name, template) {
        const compiledTemplate = hbs.compile(template);
        this.templates.set(name, compiledTemplate);
    }
    removeTemplate(name) {
        this.templates.delete(name);
    }
    hasTemplate(name) {
        return this.templates.has(name);
    }
    async testEmailConfiguration() {
        try {
            await this.transporter.verify();
            this.logger.log('Email configuration verified successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Email configuration verification failed', error);
            return false;
        }
    }
    async sendTestEmail(to) {
        return await this.sendEmail({
            to,
            subject: 'Test Email from Shopify Shop Platform',
            template: 'test',
            context: {
                timestamp: new Date().toISOString(),
                platformName: 'Shopify Shop Platform',
            },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map