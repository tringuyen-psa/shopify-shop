'use client';

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
  onPayment: () => void;
  isLoading?: boolean;
}

export default function PaymentStep({
  checkoutSession,
  selectedShippingRate,
  onBack,
  onPayment,
  isLoading = false
}: PaymentStepProps) {

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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Secure Stripe Checkout</h4>
                  <p className="text-sm text-blue-800">
                    You'll be redirected to Stripe's secure checkout to complete your payment.
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
                <p className="text-sm text-gray-600">
                  Visa, Mastercard, American Express, Discover
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Digital Wallets</span>
                </div>
                <p className="text-sm text-gray-600">
                  Apple Pay, Google Pay, and more
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Payment processed by</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Stripe</span>
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
          onClick={onPayment}
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
              Pay with Stripe
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}