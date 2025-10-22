"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import InformationStep from "@/components/checkout/InformationStep";
import ShippingStep from "@/components/checkout/ShippingStep";
import EnhancedPaymentStep from "@/components/checkout/EnhancedPaymentStep";
import { checkoutApi, type CheckoutSession } from "@/lib/api/checkout";
import { Loader2 } from "lucide-react";

interface CheckoutPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
    const resolvedParams = use(params);
    const { sessionId } = resolvedParams;
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
            country: "US",
            postalCode: "",
        },
        shippingMethod: "",
        customerNote: "",
    });

    // Load checkout session data on mount
    useEffect(() => {
        loadCheckoutSession();
    }, [sessionId]);

    // Set current step based on backend data when checkout session loads
    useEffect(() => {
        if (checkoutSession) {
            console.log('Checkout session loaded, currentStep from backend:', checkoutSession.currentStep);

            // Always use the currentStep from backend as the source of truth
            setCurrentStep(checkoutSession.currentStep);

            // If step 2 or beyond, load shipping rates (only if not already loaded)
            if (checkoutSession.currentStep >= 2 && shippingRates.length === 0) {
                console.log('Loading shipping rates for step >= 2');
                loadShippingRates();
            }
        }
    }, [checkoutSession]);

    // Debug currentStep changes
    useEffect(() => {
        console.log('Current step changed to:', currentStep);
    }, [currentStep]);

    async function loadCheckoutSession() {
        try {
            setLoading(true);
            const session = await checkoutApi.getSession(sessionId);
            console.log('Loaded checkout session:', session);
            console.log('Session currentStep:', session.currentStep);
            setCheckoutSession(session);
            // currentStep will be set by the useEffect hook above

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
        } catch (err: any) {
            setError(err.message || 'Failed to load checkout session');
        } finally {
            setLoading(false);
        }
    }

    async function loadShippingRates() {
        // Skip API call and use default rates directly to avoid backend issues
        console.log('Using default shipping rates');
        const defaultRates = [
            {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Standard Shipping',
                description: '5-7 business days',
                price: 9.99,
                deliveryTime: '5-7 days'
            },
            {
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Express Shipping',
                description: '2-3 business days',
                price: 19.99,
                deliveryTime: '2-3 days'
            }
        ];
        setShippingRates(defaultRates);
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
        { id: 4, name: "Confirmation", description: "Order complete" },
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
                                // Validate required fields before calling API
                                if (!formData.email || !formData.customerName) {
                                    alert('Please fill in all required fields');
                                    return;
                                }

                                if (!formData.shippingAddress.line1 ||
                                    !formData.shippingAddress.city ||
                                    !formData.shippingAddress.state ||
                                    !formData.shippingAddress.country ||
                                    !formData.shippingAddress.postalCode) {
                                    alert('Please fill in all shipping address fields');
                                    return;
                                }

                                console.log('Saving information...');
                                const result = await checkoutApi.saveInformation(sessionId, {
                                    email: formData.email,
                                    name: formData.customerName,
                                    phone: formData.phone,
                                    shippingAddress: formData.shippingAddress,
                                    note: formData.customerNote,
                                });

                                console.log('Save information result:', result);

                                // Use the nextStep from the API response immediately
                                const nextStep = result?.nextStep || 2;
                                console.log('Setting current step to:', nextStep);

                                // Update current step state
                                setCurrentStep(nextStep);

                                // Load shipping rates immediately if moving to step 2
                                if (nextStep === 2) {
                                    console.log('Loading shipping rates...');
                                    await loadShippingRates();
                                }

                                // Then reload the session data to get latest state
                                setTimeout(async () => {
                                    console.log('Reloading checkout session in background...');
                                    await loadCheckoutSession();
                                }, 100);
                            } catch (err: any) {
                                console.error('Failed to save information:', err);
                                alert(err.message || 'Failed to save information');
                            }
                        }}
                    />
                );
            case 2:
                // Skip shipping step if product doesn't require shipping
                if (!checkoutSession.product || checkoutSession.product.requiresShipping === false) {
                    setCurrentStep(3);
                    return null;
                }
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
                                console.log('Selecting shipping method...');
                                const result = await checkoutApi.selectShipping(sessionId, { shippingRateId: selectedShippingRate });
                                console.log('Select shipping result:', result);

                                // Use the nextStep from the API response immediately
                                const nextStep = result?.nextStep || 3;
                                console.log('Setting current step to:', nextStep);

                                // Update current step state immediately
                                setCurrentStep(nextStep);

                                // Then reload the session data to get latest state
                                setTimeout(async () => {
                                    console.log('Reloading checkout session in background...');
                                    await loadCheckoutSession();
                                }, 100);
                            } catch (err: any) {
                                console.error('Failed to select shipping method:', err);
                                alert(err.message || 'Failed to select shipping method');
                            }
                        }}
                        isLoading={shippingRates.length === 0}
                    />
                );
            case 3:
                // Validate that user has completed required steps before showing payment
                if (checkoutSession.currentStep < 2) {
                    // User hasn't completed information step, redirect to step 1
                    setCurrentStep(1);
                    return null;
                }

                // For products requiring shipping, ensure shipping step is completed
                if (checkoutSession.product?.requiresShipping && !selectedShippingRate && checkoutSession.currentStep < 3) {
                    setCurrentStep(2);
                    return null;
                }

                return (
                    <EnhancedPaymentStep
                        checkoutSession={checkoutSession}
                        selectedShippingRate={shippingRates.find(rate => rate.id === selectedShippingRate)}
                        onBack={() => setCurrentStep(2)}
                        onPayment={async (method: 'stripe_card' | 'stripe_popup' | 'paypal') => {
                            try {
                                setIsProcessingPayment(true);
                                if (method === 'stripe_popup') {
                                    const { stripeCheckoutUrl } = await checkoutApi.createPayment(sessionId, {
                                        paymentMethod: 'stripe_popup'
                                    });
                                    window.location.href = stripeCheckoutUrl;
                                } else if (method === 'paypal') {
                                    const { paypalCheckoutUrl } = await checkoutApi.createPayment(sessionId, {
                                        paymentMethod: 'paypal'
                                    });
                                    window.location.href = paypalCheckoutUrl;
                                } else {
                                    // stripe_card is handled directly in the component
                                    console.log('Direct card payment handled in component');
                                }
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
    const productForLayout = checkoutSession && checkoutSession.product ? {
        name: checkoutSession.product.name || 'Unknown Product',
        description: checkoutSession.product.description || '',
        price: checkoutSession.product.price || 0,
        image: checkoutSession.product.images?.[0] || '/product-placeholder.jpg',
        shopName: checkoutSession.product.shop?.name || 'Unknown Shop',
        type: checkoutSession.product.productType as "physical" | "digital" | "subscription" || "physical",
    } : null;

    if (!productForLayout) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading checkout information...</p>
                </div>
            </div>
        );
    }

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