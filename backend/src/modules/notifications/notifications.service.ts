import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: Transporter;
  private templates: Map<string, hbs.TemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    if (isDevelopment) {
      // Use Ethereal for development
      this.transporter = createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: this.configService.get<string>('ETHEREAL_USER'),
          pass: this.configService.get<string>('ETHEREAL_PASS'),
        },
      });
    } else {
      // Use real SMTP for production
      this.transporter = createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  private loadTemplates() {
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
    } catch (error) {
      this.logger.warn('Failed to load email templates', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      let html = options.html;
      let text = options.text;

      // Use template if provided
      if (options.template && this.templates.has(options.template)) {
        const template = this.templates.get(options.template);
        html = template(options.context || {});
      }

      const mailOptions = {
        from: this.configService.get<string>('FROM_EMAIL') || 'noreply@shopify-shop.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error);
      return false;
    }
  }

  // Order notifications
  async sendOrderConfirmation(order: any): Promise<boolean> {
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

  async sendOrderShipped(order: any): Promise<boolean> {
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

  async sendOrderDelivered(order: any): Promise<boolean> {
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

  // Subscription notifications
  async sendSubscriptionWelcome(subscription: any): Promise<boolean> {
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

  async sendSubscriptionRenewal(subscription: any): Promise<boolean> {
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

  async sendSubscriptionCancelled(subscription: any): Promise<boolean> {
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

  async sendSubscriptionPaymentFailed(subscription: any): Promise<boolean> {
    return await this.sendEmail({
      to: subscription.customer.email,
      subject: 'Action Required: Subscription Payment Failed',
      template: 'subscription-payment-failed',
      context: {
        subscription,
        retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    });
  }

  // Shop notifications
  async sendNewOrderNotification(shop: any, order: any): Promise<boolean> {
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

  async sendKYCRequired(shop: any): Promise<boolean> {
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

  async sendKYCApproved(shop: any): Promise<boolean> {
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

  // Customer notifications
  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
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

  async sendEmailVerification(email: string, verificationToken: string): Promise<boolean> {
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

  // Admin notifications
  async sendNewShopRegistration(shop: any): Promise<boolean> {
    return await this.sendEmail({
      to: this.configService.get<string>('ADMIN_EMAIL'),
      subject: `New Shop Registration: ${shop.name}`,
      template: 'admin-new-shop',
      context: {
        shop,
        adminUrl: `${this.configService.get('FRONTEND_URL')}/admin/shops/${shop.id}`,
      },
    });
  }

  async sendSecurityAlert(user: any, alert: string): Promise<boolean> {
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

  // Marketing emails
  async sendPromotionalEmail(users: any[], promotion: any): Promise<boolean> {
    const promises = users.map(user =>
      this.sendEmail({
        to: user.email,
        subject: promotion.subject,
        template: 'promotional',
        context: {
          user,
          promotion,
          unsubscribeUrl: `${this.configService.get('FRONTEND_URL')}/unsubscribe?email=${user.email}`,
        },
      })
    );

    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      this.logger.error('Failed to send promotional emails', error);
      return false;
    }
  }

  // SMS notifications (mock implementation)
  async sendSMS(to: string, message: string): Promise<boolean> {
    this.logger.log(`SMS would be sent to ${to}: ${message}`);
    // In a real implementation, you would use a service like Twilio
    return true;
  }

  async sendOrderSMS(order: any, message: string): Promise<boolean> {
    if (order.customerPhone) {
      return this.sendSMS(order.customerPhone, message);
    }
    return false;
  }

  // Push notifications (mock implementation)
  async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<boolean> {
    this.logger.log(`Push notification would be sent to user ${userId}: ${notification.title}`);
    // In a real implementation, you would use FCM or another push service
    return true;
  }

  // Notification preferences
  async canSendEmail(user: any, type: string): Promise<boolean> {
    // In a real implementation, you would check user preferences
    return true;
  }

  async canSendSMS(user: any, type: string): Promise<boolean> {
    // In a real implementation, you would check user preferences
    return user.phone ? true : false;
  }

  async canSendPush(user: any, type: string): Promise<boolean> {
    // In a real implementation, you would check user preferences and device tokens
    return true;
  }

  // Template management
  addTemplate(name: string, template: string): void {
    const compiledTemplate = hbs.compile(template);
    this.templates.set(name, compiledTemplate);
  }

  removeTemplate(name: string): void {
    this.templates.delete(name);
  }

  hasTemplate(name: string): boolean {
    return this.templates.has(name);
  }

  // Testing methods
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email configuration verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Email configuration verification failed', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
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
}