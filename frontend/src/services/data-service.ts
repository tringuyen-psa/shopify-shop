import {
  productsApi,
  shopsApi,
  authApi,
  ordersApi,
  subscriptionsApi,
  checkoutApi,
  Product,
  Shop,
  User,
  Order,
  ProductFilters,
  CreateProductDto,
  UpdateProductDto,
  CreateShopRequest,
  UpdateShopRequest,
  Subscription,
  CheckoutSession,
  OrdersQueryParams,
  FulfillOrderRequest,
  ShopsQueryParams
} from '@/lib/api';

import type { AuthResponse } from '@/lib/api/auth';

// Re-export authApi and types for components that need them
export { authApi };
export type { AuthResponse };

/**
 * Central data service that ensures all data comes from API
 * This prevents direct database access or hardcoded data
 */
class DataService {

  // USER DATA SERVICES
  async getCurrentUser(): Promise<User> {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }

  async updateProfile(data: { name?: string; phone?: string }): Promise<User> {
    try {
      const updatedUser = await authApi.updateProfile(data);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // SHOP DATA SERVICES
  async getAllShops(params?: ShopsQueryParams): Promise<{
    shops: Shop[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const shops = await shopsApi.getAllShops(params);
      return shops;
    } catch (error) {
      console.error('Failed to fetch all shops:', error);
      throw error;
    }
  }

  async getShopBySlug(slug: string): Promise<Shop> {
    try {
      const shop = await shopsApi.getShopBySlug(slug);
      return shop;
    } catch (error) {
      console.error('Failed to fetch shop:', error);
      throw error;
    }
  }

  async getMyShop(): Promise<Shop> {
    try {
      const shop = await shopsApi.getMyShop();
      return shop;
    } catch (error) {
      console.error('Failed to fetch my shop:', error);
      throw error;
    }
  }

  async createShop(data: CreateShopRequest): Promise<Shop> {
    try {
      // Backend will auto-generate slug from shop ID
      const shop = await shopsApi.createShop(data);
      return shop;
    } catch (error) {
      console.error('Failed to create shop:', error);
      throw error;
    }
  }

  async updateShop(shopId: string, data: UpdateShopRequest): Promise<Shop> {
    try {
      const shop = await shopsApi.updateShop(shopId, data);
      return shop;
    } catch (error) {
      console.error('Failed to update shop:', error);
      throw error;
    }
  }

  async getShopProducts(shopId: string): Promise<Product[]> {
    try {
      // Handle special case where 'current' means the current user's shop
      if (shopId === 'current') {
        const myShop = await this.getMyShop();
        shopId = myShop.slug; // Use slug instead of ID for backend API
      }

      const products = await shopsApi.getShopProducts(shopId);
      return products as Product[];
    } catch (error) {
      console.error('Failed to fetch shop products:', error);
      throw error;
    }
  }

  // PRODUCT DATA SERVICES
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const products = await productsApi.getProducts(filters);
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const product = await productsApi.getProductById(id);
      return product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }

  async getProductByShopAndProductSlug(shopSlug: string, productSlug: string): Promise<Product> {
    try {
      const product = await productsApi.getProductBySlug(productSlug);
      return product;
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }

  async getProductsByShopId(shopId: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const products = await productsApi.getProductsByShopId(shopId, filters);
      return products;
    } catch (error) {
      console.error('Failed to fetch products by shop:', error);
      throw error;
    }
  }

  async getProductsByShopSlug(shopSlug: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const products = await productsApi.getProductsByShopSlug(shopSlug, filters);
      return products;
    } catch (error) {
      console.error('Failed to fetch products by shop slug:', error);
      throw error;
    }
  }

  async createProduct(shopId: string, productData: CreateProductDto): Promise<Product> {
    try {
      const product = await productsApi.createProduct(shopId, productData);
      return product;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    try {
      const product = await productsApi.updateProduct(id, productData);
      return product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await productsApi.deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  async uploadProductImage(file: File): Promise<{ url: string }> {
    try {
      const result = await productsApi.uploadImage(file);
      return result;
    } catch (error) {
      console.error('Failed to upload product image:', error);
      throw error;
    }
  }

  // SUBSCRIPTION DATA SERVICES
  async getMySubscriptions(customerId?: string): Promise<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const subscriptions = await subscriptionsApi.getMySubscriptions();
      return subscriptions;
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      throw error;
    }
  }

  async getSubscription(id: string): Promise<Subscription> {
    try {
      const subscription = await subscriptionsApi.getSubscription(id);
      return subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(id: string, cancelAtPeriodEnd?: boolean): Promise<Subscription> {
    try {
      const subscription = await subscriptionsApi.cancelSubscription(id, cancelAtPeriodEnd);
      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // CHECKOUT DATA SERVICES
  async createCheckoutSession(data: {
    productId: string;
    billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
    quantity?: number;
  }): Promise<CheckoutSession> {
    try {
      const session = await checkoutApi.createSession(data);
      return session;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    try {
      const session = await checkoutApi.getSession(sessionId);
      return session;
    } catch (error) {
      console.error('Failed to fetch checkout session:', error);
      throw error;
    }
  }

  async saveCheckoutInformation(sessionId: string, data: {
    email: string;
    name: string;
    phone?: string;
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    note?: string;
  }): Promise<CheckoutSession> {
    try {
      const session = await checkoutApi.saveInformation(sessionId, data);
      return session;
    } catch (error) {
      console.error('Failed to save checkout information:', error);
      throw error;
    }
  }

  async selectShipping(sessionId: string, shippingRateId: string): Promise<CheckoutSession> {
    try {
      const session = await checkoutApi.selectShipping(sessionId, { shippingRateId });
      return session;
    } catch (error) {
      console.error('Failed to select shipping:', error);
      throw error;
    }
  }

  async createPayment(sessionId: string, paymentMethod: string): Promise<CheckoutSession> {
    try {
      const session = await checkoutApi.createPayment(sessionId, { paymentMethod });
      return session;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  }

  async calculateShipping(sessionId: string): Promise<{ rates: any[] }> {
    try {
      const shipping = await checkoutApi.calculateShipping(sessionId);
      return shipping;
    } catch (error) {
      console.error('Failed to calculate shipping:', error);
      throw error;
    }
  }

  // ORDERS DATA SERVICES
  async getShopOrders(shopId: string, params?: OrdersQueryParams): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const orders = await ordersApi.getShopOrders(shopId, params);
      return orders;
    } catch (error) {
      console.error('Failed to fetch shop orders:', error);
      throw error;
    }
  }

  async getMyOrders(params?: OrdersQueryParams): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const orders = await ordersApi.getMyOrders(params);
      return orders;
    } catch (error) {
      console.error('Failed to fetch my orders:', error);
      throw error;
    }
  }

  async getOrder(orderNumber: string): Promise<Order> {
    try {
      const order = await ordersApi.getOrder(orderNumber);
      return order;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw error;
    }
  }

  async fulfillOrder(orderId: string, data: FulfillOrderRequest): Promise<Order> {
    try {
      const order = await ordersApi.fulfillOrder(orderId, data);
      return order;
    } catch (error) {
      console.error('Failed to fulfill order:', error);
      throw error;
    }
  }

  async shipOrder(orderId: string, data: FulfillOrderRequest): Promise<Order> {
    try {
      const order = await ordersApi.shipOrder(orderId, data);
      return order;
    } catch (error) {
      console.error('Failed to ship order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await ordersApi.cancelOrder(orderId, reason);
      return order;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  async updateInternalNote(orderId: string, note: string): Promise<Order> {
    try {
      const order = await ordersApi.updateInternalNote(orderId, note);
      return order;
    } catch (error) {
      console.error('Failed to update internal note:', error);
      throw error;
    }
  }

  async getOrderStats(params?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  }> {
    try {
      const stats = await ordersApi.getOrderStats(params);
      return stats;
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw error;
    }
  }

  // UTILITY METHODS
  async validateShopAccess(shopId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const shop = await this.getShopBySlug(shopId);

      // Check if user owns the shop or is admin
      return shop.ownerId === user.id || user.role === 'platform_admin';
    } catch (error) {
      console.error('Failed to validate shop access:', error);
      return false;
    }
  }

  async getShopWithProductCount(shopSlug: string): Promise<{ shop: Shop; productCount: number }> {
    try {
      const [shop, products] = await Promise.all([
        this.getShopBySlug(shopSlug),
        this.getShopProducts(shopSlug)
      ]);

      return {
        shop,
        productCount: products.length
      };
    } catch (error) {
      console.error('Failed to fetch shop with product count:', error);
      throw error;
    }
  }

  async searchProducts(query: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const searchFilters: ProductFilters = {
        ...filters,
        search: query
      };

      const products = await this.getProducts(searchFilters);
      return products;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export types
export type {
  Product,
  Shop,
  User,
  Order,
  ProductFilters,
  CreateProductDto,
  UpdateProductDto,
  CreateShopRequest,
  UpdateShopRequest,
  Subscription,
  CheckoutSession,
  OrdersQueryParams,
  FulfillOrderRequest,
  ShopsQueryParams
};