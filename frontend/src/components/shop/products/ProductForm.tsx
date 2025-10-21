'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CreateProductDto, Product } from '@/services/data-service';
import { useCreateProduct, useUpdateProduct, useUploadProductImage } from '@/hooks/useDataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ProductFormProps {
  shopId: string;
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export function ProductForm({ shopId, product, onSuccess, onCancel }: ProductFormProps) {
  const router = useRouter();

  // Use hooks for API operations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadProductImage();

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Combine loading states
  const isAnyMutationLoading = createProductMutation.loading || updateProductMutation.loading || uploadImageMutation.loading;
  const [formData, setFormData] = useState<CreateProductDto>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    basePrice: product?.basePrice || 0,
    compareAtPrice: product?.compareAtPrice || 0,
    weeklyPrice: product?.weeklyPrice || 0,
    monthlyPrice: product?.monthlyPrice || 0,
    yearlyPrice: product?.yearlyPrice || 0,
    productType: product?.productType || 'physical',
    weight: product?.weight || 0,
    requiresShipping: product?.requiresShipping ?? true,
    downloadUrl: product?.downloadUrl || '',
    downloadLimit: product?.downloadLimit || 0,
    trackInventory: product?.trackInventory || false,
    inventoryQuantity: product?.inventoryQuantity || 0,
    allowBackorder: product?.allowBackorder || false,
    images: product?.images || [],
    category: product?.category || '',
    tags: product?.tags || [],
    isSubscription: product?.isSubscription || false,
    trialDays: product?.trialDays || 0,
    features: product?.features || [],
  });

  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (!formData.slug && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result: Product;

      if (product) {
        result = await updateProductMutation.mutate({ id: product.id, productData: formData });
      } else {
        result = await createProductMutation.mutate({ shopId, productData: formData });
      }

      onSuccess?.(result);
      router.push(`/dashboard/shop/products/${result.id}`);
    } catch (error) {
      console.error('Error saving product:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageMutation.mutate(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map((result: any) => result.url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      // TODO: Show error toast
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features?.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-1">
                  Slug *
                </label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="product-slug"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly version of the name
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Electronics, Clothing, Books"
              />
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Type</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type *
              </label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  productType: e.target.value as 'physical' | 'digital',
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="physical">Physical Product</option>
                <option value="digital">Digital Product</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isSubscription}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSubscription: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium">Enable Subscription</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Images</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8m-12 4h.02M16 12h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span>Choose files</span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
                  Base Price ($) *
                </label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium mb-1">
                  Compare At Price ($)
                </label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              {formData.isSubscription && (
                <>
                  <div>
                    <label htmlFor="weeklyPrice" className="block text-sm font-medium mb-1">
                      Weekly Price ($)
                    </label>
                    <Input
                      id="weeklyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weeklyPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, weeklyPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="monthlyPrice" className="block text-sm font-medium mb-1">
                      Monthly Price ($)
                    </label>
                    <Input
                      id="monthlyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="yearlyPrice" className="block text-sm font-medium mb-1">
                      Yearly Price ($)
                    </label>
                    <Input
                      id="yearlyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.yearlyPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="trialDays" className="block text-sm font-medium mb-1">
                      Trial Days
                    </label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      value={formData.trialDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shipping & Inventory (Physical Products) */}
          {formData.productType === 'physical' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping & Inventory</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium mb-1">
                    Weight (kg)
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={formData.requiresShipping}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresShipping: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Requires Shipping</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={formData.trackInventory}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackInventory: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Track Inventory</span>
                  </label>
                </div>

                {formData.trackInventory && (
                  <>
                    <div>
                      <label htmlFor="inventoryQuantity" className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <Input
                        id="inventoryQuantity"
                        type="number"
                        min="0"
                        value={formData.inventoryQuantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, inventoryQuantity: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={formData.allowBackorder}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowBackorder: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Allow Backorder</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Digital Products */}
              {formData.productType?.toString() === 'digital' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="downloadUrl" className="block text-sm font-medium mb-1">
                      Download URL
                    </label>
                    <Input
                      id="downloadUrl"
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                      placeholder="https://example.com/file.zip"
                    />
                  </div>

                  <div>
                    <label htmlFor="downloadLimit" className="block text-sm font-medium mb-1">
                      Download Limit
                    </label>
                    <Input
                      id="downloadLimit"
                      type="number"
                      min="0"
                      value={formData.downloadLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, downloadLimit: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (unlimited)"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>

            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button type="button" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>

            <div className="flex flex-wrap gap-2">
              {formData.features?.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                className="flex-1"
              />
              <Button type="button" onClick={addFeature}>
                Add
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}