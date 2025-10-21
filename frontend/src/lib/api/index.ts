// Re-export all API modules
export { authApi } from "./auth";
export type { User, AuthResponse } from "./auth";
export { shopsApi } from "./shops";
export type { Shop, CreateShopRequest, UpdateShopRequest } from "./shops";
export { productsAPI as productsApi } from "./products";
export type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
} from "./products";
export { ordersApi } from "./orders";
export type {
  Order,
  CreateOrderRequest,
  FulfillOrderRequest,
  OrdersQueryParams,
} from "./orders";
export { subscriptionsApi } from "./subscriptions";
export type {
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "./subscriptions";
export { checkoutApi } from "./checkout";
export type { CheckoutSession, CreateCheckoutSessionRequest } from "./checkout";

// Base API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shopify-shop-api.vercel.app";

// Common error handler
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// API Response wrapper for consistent handling
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// Utility function to handle API responses consistently
export function handleApiResponse<T>(response: any): ApiResponse<T> {
  return {
    data: response.data,
    message: response.message,
    status: response.status || 200,
    success: response.status < 400,
  };
}
