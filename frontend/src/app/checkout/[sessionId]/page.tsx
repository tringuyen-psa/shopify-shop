"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import InformationStep from "@/components/checkout/InformationStep";

interface CheckoutPageProps {
  params: {
    sessionId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { sessionId } = params;
  const [currentStep, setCurrentStep] = useState(1);
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

  // Mock product data - in real app this would come from API
  const product = {
    name: "Premium Product",
    description: "High-quality product with amazing features",
    price: 29.99,
    image: "/product-placeholder.jpg",
    shopName: "Sample Shop",
    type: "physical" as "physical" | "digital" | "subscription",
  };

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
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">Select your preferred shipping method:</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={formData.shippingMethod === "standard"}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Standard Shipping</div>
                        <div className="text-sm text-gray-600">5-7 business days</div>
                      </div>
                    </div>
                    <span className="font-medium">$5.00</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={formData.shippingMethod === "express"}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Express Shipping</div>
                        <div className="text-sm text-gray-600">2-3 business days</div>
                      </div>
                    </div>
                    <span className="font-medium">$15.00</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value="overnight"
                        checked={formData.shippingMethod === "overnight"}
                        onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">Overnight Shipping</div>
                        <div className="text-sm text-gray-600">Next business day</div>
                      </div>
                    </div>
                    <span className="font-medium">$25.00</span>
                  </label>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.shippingMethod}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="payment" value="card" defaultChecked className="mr-3" />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="payment" value="paypal" className="mr-3" />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <Input placeholder="John Doe" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{product.name}</span>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-2 border-t">
                      <span>Total</span>
                      <span>${(product.price + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1">
                    Complete Purchase
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <CheckoutLayout
      currentStep={currentStep}
      steps={steps}
      product={product}
      sessionId={sessionId}
    >
      {renderStep()}
    </CheckoutLayout>
  );
}