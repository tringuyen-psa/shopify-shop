'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { ProductForm } from '@/components/shop/products/ProductForm';
import { dataService } from '@/services/data-service';
import { Product } from '@/services/data-service';
import {
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
  const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShop();
  }, []);

  async function loadShop() {
    try {
      const shopData = await dataService.getMyShop();
      setShop(shopData);
    } catch (error) {
      console.error('Failed to load shop:', error);
      // If no shop found, redirect to onboarding
      router.push('/dashboard/shop/onboarding');
    } finally {
      setLoading(false);
    }
  }

  async function handleProductCreated(product: Product) {
    // Navigate to the products list after successful creation
    router.push('/dashboard/shop/products');
  }

  function handleCancel() {
    // Navigate back to products list
    router.push('/dashboard/shop/products');
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

  if (!shop) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-gray-600 mb-4">You need to set up your shop first before creating products.</p>
          <Button onClick={() => router.push('/dashboard/shop/onboarding')}>
            Set Up Your Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/shop/products')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Plus className="h-8 w-8 mr-3" />
              Create New Product
            </h1>
            <p className="text-muted-foreground">
              Add a new product to your shop catalog
            </p>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <ProductForm
        shopId={shop.id}
        onSuccess={handleProductCreated}
        onCancel={handleCancel}
      />
    </div>
  );
}