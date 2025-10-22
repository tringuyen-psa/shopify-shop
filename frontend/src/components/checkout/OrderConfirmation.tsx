'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, Mail, Phone, MapPin, Download, RefreshCw } from 'lucide-react';

interface OrderConfirmationProps {
  order: {
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
      phone?: string;
      shippingAddress: {
        line1: string;
        line2?: string;
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
    shipping?: {
      method: string;
      cost: number;
      estimatedDelivery: string;
      trackingNumber?: string;
    };
    downloads?: Array<{
      id: string;
      name: string;
      url: string;
      expiryDate?: string;
    }>;
  };
  onContinueShopping: () => void;
  onViewOrderHistory: () => void;
}

export default function OrderConfirmation({
  order,
  onContinueShopping,
  onViewOrderHistory
}: OrderConfirmationProps) {
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

  const isDigitalProduct = order.items.some(item => item.productType === 'digital');
  const isSubscription = order.items.some(item => item.productType === 'subscription');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                {order.customer.phone && (
                  <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm">
                <p>{order.customer.shippingAddress.line1}</p>
                {order.customer.shippingAddress.line2 && <p>{order.customer.shippingAddress.line2}</p>}
                <p>
                  {order.customer.shippingAddress.city}, {order.customer.shippingAddress.state} {order.customer.shippingAddress.postalCode}
                </p>
                <p>{order.customer.shippingAddress.country}</p>
              </div>
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
                    {item.productType === 'subscription' && (
                      <p className="text-xs text-gray-500">Recurring</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          {order.shipping && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Shipping Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Method:</span> {order.shipping.method}</p>
                    <p><span className="font-medium">Cost:</span> {formatCurrency(order.shipping.cost)}</p>
                    <p><span className="font-medium">Estimated Delivery:</span> {order.shipping.estimatedDelivery}</p>
                  </div>
                  <div>
                    {order.shipping.trackingNumber && (
                      <p>
                        <span className="font-medium">Tracking Number:</span>{' '}
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          {order.shipping.trackingNumber}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Digital Downloads */}
          {isDigitalProduct && order.downloads && order.downloads.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Digital Downloads
              </h3>
              <div className="space-y-2">
                {order.downloads.map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{download.name}</p>
                      {download.expiryDate && (
                        <p className="text-xs text-blue-700">
                          Download expires: {formatDate(download.expiryDate)}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={download.url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can also access your downloads from your account dashboard.
              </p>
            </div>
          )}

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
              {order.shipping && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping.cost)}</span>
                </div>
              )}
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                  <p><span className="font-medium">Status:</span> {order.paymentStatus}</p>
                </div>
                <div>
                  <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isSubscription && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Subscription Information</h4>
                <p className="text-sm text-blue-800">
                  You will be charged {formatCurrency(order.totalAmount)} per billing cycle until you cancel.
                  You can manage or cancel your subscription from your account dashboard at any time.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Updates
                </h4>
                <p className="text-sm text-gray-600">
                  You'll receive email updates about your order status and shipping.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Order Management
                </h4>
                <p className="text-sm text-gray-600">
                  Track your order and manage returns from your account dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={onViewOrderHistory}>
          View Order History
        </Button>
        <Button size="lg" variant="outline" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}