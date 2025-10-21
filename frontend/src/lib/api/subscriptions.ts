import api from './auth';

export interface Subscription {
  id: string;
  orderId: string;
  productId: string;
  shopId: string;
  customerId: string;

  // Product info (snapshot)
  productName: string;
  productImage?: string;
  shopName: string;

  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;

  // Billing
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  amount: number;
  platformFee: number;
  shopRevenue: number;

  // Shipping (for physical subscriptions)
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;
  shippingCost: number;

  // Status
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;

  // Renewal count
  renewalCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  nextBillingDate: string;
}

export interface CreateSubscriptionRequest {
  orderId: string;
  productId: string;
  shopId: string;
  customerId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  billingCycle: string;
  amount: number;
  platformFee: number;
  shopRevenue: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingCost: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface UpdateSubscriptionRequest {
  billingCycle?: 'weekly' | 'monthly' | 'yearly';
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface SubscriptionsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  shopId?: string;
  customerId?: string;
  billingCycle?: string;
}

export const subscriptionsApi = {
  // Customer subscriptions
  async getMySubscriptions(params?: SubscriptionsQueryParams): Promise<{
    subscriptions: Subscription[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/subscriptions', { params });
    return response.data;
  },

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const response = await api.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, { cancelAtPeriodEnd });
    return response.data;
  },

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${subscriptionId}/resume`);
    return response.data;
  },

  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionRequest): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${subscriptionId}`, data);
    return response.data;
  },

  async changeSubscriptionPlan(subscriptionId: string, newBillingCycle: 'weekly' | 'monthly' | 'yearly'): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${subscriptionId}/plan`, { billingCycle: newBillingCycle });
    return response.data;
  },

  async updateSubscriptionAddress(subscriptionId: string, address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${subscriptionId}/address`, { shippingAddress: address });
    return response.data;
  },

  // Shop owner subscriptions
  async getShopSubscriptions(shopId: string, params?: SubscriptionsQueryParams): Promise<{
    subscriptions: Subscription[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get(`/shops/${shopId}/subscriptions`, { params });
    return response.data;
  },

  // Admin subscriptions
  async getAllSubscriptions(params?: SubscriptionsQueryParams): Promise<{
    subscriptions: Subscription[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/subscriptions', { params });
    return response.data;
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    const response = await api.post('/admin/subscriptions', data);
    return response.data;
  },

  async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<Subscription> {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}/status`, { status });
    return response.data;
  },

  // Subscription analytics
  async getSubscriptionStats(params?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    monthlyRecurringRevenue: number;
    churnRate: number;
    subscriptionsByBillingCycle: Record<string, number>;
    newSubscriptionsByMonth: Array<{ month: string, count: number }>;
    cancellationsByMonth: Array<{ month: string, count: number }>;
  }> {
    const response = await api.get('/subscriptions/stats', { params });
    return response.data;
  },

  // Subscription management
  async pauseSubscription(subscriptionId: string, pauseUntil?: string): Promise<Subscription> {
    const response = await api.post(`/subscriptions/${subscriptionId}/pause`, { pauseUntil });
    return response.data;
  },

  async getSubscriptionUpcomingInvoice(subscriptionId: string): Promise<{
    amount: number;
    date: string;
    items: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
  }> {
    const response = await api.get(`/subscriptions/${subscriptionId}/upcoming-invoice`);
    return response.data;
  },

  async getSubscriptionInvoices(subscriptionId: string): Promise<Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    downloadUrl?: string;
  }>> {
    const response = await api.get(`/subscriptions/${subscriptionId}/invoices`);
    return response.data;
  }
};