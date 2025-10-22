import api from './auth';

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  platformFeePercent: number;
  isActive: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // Subscription fields
  subscriptionPlan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus' | null;
  subscriptionPrice: number;
  subscriptionPeriod: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  subscriptionActive: boolean;
  stripeSubscriptionId?: string;
}

export interface CreateShopRequest {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  compareAtPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  productType: 'physical' | 'digital';
  weight?: number;
  requiresShipping: boolean;
  downloadUrl?: string;
  downloadLimit?: number;
  trackInventory: boolean;
  inventoryQuantity: number;
  allowBackorder: boolean;
  images: string[];
  category?: string;
  tags: string[];
  isSubscription: boolean;
  trialDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sku?: string;
  shop?: Shop;
  costPerItem?: number;
  barcode?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  basePrice: number;
  compareAtPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  productType: 'physical' | 'digital';
  weight?: number;
  requiresShipping: boolean;
  downloadUrl?: string;
  downloadLimit?: number;
  trackInventory: boolean;
  inventoryQuantity: number;
  allowBackorder: boolean;
  images: string[];
  category?: string;
  tags: string[];
  isSubscription: boolean;
  trialDays: number;
  features: string[];
}

export interface ShopsQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'revenue' | 'orders';
  sortOrder?: 'asc' | 'desc';
}

export const shopsApi = {
  // Shop management
  async createShop(data: CreateShopRequest): Promise<Shop> {
    const response = await api.post('/shops', data);
    return response.data;
  },

  async getMyShop(): Promise<Shop[]> {
    const response = await api.get('/shops/my');
    return response.data;
  },

  async updateShop(shopId: string, data: UpdateShopRequest): Promise<Shop> {
    const response = await api.put(`/shops/${shopId}`, data);
    return response.data;
  },

  async getShopBySlug(slug: string): Promise<Shop> {
    const response = await api.get(`/shops/${slug}`);
    return response.data;
  },

  // Public shops listing
  async getAllShops(params?: ShopsQueryParams): Promise<{
    shops: Shop[],
    total: number,
    page: number,
    limit: number
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/shops?${queryParams.toString()}`);
    return response.data;
  },

  // Stripe Connect
  async createConnectAccount(shopId: string): Promise<{
    accountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  }> {
    const response = await api.post(`/shops/${shopId}/connect/create-account`);
    return response.data;
  },

  async startOnboarding(shopId: string): Promise<{ onboardingUrl: string; accountId: string }> {
    if (!shopId || shopId === 'undefined' || shopId === 'null') {
      throw new Error('Invalid shop ID provided');
    }
    const response = await api.post(`/shops/${shopId}/connect/onboard`);
    return response.data;
  },

  async createKYCLink(shopId: string): Promise<{ kycUrl: string; accountId: string }> {
    if (!shopId || shopId === 'undefined' || shopId === 'null') {
      throw new Error('Invalid shop ID provided');
    }
    const response = await api.post(`/shops/${shopId}/connect/kyc`);
    return response.data;
  },

  async getConnectStatus(shopId: string): Promise<{
    accountId?: string;
    onboardingComplete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  }> {
    const response = await api.get(`/shops/${shopId}/connect/status`);
    return response.data;
  },

  async refreshOnboarding(shopId: string): Promise<{ onboardingUrl: string }> {
    const response = await api.post(`/shops/${shopId}/connect/refresh`);
    return response.data;
  },

  async getDashboardLink(shopId: string): Promise<{ dashboardUrl: string }> {
    if (!shopId || shopId === 'undefined' || shopId === 'null') {
      throw new Error('Invalid shop ID provided');
    }
    const response = await api.get(`/shops/${shopId}/connect/dashboard`);
    return response.data;
  },

  // Products
  async getShopProducts(shopId: string): Promise<Product[]> {
    const response = await api.get(`/shops/${shopId}/products`);
    return response.data;
  },

  async createProduct(shopId: string, data: CreateProductRequest): Promise<Product> {
    const response = await api.post(`/shops/${shopId}/products`, data);
    return response.data;
  },

  async updateProduct(productId: string, data: Partial<CreateProductRequest>): Promise<Product> {
    const response = await api.put(`/products/${productId}`, data);
    return response.data;
  },

  async deleteProduct(productId: string): Promise<void> {
    await api.delete(`/products/${productId}`);
  },

  async getProduct(productId: string): Promise<Product> {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  async getProductBySlug(productSlug: string): Promise<Product> {
    const response = await api.get(`/products/slug/${productSlug}`);
    return response.data;
  },

  // Subscription management
  async getSubscriptionPlans(): Promise<{
    plans: Array<{
      id: string;
      name: string;
      price: number;
      period: string;
      description: string;
      features: string[];
    }>;
  }> {
    const response = await api.get('/shops/subscriptions/plans');
    return response.data;
  },

  async updateSubscription(shopId: string, data: {
    plan: 'basic' | 'shopify' | 'advanced' | 'shopify_plus';
    price: number;
    period: string;
    stripeSubscriptionId?: string;
  }): Promise<{ message: string; shop: Shop }> {
    // Ensure we only send the fields that are expected by the DTO
    const requestData = {
      plan: data.plan,
      price: data.price,
      period: data.period,
      ...(data.stripeSubscriptionId && { stripeSubscriptionId: data.stripeSubscriptionId }),
    };

    const response = await api.post(`/shops/${shopId}/subscription/update`, requestData);
    return response.data;
  },

  async cancelSubscription(shopId: string): Promise<{ message: string; shop: Shop }> {
    const response = await api.post(`/shops/${shopId}/subscription/cancel`);
    return response.data;
  },
};