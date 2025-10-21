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

export const shopsApi = {
  // Shop management
  async createShop(data: CreateShopRequest): Promise<Shop> {
    const response = await api.post('/shops', data);
    return response.data;
  },

  async getMyShop(): Promise<Shop> {
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

  // Stripe Connect
  async startOnboarding(shopId: string): Promise<{ onboardingUrl: string }> {
    const response = await api.post(`/shops/${shopId}/connect/onboard`);
    return response.data;
  },

  async getConnectStatus(shopId: string): Promise<{
    stripeAccountId?: string;
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
    const response = await api.get(`/shops/${shopId}/dashboard`);
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
};