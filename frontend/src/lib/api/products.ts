import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description: string;
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
  shop?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  productType: 'physical' | 'digital';
  weight?: number;
  requiresShipping?: boolean;
  downloadUrl?: string;
  downloadLimit?: number;
  trackInventory?: boolean;
  inventoryQuantity?: number;
  allowBackorder?: boolean;
  images: string[];
  category?: string;
  tags?: string[];
  isSubscription?: boolean;
  trialDays?: number;
  features?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFilters {
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  productType?: 'physical' | 'digital';
  isSubscription?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

class ProductsAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get all products (public)
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.isSubscription !== undefined) params.append('isSubscription', filters.isSubscription.toString());
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tags) params.append('tags', filters.tags.join(','));

      const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID (public)
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get product by slug (public)
  async getProductBySlug(productSlug: string): Promise<Product> {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/slug/${productSlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get products by shop ID (public)
  async getProductsByShopId(shopId: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.isSubscription !== undefined) params.append('isSubscription', filters.isSubscription.toString());
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tags) params.append('tags', filters.tags.join(','));

      const response = await axios.get(`${API_BASE_URL}/shops/${shopId}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shop products:', error);
      throw error;
    }
  }

  // Get products by shop slug (public)
  async getProductsByShopSlug(shopSlug: string, filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.productType) params.append('productType', filters.productType);
      if (filters?.isSubscription !== undefined) params.append('isSubscription', filters.isSubscription.toString());
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.tags) params.append('tags', filters.tags.join(','));

      const response = await axios.get(`${API_BASE_URL}/shops/${shopSlug}/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shop products:', error);
      throw error;
    }
  }

  // Create product (shop owner only)
  async createProduct(shopId: string, productData: CreateProductDto): Promise<Product> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/shops/${shopId}/products`,
        productData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product (shop owner only)
  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/products/${id}`,
        productData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product (shop owner only)
  async deleteProduct(id: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/products/${id}`,
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Upload product image
  async uploadImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_BASE_URL}/products/upload-image`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export const productsAPI = new ProductsAPI();