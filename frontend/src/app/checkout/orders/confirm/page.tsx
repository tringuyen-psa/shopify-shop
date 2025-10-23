'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderData {
  orderNumber: string;
  customerEmail: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  customerName: string;
}

interface ConfirmResponse {
  success: boolean;
  data?: OrderData;
  error?: string;
}

function ConfirmOrderContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const confirmOrder = async () => {
      try {
        const response = await fetch(`/api/checkout/orders/confirm?session_id=${sessionId}`);
        const data: ConfirmResponse = await response.json();

        if (data.success && data.data) {
          setOrderData(data.data);
        } else {
          setError(data.error || 'Failed to confirm order');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Order confirmation error:', err);
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Confirming your order...</h2>
          <p className="text-gray-600 mt-2">Please wait while we process your payment.</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Order Confirmation Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error || 'We could not confirm your order. Please contact support if the problem persists.'}
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/checkout">Try Checkout Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Order Number:</span>
                <span className="font-mono text-lg">{orderData.orderNumber}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Customer:</span>
                <span className="text-gray-700">{orderData.customerName}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Email:</span>
                <span className="text-gray-700">{orderData.customerEmail}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${orderData.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Payment Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderData.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium text-gray-900">Fulfillment Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  orderData.fulfillmentStatus === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : orderData.fulfillmentStatus === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : orderData.fulfillmentStatus === 'fulfilled'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {orderData.fulfillmentStatus.charAt(0).toUpperCase() + orderData.fulfillmentStatus.slice(1)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Order Date:</span>
                <span className="text-gray-700">
                  {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            A confirmation email has been sent to {orderData.customerEmail}
          </p>
          <div className="space-y-2">
            <Button asChild size="lg">
              <Link href="/">Continue Shopping</Link>
            </Button>
            <div>
              <Button variant="outline" asChild>
                <Link href="/shops">Browse More Shops</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <ConfirmOrderContent />
    </Suspense>
  );
}