'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  dataService,
  Order,
  OrdersQueryParams,
  FulfillOrderRequest
} from '@/services/data-service';
import {
  Package,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

export default function ShopOrdersPage() {
  const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadShopAndOrders();
    loadOrderStats();
  }, [page, statusFilter, searchTerm]);

  async function loadShopAndOrders() {
    try {
      setLoading(true);

      // Get shop info
      const shopData = await dataService.getMyShop();
      setShop(shopData);

      // Prepare query params
      const params: OrdersQueryParams = {
        page,
        limit,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      // Get shop orders
      const ordersData = await dataService.getShopOrders(shopData.id, params);
      setOrders(ordersData.orders);
      setTotal(ordersData.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // If no shop found, redirect to onboarding
      if (error instanceof Error && error.message.includes('404')) {
        router.push('/dashboard/shop/onboarding');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderStats() {
    try {
      if (!shop) return;

      const statsData = await dataService.getOrderStats({
        shopId: shop.id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endDate: new Date().toISOString()
      });
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  }

  async function handleFulfillOrder(order: Order) {
    try {
      const fulfillData: FulfillOrderRequest = {
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
        internalNote: ''
      };

      await dataService.fulfillOrder(order.id, fulfillData);
      await loadShopAndOrders(); // Refresh orders
    } catch (error) {
      console.error('Failed to fulfill order:', error);
      alert('Failed to fulfill order. Please try again.');
    }
  }

  async function handleShipOrder(order: Order, trackingData: FulfillOrderRequest) {
    try {
      await dataService.shipOrder(order.id, trackingData);
      await loadShopAndOrders(); // Refresh orders
    } catch (error) {
      console.error('Failed to ship order:', error);
      alert('Failed to ship order. Please try again.');
    }
  }

  async function handleCancelOrder(order: Order, reason: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await dataService.cancelOrder(order.id, reason);
      await loadShopAndOrders(); // Refresh orders
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'unfulfilled':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'fulfilled':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case 'shipped':
        return <Badge variant="default"><Truck className="h-3 w-3 mr-1" />Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function getPaymentStatusBadge(status: string) {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your shop orders
          </p>
        </div>
        <Button onClick={() => loadShopAndOrders()}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordersByStatus?.unfulfilled || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({total})</CardTitle>
          <CardDescription>
            Recent orders from your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here when customers make purchases.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order #</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Fulfillment</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">#{order.orderNumber}</div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate">{order.productName}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                      </td>
                      <td className="p-2">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(order.fulfillmentStatus)}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.fulfillmentStatus === 'unfulfilled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFulfillOrder(order)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {order.fulfillmentStatus === 'fulfilled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const trackingData = {
                                  trackingNumber: prompt('Enter tracking number:') || '',
                                  carrier: prompt('Enter carrier:') || '',
                                  estimatedDelivery: prompt('Enter estimated delivery (YYYY-MM-DD):') || '',
                                  internalNote: ''
                                };
                                if (trackingData.trackingNumber) {
                                  handleShipOrder(order, trackingData);
                                }
                              }}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / limit)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{selectedOrder.orderNumber}</h2>
                  <p className="text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowOrderDetails(false)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="space-y-1 text-sm">
                    <p>{selectedOrder.shippingAddressLine1}</p>
                    {selectedOrder.shippingAddressLine2 && <p>{selectedOrder.shippingAddressLine2}</p>}
                    <p>
                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                    </p>
                    <p>{selectedOrder.shippingCountry}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="font-medium">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>${selectedOrder.productPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span>-${selectedOrder.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Tracking Information</h3>
                  <div className="border rounded-lg p-4 space-y-1 text-sm">
                    <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                    <p><strong>Carrier:</strong> {selectedOrder.carrier}</p>
                    <p><strong>Estimated Delivery:</strong> {
                      selectedOrder.estimatedDelivery
                        ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString()
                        : 'N/A'
                    }</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}