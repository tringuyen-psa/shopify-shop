import api from './auth';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'shop_owner' | 'platform_admin';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  shopCount?: number;
  orderCount?: number;
  totalSpent?: number;
}

export interface AdminShop {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;

  // Stripe Connect
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;

  // Platform settings
  platformFeePercent: number;
  isActive: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';

  // Statistics
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  subscriptionCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  // User stats
  totalUsers: number;
  totalCustomers: number;
  totalShopOwners: number;
  totalAdmins: number;
  newUsersThisMonth: number;

  // Shop stats
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  newShopsThisMonth: number;

  // Order stats
  totalOrders: number;
  ordersToday: number;
  ordersThisMonth: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  // Revenue stats
  totalRevenue: number;
  totalPlatformFees: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;

  // Subscription stats
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
}

export interface PlatformSettings {
  defaultPlatformFee: number;
  minPlatformFee: number;
  maxPlatformFee: number;
  stripePlatformAccountId: string;
  checkoutSessionExpiryHours: number;
  supportedCountries: string[];
  supportedCurrencies: string[];
  autoApproveShops: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: 'active' | 'inactive';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ShopsQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'name' | 'createdAt' | 'revenue' | 'orders';
  sortOrder?: 'asc' | 'desc';
}

export const adminApi = {
  // Dashboard analytics
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getRevenueChart(period: 'week' | 'month' | 'year'): Promise<{
    dates: string[];
    revenue: number[];
    platformFees: number[];
    orders: number[];
  }> {
    const response = await api.get('/admin/revenue-chart', { params: { period } });
    return response.data;
  },

  // User management
  async getUsers(params?: UsersQueryParams): Promise<{
    users: AdminUser[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async getUser(userId: string): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUserRole(userId: string, role: 'customer' | 'shop_owner' | 'platform_admin'): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  // Shop management
  async getShops(params?: ShopsQueryParams): Promise<{
    shops: AdminShop[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/shops', { params });
    return response.data;
  },

  async getShop(shopId: string): Promise<AdminShop> {
    const response = await api.get(`/admin/shops/${shopId}`);
    return response.data;
  },

  async approveShop(shopId: string): Promise<AdminShop> {
    const response = await api.put(`/admin/shops/${shopId}/approve`);
    return response.data;
  },

  async rejectShop(shopId: string, reason: string): Promise<AdminShop> {
    const response = await api.put(`/admin/shops/${shopId}/reject`, { reason });
    return response.data;
  },

  async suspendShop(shopId: string, reason: string): Promise<AdminShop> {
    const response = await api.put(`/admin/shops/${shopId}/suspend`, { reason });
    return response.data;
  },

  async updateShopFee(shopId: string, platformFeePercent: number): Promise<AdminShop> {
    const response = await api.put(`/admin/shops/${shopId}/fee`, { platformFeePercent });
    return response.data;
  },

  async deleteShop(shopId: string): Promise<void> {
    await api.delete(`/admin/shops/${shopId}`);
  },

  // Platform settings
  async getPlatformSettings(): Promise<PlatformSettings> {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Admin authentication
  async createAdminUser(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<AdminUser> {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  async resetUserPassword(userId: string): Promise<{ temporaryPassword: string }> {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  // Order management (admin override)
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    shopId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    orders: any[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async getOrderDetails(orderId: string): Promise<any> {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId: string, data: {
    paymentStatus?: string;
    fulfillmentStatus?: string;
    internalNote?: string;
  }): Promise<any> {
    const response = await api.put(`/admin/orders/${orderId}`, data);
    return response.data;
  },

  // Revenue and analytics
  async getTopShops(limit: number = 10): Promise<Array<{
    shopId: string;
    shopName: string;
    revenue: number;
    orders: number;
    products: number;
  }>> {
    const response = await api.get('/admin/top-shops', { params: { limit } });
    return response.data;
  },

  async getTopProducts(limit: number = 10): Promise<Array<{
    productId: string;
    productName: string;
    shopName: string;
    revenue: number;
    orders: number;
  }>> {
    const response = await api.get('/admin/top-products', { params: { limit } });
    return response.data;
  },

  // System health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    database: { status: string; responseTime: number };
    stripe: { status: string; responseTime: number };
    storage: { used: number; total: number };
    uptime: number;
    version: string;
  }> {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // Export data
  async exportUsers(params?: UsersQueryParams): Promise<Blob> {
    const response = await api.get('/admin/export/users', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportShops(params?: ShopsQueryParams): Promise<Blob> {
    const response = await api.get('/admin/export/shops', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async exportOrders(params?: any): Promise<Blob> {
    const response = await api.get('/admin/export/orders', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};