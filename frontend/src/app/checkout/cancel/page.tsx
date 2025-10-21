'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutCancelPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your payment has been cancelled. No charges were made to your account.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h4 className="font-medium text-yellow-800 mb-1">Don't worry!</h4>
              <p className="text-sm text-yellow-700">
                Your cart has been saved and you can complete your purchase anytime.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Link href={`/checkout/${sessionId}`}>
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Checkout
                </Button>
              </Link>
              <Link href="/shops">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>
                If you cancelled by mistake or need help, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    }>
      <CheckoutCancelPageContent />
    </Suspense>
  );
}