"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import InformationStep from "@/components/checkout/InformationStep";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep from "@/components/checkout/PaymentStep";
import { checkoutApi, type CheckoutSession } from "@/lib/api/checkout";
import { Loader2 } from "lucide-react";

interface CheckoutPageProps {
  params: {
    sessionId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { sessionId } = params;
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    customerName: "",
    phone: "",
    shippingAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    shippingMethod: "",
    customerNote: "",
  });

  // Load checkout session data on mount
  useEffect(() => {
    loadCheckoutSession();
  }, [sessionId]);

  async function loadCheckoutSession() {
    try {
      setLoading(true);
      const session = await checkoutApi.getSession(sessionId);
      setCheckoutSession(session);
      setCurrentStep(session.currentStep);

      // Pre-fill form data if available
      if (session.email) {
        setFormData(prev => ({
          ...prev,
          email: session.email || "",
          customerName: session.customerName || "",
          phone: session.phone || "",
          shippingAddress: {
            line1: session.shippingAddress?.line1 || prev.shippingAddress.line1,
            line2: session.shippingAddress?.line2 || prev.shippingAddress.line2,
            city: session.shippingAddress?.city || prev.shippingAddress.city,
            state: session.shippingAddress?.state || prev.shippingAddress.state,
            country: session.shippingAddress?.country || prev.shippingAddress.country,
            postalCode: session.shippingAddress?.postalCode || prev.shippingAddress.postalCode,
          },
        }));
      }

      // If step 2 or beyond, load shipping rates
      if (session.currentStep >= 2) {
        await loadShippingRates();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout session');
    } finally {
      setLoading(false);
    }
  }

  async function loadShippingRates() {
    try {
      const { rates } = await checkoutApi.calculateShipping(sessionId);
      setShippingRates(rates);
    } catch (err: any) {
      console.error('Failed to load shipping rates:', err);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !checkoutSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Checkout Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error || 'Checkout session not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Information", description: "Contact & shipping info" },
    { id: 2, name: "Shipping", description: "Delivery method" },
    { id: 3, name: "Payment", description: "Payment details" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InformationStep
            formData={formData}
            setFormData={setFormData}
            onNext={async () => {
              try {
                await checkoutApi.saveInformation(sessionId, {
                  email: formData.email,
                  name: formData.customerName,
                  phone: formData.phone,
                  shippingAddress: formData.shippingAddress,
                  note: formData.customerNote,
                });
                await loadCheckoutSession(); // Reload to get updated step
                setCurrentStep(2);
                await loadShippingRates();
              } catch (err: any) {
                alert(err.message || 'Failed to save information');
              }
            }}
          />
        );
      case 2:
        return (
          <ShippingStep
            shippingRates={shippingRates}
            selectedShippingRate={selectedShippingRate}
            onShippingRateChange={(rateId) => {
              setSelectedShippingRate(rateId);
              setFormData(prev => ({ ...prev, shippingMethod: rateId }));
            }}
            onBack={() => setCurrentStep(1)}
            onNext={async () => {
              if (!selectedShippingRate) {
                alert('Please select a shipping method');
                return;
              }
              try {
                await checkoutApi.selectShipping(sessionId, { shippingRateId: selectedShippingRate });
                await loadCheckoutSession(); // Reload to get updated totals
                setCurrentStep(3);
              } catch (err: any) {
                alert(err.message || 'Failed to select shipping method');
              }
            }}
            isLoading={shippingRates.length === 0}
          />
        );
      case 3:
        return (
          <PaymentStep
            checkoutSession={checkoutSession}
            selectedShippingRate={shippingRates.find(rate => rate.id === selectedShippingRate)}
            onBack={() => setCurrentStep(2)}
            onPayment={async () => {
              try {
                setIsProcessingPayment(true);
                const { stripeCheckoutUrl } = await checkoutApi.createPayment(sessionId, {
                  paymentMethod: 'stripe'
                });
                window.location.href = stripeCheckoutUrl;
              } catch (err: any) {
                alert(err.message || 'Failed to create payment session');
                setIsProcessingPayment(false);
              }
            }}
            isLoading={isProcessingPayment}
          />
        );
      default:
        return null;
    }
  };

  // Transform checkout session product to match CheckoutLayout interface
  const productForLayout = {
    name: checkoutSession.product.name,
    description: checkoutSession.product.description || '',
    price: checkoutSession.product.price,
    image: checkoutSession.product.images[0] || '/product-placeholder.jpg',
    shopName: checkoutSession.product.shop.name,
    type: checkoutSession.product.productType as "physical" | "digital" | "subscription",
  };

  return (
    <CheckoutLayout
      currentStep={currentStep}
      steps={steps}
      product={productForLayout}
      sessionId={sessionId}
    >
      {renderStep()}
    </CheckoutLayout>
  );
}