'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Shield, Lock, ChevronRight, AlertCircle } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
    name: string;
    shopName: string;
    price: number;
    images: string[];
    productType: 'physical' | 'digital' | 'subscription';
}

interface CheckoutSession {
    product: Product;
    shippingCost?: number;
    totalAmount?: number;
    billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
    stripeAccountId?: string;
}

interface PaymentStepProps {
    checkoutSession: CheckoutSession;
    selectedShippingRate?: { name: string; price: number; deliveryTime: string };
    onBack: () => void;
    onPayment: (method: 'stripe_card' | 'stripe_popup' | 'paypal') => void;
    isLoading?: boolean;
}

// Stripe Card Form Component
function StripeCardForm({
    onSuccess,
    onError,
    stripeAccountId,
    amount,
    sessionId
}: {
    onSuccess: () => void;
    onError: (error: string) => void;
    stripeAccountId?: string;
    amount: number;
    sessionId: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardName, setCardName] = useState('');
    const [billingZip, setBillingZip] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            onError('Stripe has not loaded yet. Please try again.');
            return;
        }

        if (!cardName.trim()) {
            onError('Please enter the cardholder name.');
            return;
        }

        if (!billingZip.trim()) {
            onError('Please enter the billing ZIP code.');
            return;
        }

        setIsProcessing(true);

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                throw new Error('Card element not found');
            }

            // Create payment method
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardName,
                    address: {
                        postal_code: billingZip,
                    },
                },
            });

            if (paymentMethodError) {
                throw new Error(paymentMethodError.message);
            }

            // Create payment intent on our backend
            const response = await fetch('create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    sessionId: sessionId,
                    amount: Math.round(amount * 100), // Convert to cents
                    stripeAccountId: stripeAccountId,
                }),
            });

            const paymentIntentData = await response.json();

            if (!response.ok) {
                throw new Error(paymentIntentData.error || 'Failed to create payment');
            }

            // Confirm payment on client side
            const { error: confirmError } = await stripe.confirmCardPayment(
                paymentIntentData.clientSecret
            );

            if (confirmError) {
                throw new Error(confirmError.message);
            }

            onSuccess();
        } catch (error: any) {
            console.error('Payment error:', error);
            onError(error.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cardholder Name */}
            <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                    id="cardName"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                    required
                />
            </div>

            {/* Card Element */}
            <div>
                <Label htmlFor="cardElement">Card Information</Label>
                <div className="mt-1 p-3 border rounded-md bg-white">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                            hidePostalCode: true, // We're collecting this separately
                        }}
                    />
                </div>
            </div>

            {/* Billing ZIP Code */}
            <div>
                <Label htmlFor="billingZip">Billing ZIP Code</Label>
                <Input
                    id="billingZip"
                    type="text"
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                    placeholder="12345"
                    className="mt-1"
                    required
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay ${(amount).toFixed(2)}
                    </>
                )}
            </Button>
        </form>
    );
}

export default function EnhancedPaymentStep({
    checkoutSession,
    selectedShippingRate,
    onBack,
    onPayment,
    isLoading = false
}: PaymentStepProps) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe_card' | 'stripe_popup' | 'paypal'>('stripe_card');
    const [error, setError] = useState<string | null>(null);

    const calculateSubtotal = () => {
        return checkoutSession.product.price;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = checkoutSession.shippingCost || 0;
        const platformFee = subtotal * 0.15;
        return subtotal + shipping + platformFee;
    };

    const formatBillingCycle = (cycle: string) => {
        switch (cycle) {
            case 'weekly': return '/week';
            case 'monthly': return '/month';
            case 'yearly': return '/year';
            default: return '';
        }
    };

    const handlePaymentSuccess = () => {
        // Redirect to success page or handle success
        window.location.href = `/checkout/success?session_id=${checkoutSession.sessionId}`;
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Method
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Stripe Card Option */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'stripe_card'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedPaymentMethod('stripe_card')}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === 'stripe_card'
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selectedPaymentMethod === 'stripe_card' && (
                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                        )}
                                    </div>
                                    <CreditCard className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium">Credit Card (Secure Form)</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-6">
                                    Enter your card details directly on this secure form
                                </p>
                                <div className="ml-6 mt-2">
                                    <p className="text-xs text-gray-500">
                                        🔒 SSL Encrypted • PCI Compliant
                                    </p>
                                </div>
                            </div>

                            {/* Stripe Popup Option */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'stripe_popup'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedPaymentMethod('stripe_popup')}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === 'stripe_popup'
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selectedPaymentMethod === 'stripe_popup' && (
                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-blue-600">Stripe Checkout</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-6">
                                    Pay with Stripe's secure checkout popup
                                </p>
                                <div className="ml-6 mt-2">
                                    <p className="text-xs text-gray-500">
                                        🛡️ Shop's Stripe Account • Apple Pay, Google Pay supported
                                    </p>
                                </div>
                            </div>

                            {/* PayPal Option */}
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'paypal'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedPaymentMethod('paypal')}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === 'paypal'
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selectedPaymentMethod === 'paypal' && (
                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                        )}
                                    </div>
                                    <span className="font-medium text-blue-600">PayPal</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-6">
                                    PayPal balance, Bank accounts, Cards
                                </p>
                                <div className="ml-6 mt-2">
                                    <p className="text-xs text-gray-500">
                                        🛡️ Buyer protection included
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-red-900 mb-1">Payment Error</h4>
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
                                    <p className="text-sm text-blue-800">
                                        Your payment information is encrypted and secure.
                                        {selectedPaymentMethod === 'stripe_card'
                                            ? ' Your card details are tokenized and processed securely.'
                                            : selectedPaymentMethod === 'stripe_popup'
                                                ? ' You will be redirected to Stripe\'s secure checkout.'
                                                : ' You will be redirected to PayPal\'s secure checkout.'
                                        }
                                    </p>
                                    {checkoutSession.stripeAccountId && selectedPaymentMethod !== 'paypal' && (
                                        <p className="text-xs text-blue-700 mt-1">
                                            Payment will be processed directly by the shop's Stripe account.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Form or Checkout Button */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedPaymentMethod === 'stripe_card' ? 'Enter Card Details' : 'Order Summary'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedPaymentMethod === 'stripe_card' ? (
                        <Elements stripe={stripePromise}>
                            <StripeCardForm
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                stripeAccountId={checkoutSession.stripeAccountId}
                                amount={calculateTotal()}
                                sessionId={checkoutSession.sessionId}
                            />
                        </Elements>
                    ) : (
                        <div className="space-y-4">
                            {/* Product */}
                            <div className="flex items-start space-x-4 pb-4 border-b">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                    {checkoutSession.product.images[0] && (
                                        <img
                                            src={checkoutSession.product.images[0]}
                                            alt={checkoutSession.product.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{checkoutSession.product.name}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{checkoutSession.product.shopName}</p>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            {checkoutSession.product.productType === 'physical' ? 'Physical Product' :
                                                checkoutSession.product.productType === 'digital' ? 'Digital Product' : 'Subscription'}
                                        </Badge>
                                        {checkoutSession.billingCycle !== 'one_time' && (
                                            <Badge variant="outline">
                                                {checkoutSession.billingCycle}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lg">
                                        ${checkoutSession.product.price.toFixed(2)}
                                        {formatBillingCycle(checkoutSession.billingCycle)}
                                    </p>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>

                                {checkoutSession.shippingCost && checkoutSession.shippingCost > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Shipping ({selectedShippingRate?.deliveryTime || 'Standard'})
                                        </span>
                                        <span>${checkoutSession.shippingCost.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Platform Fee (15%)</span>
                                    <span>${(calculateSubtotal() * 0.15).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-green-600">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Billing Info */}
                            {checkoutSession.billingCycle !== 'one_time' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Subscription:</strong> You will be charged{' '}
                                        ${(calculateTotal()).toFixed(2)}{formatBillingCycle(checkoutSession.billingCycle)}{' '}
                                        until you cancel. You can cancel anytime from your dashboard.
                                    </p>
                                </div>
                            )}

                            {/* Pay Button */}
                            <Button
                                onClick={() => onPayment(selectedPaymentMethod)}
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Pay with {selectedPaymentMethod === 'stripe_popup' ? 'Stripe Checkout' : 'PayPal'}
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {selectedPaymentMethod !== 'stripe_card' && (
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack} disabled={isLoading}>
                        Back to Shipping
                    </Button>
                </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Your payment information is secure and encrypted</span>
            </div>
        </div>
    );
}