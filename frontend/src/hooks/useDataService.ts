import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/services/data-service';
import type {
  Product,
  Shop,
  User,
  ProductFilters,
  CreateProductDto,
  UpdateProductDto
} from '@/services/data-service';

// Generic hook for data fetching with loading and error states
export function useDataService<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Data fetching error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Specific hooks for different data types
export function useCurrentUser() {
  return useDataService(() => dataService.getCurrentUser(), []);
}

export function useShop(shopSlug: string) {
  return useDataService(() => dataService.getShopBySlug(shopSlug), [shopSlug]);
}

export function useMyShop() {
  return useDataService(() => dataService.getMyShop(), []);
}

export function useShopProducts(shopId: string) {
  return useDataService(() => dataService.getShopProducts(shopId), [shopId]);
}

export function useProduct(productId: string) {
  return useDataService(() => dataService.getProductById(productId), [productId]);
}

export function useProducts(filters?: ProductFilters) {
  return useDataService(
    () => dataService.getProducts(filters),
    [JSON.stringify(filters)]
  );
}

export function useShopProductsData(shopSlug: string, filters?: ProductFilters) {
  return useDataService(
    () => dataService.getProductsByShopSlug(shopSlug, filters),
    [shopSlug, JSON.stringify(filters)]
  );
}

export function useShopWithProductCount(shopSlug: string) {
  return useDataService(
    () => dataService.getShopWithProductCount(shopSlug),
    [shopSlug]
  );
}

export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: ProductFilters) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      const products = await dataService.searchProducts(query, filters);
      setResults(products);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchError(null);
  }, []);

  return {
    results,
    searching,
    searchError,
    search,
    clearResults
  };
}

// Hook for mutations (create, update, delete)
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(params);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Operation failed');
      console.error('Mutation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
}

// Specific mutation hooks
export function useCreateProduct() {
  return useMutation((params: { shopId: string; productData: CreateProductDto }) =>
    dataService.createProduct(params.shopId, params.productData)
  );
}

export function useUpdateProduct() {
  return useMutation((params: { id: string; productData: UpdateProductDto }) =>
    dataService.updateProduct(params.id, params.productData)
  );
}

export function useDeleteProduct() {
  return useMutation((productId: string) =>
    dataService.deleteProduct(productId)
  );
}

export function useCreateShop() {
  return useMutation((shopData: any) =>
    dataService.createShop(shopData)
  );
}

export function useUpdateShop() {
  return useMutation((params: { shopId: string; shopData: any }) =>
    dataService.updateShop(params.shopId, params.shopData)
  );
}

export function useUpdateProfile() {
  return useMutation((profileData: { name?: string; phone?: string }) =>
    dataService.updateProfile(profileData)
  );
}

export function useUploadProductImage() {
  return useMutation((file: File) =>
    dataService.uploadProductImage(file)
  );
}

// Hook for real-time data validation
export function useShopAccessValidation(shopId: string) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setValidating(true);
        const access = await dataService.validateShopAccess(shopId);
        setHasAccess(access);
      } catch (error) {
        setHasAccess(false);
      } finally {
        setValidating(false);
      }
    };

    if (shopId) {
      validateAccess();
    }
  }, [shopId]);

  return { hasAccess, validating };
}