'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Shield, Lock, ChevronRight } from 'lucide-react';

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
}

interface PaymentStepProps {
  checkoutSession: CheckoutSession;
  selectedShippingRate?: { name: string; price: number; deliveryTime: string };
  onBack: () => void;
  onPayment: (method: 'stripe' | 'paypal') => void;
  isLoading?: boolean;
}

export default function PaymentStep({
  checkoutSession,
  selectedShippingRate,
  onBack,
  onPayment,
  isLoading = false
}: PaymentStepProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  const calculateSubtotal = () => {
    return checkoutSession.product.price;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = checkoutSession.shippingCost || 0;
    return subtotal + shipping;
  };

  const formatBillingCycle = (cycle: string) => {
    switch (cycle) {
      case 'weekly': return '/week';
      case 'monthly': return '/month';
      case 'yearly': return '/year';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stripe Option */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('stripe')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === 'stripe' && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Stripe</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Credit Card, Debit Card, Digital Wallets
                </p>
                <div className="ml-6 mt-2">
                  <p className="text-xs text-gray-500">
                    🔒 Secure payments via Stripe
                  </p>
                </div>
              </div>

              {/* PayPal Option */}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('paypal')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === 'paypal'
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
                  <p className="text-sm text-blue-800">
                    Your payment information is encrypted and secure.
                    {selectedPaymentMethod === 'stripe'
                      ? ' You will be redirected to Stripe\'s secure checkout.'
                      : ' You will be redirected to PayPal\'s secure checkout.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment processed by</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium capitalize">{selectedPaymentMethod}</span>
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
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
                  ${(calculateSubtotal() * 1.15 + (checkoutSession.shippingCost || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Billing Info */}
            {checkoutSession.billingCycle !== 'one_time' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Subscription:</strong> You will be charged{' '}
                  ${(calculateSubtotal() * 1.15).toFixed(2)}{formatBillingCycle(checkoutSession.billingCycle)}{' '}
                  until you cancel. You can cancel anytime from your dashboard.
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back to Shipping
        </Button>
        <Button
          onClick={() => onPayment(selectedPaymentMethod)}
          disabled={isLoading}
          className="min-w-48 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay with {selectedPaymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}