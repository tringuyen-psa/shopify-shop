"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Package, Mail, RefreshCw } from "lucide-react";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    createdAt: string;
    paymentMethod: string;
    paymentStatus: string;
    customer: {
        name: string;
        email: string;
        shippingAddress: {
            line1: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
    };
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
        image?: string;
        productType: 'physical' | 'digital' | 'subscription';
        shopName: string;
    }>;
}

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId) {
            loadOrderDetails(sessionId);
        } else {
            // Show a generic success page if no session ID
            setLoading(false);
        }
    }, [sessionId]);

    async function loadOrderDetails(sessionId: string) {
        try {
            setLoading(true);
            const response = await fetch(`orders/confirm?session_id=${sessionId}`);

            if (!response.ok) {
                throw new Error('Failed to load order details');
            }

            const orderData = await response.json();
            setOrder(orderData);
        } catch (err: any) {
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    // Generic success page when no order data is available
    if (!order || error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            {error ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">{error}</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600">
                                        Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                                    </p>

                                    <div className="bg-gray-50 p-4 rounded-md text-left">
                                        <h4 className="font-medium mb-2">Order Details</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Order Number:</span>
                                                <span className="font-medium">Processing...</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date:</span>
                                                <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-3 pt-4">
                                <Button className="w-full" onClick={() => window.location.href = '/dashboard/customer'}>
                                    <Package className="w-4 h-4 mr-2" />
                                    View Order History
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Continue Shopping
                                </Button>
                            </div>

                            <div className="text-sm text-gray-500 pt-4 border-t">
                                <p>A confirmation email has been sent to your registered email address.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Detailed order confirmation page
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: order.currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center space-y-4 mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-lg text-gray-600">
                            Thank you for your purchase. Your order has been successfully placed.
                        </p>
                    </div>
                </div>

                {/* Order Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h3 className="font-medium text-sm">Order Number</h3>
                            <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h3 className="font-medium text-sm">Payment Status</h3>
                            <p className="text-lg font-bold text-green-600 capitalize">{order.paymentStatus}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h3 className="font-medium text-sm">Confirmation Email</h3>
                            <p className="text-sm text-gray-600">Sent to {order.customer.email}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Order Details</span>
                            <Badge variant="outline" className="capitalize">
                                {order.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer Information */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                                <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                                <p><span className="font-medium">Shipping Address:</span></p>
                                <p className="ml-4">
                                    {order.customer.shippingAddress.line1},<br />
                                    {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state} {order.customer.shippingAddress.postalCode}<br />
                                    {order.customer.shippingAddress.country}
                                </p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500 mb-2">{item.shopName}</p>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="secondary">
                                                    {item.productType === 'physical' ? 'Physical Product' :
                                                        item.productType === 'digital' ? 'Digital Product' : 'Subscription'}
                                                </Badge>
                                                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Price Breakdown</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.totalAmount * 0.87)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Platform Fee (13%)</span>
                                    <span>{formatCurrency(order.totalAmount * 0.13)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                                <p><span className="font-medium">Status:</span> {order.paymentStatus}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Button size="lg" onClick={() => window.location.href = '/dashboard/customer'}>
                        <Package className="w-4 h-4 mr-2" />
                        View Order History
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Button>
                </div>

                {/* Email Confirmation Note */}
                <div className="text-center text-sm text-gray-500 mt-8">
                    <p>A confirmation email has been sent to {order.customer.email}</p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}