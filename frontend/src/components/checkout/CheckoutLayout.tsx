import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CheckoutLayoutProps {
  currentStep: number;
  steps: Array<{ id: number; name: string; description: string }>;
  product: {
    name: string;
    description: string;
    price: number;
    image: string;
    shopName: string;
    type: "physical" | "digital" | "subscription";
  };
  sessionId: string;
  children: ReactNode;
}

export default function CheckoutLayout({
  currentStep,
  steps,
  product,
  sessionId,
  children
}: CheckoutLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                  <div className="flex items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep > step.id
                          ? 'bg-blue-600 border-blue-600'
                          : currentStep === step.id
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-sm font-medium ${
                          currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.id}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p className={`text-sm font-medium ${
                        currentStep === step.id ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 ? (
                    <div className="flex-1 h-px bg-gray-300 ml-4" />
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {children}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  {/* Product Info */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.shopName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.type === 'physical' ? 'Physical Product' :
                         product.type === 'digital' ? 'Digital Product' : 'Subscription'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Product</span>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                    {product.type === 'physical' && (
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>$5.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Platform fee (15%)</span>
                      <span>${(product.price * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>${(product.price * 1.15 + (product.type === 'physical' ? 5 : 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-800">Secure checkout powered by Stripe</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}