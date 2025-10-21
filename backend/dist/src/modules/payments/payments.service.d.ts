import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';
import { CheckoutSession } from '../checkout/entities/checkout-session.entity';
import { Order } from '../orders/entities/order.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateSetupIntentDto } from './dto/create-setup-intent.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
export declare class PaymentsService {
    private readonly configService;
    private readonly shopRepository;
    private readonly checkoutSessionRepository;
    private readonly orderRepository;
    private readonly subscriptionRepository;
    private readonly stripe;
    private readonly logger;
    constructor(configService: ConfigService, shopRepository: Repository<Shop>, checkoutSessionRepository: Repository<CheckoutSession>, orderRepository: Repository<Order>, subscriptionRepository: Repository<Subscription>);
    createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    getPaymentIntent(intentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    confirmPaymentIntent(intentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    cancelPaymentIntent(intentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    createSetupIntent(createSetupIntentDto: CreateSetupIntentDto): Promise<Stripe.Response<Stripe.SetupIntent>>;
    getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
    detachPaymentMethod(paymentMethodId: string): Promise<void>;
    createRefund(refundPaymentDto: RefundPaymentDto): Promise<Stripe.Response<Stripe.Refund>>;
    getRefund(refundId: string): Promise<Stripe.Response<Stripe.Refund>>;
    createConnectAccount(shopId: string, userId: string): Promise<any>;
    getConnectAccount(accountId: string): Promise<Stripe.Response<Stripe.Account>>;
    createOnboardingLink(accountId: string): Promise<any>;
    createKYCLink(accountId: string): Promise<any>;
    updateAccountStatus(accountId: string): Promise<void>;
    createDashboardLink(accountId: string): Promise<any>;
    createCheckoutSession(body: {
        productId: string;
        customerId?: string;
        successUrl: string;
        cancelUrl: string;
        billingCycle?: string;
    }): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    getCheckoutSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    createSubscription(body: {
        customerId: string;
        priceId: string;
        trialDays?: number;
        paymentMethodId?: string;
    }): Promise<Stripe.Response<Stripe.Subscription>>;
    cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<any>;
    getAccountBalance(accountId: string): Promise<Stripe.Response<Stripe.Balance>>;
    createPayout(accountId: string, amount: number, currency?: string): Promise<Stripe.Response<Stripe.Payout>>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
        type: "account.application.authorized" | "account.application.deauthorized" | "account.external_account.created" | "account.external_account.deleted" | "account.external_account.updated" | "account.updated" | "application_fee.created" | "application_fee.refund.updated" | "application_fee.refunded" | "balance.available" | "billing_portal.configuration.created" | "billing_portal.configuration.updated" | "billing_portal.session.created" | "capability.updated" | "cash_balance.funds_available" | "charge.captured" | "charge.dispute.closed" | "charge.dispute.created" | "charge.dispute.funds_reinstated" | "charge.dispute.funds_withdrawn" | "charge.dispute.updated" | "charge.expired" | "charge.failed" | "charge.pending" | "charge.refund.updated" | "charge.refunded" | "charge.succeeded" | "charge.updated" | "checkout.session.async_payment_failed" | "checkout.session.async_payment_succeeded" | "checkout.session.completed" | "checkout.session.expired" | "climate.order.canceled" | "climate.order.created" | "climate.order.delayed" | "climate.order.delivered" | "climate.order.product_substituted" | "climate.product.created" | "climate.product.pricing_updated" | "coupon.created" | "coupon.deleted" | "coupon.updated" | "credit_note.created" | "credit_note.updated" | "credit_note.voided" | "customer.created" | "customer.deleted" | "customer.discount.created" | "customer.discount.deleted" | "customer.discount.updated" | "customer.source.created" | "customer.source.deleted" | "customer.source.expiring" | "customer.source.updated" | "customer.subscription.created" | "customer.subscription.deleted" | "customer.subscription.paused" | "customer.subscription.pending_update_applied" | "customer.subscription.pending_update_expired" | "customer.subscription.resumed" | "customer.subscription.trial_will_end" | "customer.subscription.updated" | "customer.tax_id.created" | "customer.tax_id.deleted" | "customer.tax_id.updated" | "customer.updated" | "customer_cash_balance_transaction.created" | "file.created" | "financial_connections.account.created" | "financial_connections.account.deactivated" | "financial_connections.account.disconnected" | "financial_connections.account.reactivated" | "financial_connections.account.refreshed_balance" | "financial_connections.account.refreshed_ownership" | "financial_connections.account.refreshed_transactions" | "identity.verification_session.canceled" | "identity.verification_session.created" | "identity.verification_session.processing" | "identity.verification_session.redacted" | "identity.verification_session.requires_input" | "identity.verification_session.verified" | "invoice.created" | "invoice.deleted" | "invoice.finalization_failed" | "invoice.finalized" | "invoice.marked_uncollectible" | "invoice.paid" | "invoice.payment_action_required" | "invoice.payment_failed" | "invoice.payment_succeeded" | "invoice.sent" | "invoice.upcoming" | "invoice.updated" | "invoice.voided" | "invoiceitem.created" | "invoiceitem.deleted" | "issuing_authorization.created" | "issuing_authorization.request" | "issuing_authorization.updated" | "issuing_card.created" | "issuing_card.updated" | "issuing_cardholder.created" | "issuing_cardholder.updated" | "issuing_dispute.closed" | "issuing_dispute.created" | "issuing_dispute.funds_reinstated" | "issuing_dispute.submitted" | "issuing_dispute.updated" | "issuing_token.created" | "issuing_token.updated" | "issuing_transaction.created" | "issuing_transaction.updated" | "mandate.updated" | "payment_intent.amount_capturable_updated" | "payment_intent.canceled" | "payment_intent.created" | "payment_intent.partially_funded" | "payment_intent.payment_failed" | "payment_intent.processing" | "payment_intent.requires_action" | "payment_intent.succeeded" | "payment_link.created" | "payment_link.updated" | "payment_method.attached" | "payment_method.automatically_updated" | "payment_method.detached" | "payment_method.updated" | "payout.canceled" | "payout.created" | "payout.failed" | "payout.paid" | "payout.reconciliation_completed" | "payout.updated" | "person.created" | "person.deleted" | "person.updated" | "plan.created" | "plan.deleted" | "plan.updated" | "price.created" | "price.deleted" | "price.updated" | "product.created" | "product.deleted" | "product.updated" | "promotion_code.created" | "promotion_code.updated" | "quote.accepted" | "quote.canceled" | "quote.created" | "quote.finalized" | "radar.early_fraud_warning.created" | "radar.early_fraud_warning.updated" | "refund.created" | "refund.updated" | "reporting.report_run.failed" | "reporting.report_run.succeeded" | "reporting.report_type.updated" | "review.closed" | "review.opened" | "setup_intent.canceled" | "setup_intent.created" | "setup_intent.requires_action" | "setup_intent.setup_failed" | "setup_intent.succeeded" | "sigma.scheduled_query_run.created" | "source.canceled" | "source.chargeable" | "source.failed" | "source.mandate_notification" | "source.refund_attributes_required" | "source.transaction.created" | "source.transaction.updated" | "subscription_schedule.aborted" | "subscription_schedule.canceled" | "subscription_schedule.completed" | "subscription_schedule.created" | "subscription_schedule.expiring" | "subscription_schedule.released" | "subscription_schedule.updated" | "tax.settings.updated" | "tax_rate.created" | "tax_rate.updated" | "terminal.reader.action_failed" | "terminal.reader.action_succeeded" | "test_helpers.test_clock.advancing" | "test_helpers.test_clock.created" | "test_helpers.test_clock.deleted" | "test_helpers.test_clock.internal_failure" | "test_helpers.test_clock.ready" | "topup.canceled" | "topup.created" | "topup.failed" | "topup.reversed" | "topup.succeeded" | "transfer.created" | "transfer.reversed" | "transfer.updated" | "treasury.credit_reversal.created" | "treasury.credit_reversal.posted" | "treasury.debit_reversal.completed" | "treasury.debit_reversal.created" | "treasury.debit_reversal.initial_credit_granted" | "treasury.financial_account.closed" | "treasury.financial_account.created" | "treasury.financial_account.features_status_updated" | "treasury.inbound_transfer.canceled" | "treasury.inbound_transfer.created" | "treasury.inbound_transfer.failed" | "treasury.inbound_transfer.succeeded" | "treasury.outbound_payment.canceled" | "treasury.outbound_payment.created" | "treasury.outbound_payment.expected_arrival_date_updated" | "treasury.outbound_payment.failed" | "treasury.outbound_payment.posted" | "treasury.outbound_payment.returned" | "treasury.outbound_transfer.canceled" | "treasury.outbound_transfer.created" | "treasury.outbound_transfer.expected_arrival_date_updated" | "treasury.outbound_transfer.failed" | "treasury.outbound_transfer.posted" | "treasury.outbound_transfer.returned" | "treasury.received_credit.created" | "treasury.received_credit.failed" | "treasury.received_credit.succeeded" | "treasury.received_debit.created" | "invoiceitem.updated" | "order.created" | "recipient.created" | "recipient.deleted" | "recipient.updated" | "sku.created" | "sku.deleted" | "sku.updated";
    }>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    private handleCheckoutCompleted;
    private handleInvoicePaid;
    private handleInvoicePaymentFailed;
    private handleSubscriptionCreated;
    private handleSubscriptionDeleted;
    private handleAccountUpdated;
    private updateCheckoutSessionPayment;
    private updateShopAccountStatus;
    getAllTransactions(page?: number, limit?: number, shopId?: string): Promise<{
        transactions: Stripe.PaymentIntent[];
        hasMore: boolean;
    }>;
    getPaymentMetrics(period?: string): Promise<{
        totalAmount: number;
        totalTransactions: number;
        successfulTransactions: number;
        successRate: number;
        period: string;
    }>;
}
