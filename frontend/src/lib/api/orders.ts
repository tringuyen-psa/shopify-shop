import api from './auth';

export interface Order {
  id: string;
  orderNumber: string;
  checkoutSessionId?: string;
  shopId: string;
  productId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;

  // Shipping address
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;

  // Shipping info
  shippingMethodName?: string;
  shippingCost: number;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;

  // Product info (snapshot)
  productName: string;
  productImage?: string;
  shopName: string;

  // Pricing
  productPrice: number;
  discountAmount: number;
  totalAmount: number;
  platformFee: number;
  shopRevenue: number;

  // Payment
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  paymentMethod: string;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Subscription (if applicable)
  subscriptionId?: string;

  // Order status
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';

  // Notes
  customerNote?: string;
  internalNote?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface CreateOrderRequest {
  orderNumber: string;
  checkoutSessionId?: string;
  shopId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;
  shippingMethodName?: string;
  shippingCost: number;
  productPrice: number;
  totalAmount: number;
  billingCycle: string;
  paymentIntentId?: string;
  customerNote?: string;
}

export interface FulfillOrderRequest {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  internalNote?: string;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  shopId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const ordersApi = {
  // Customer orders
  async getMyOrders(params?: OrdersQueryParams): Promise<{ orders: Order[], total: number, page: number, limit: number }> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrder(orderNumber: string): Promise<Order> {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data.data;
  },

  // Shop owner orders
  async getShopOrders(shopId: string, params?: OrdersQueryParams): Promise<{ orders: Order[], total: number, page: number, limit: number }> {
    const response = await api.get(`/orders/shop/${shopId}`, { params });
    // Backend returns { success: true, data: result }
    return response.data.data;
  },

  // Order management (shop owner)
  async fulfillOrder(orderId: string, data: FulfillOrderRequest): Promise<Order> {
    const response = await api.put(`/orders/${orderId}/fulfill`, data);
    return response.data.data;
  },

  async shipOrder(orderId: string, data: FulfillOrderRequest): Promise<Order> {
    const response = await api.put(`/orders/${orderId}/ship`, data);
    return response.data.data;
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  },

  async updateInternalNote(orderId: string, note: string): Promise<Order> {
    const response = await api.put(`/orders/${orderId}/note`, { internalNote: note });
    return response.data.data;
  },

  // Admin orders
  async getAllOrders(params?: OrdersQueryParams): Promise<{ orders: Order[], total: number, page: number, limit: number }> {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/admin/orders', data);
    return response.data;
  },

  async updateOrder(orderId: string, data: Partial<Order>): Promise<Order> {
    const response = await api.put(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  // Order analytics
  async getOrderStats(params?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByDay: Array<{ date: string, revenue: number, orders: number }>;
  }> {
    const response = await api.get('/orders/stats', { params });
    return response.data;
  },

  // Customer order actions
  async requestRefund(orderId: string, reason: string): Promise<{ message: string }> {
    const response = await api.post(`/orders/${orderId}/refund`, { reason });
    return response.data;
  },

  async trackOrder(orderId: string): Promise<{
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
    trackingHistory: Array<{
      timestamp: string;
      status: string;
      location?: string;
      description: string;
    }>;
  }> {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  }
};