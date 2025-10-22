'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Package } from 'lucide-react';

export default function EditProductPage() {
    const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        productType: 'physical',
        category: '',
        tags: '',
        isActive: true,
        trackInventory: true,
        inventoryQuantity: 0,
        requiresShipping: true,
    });

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }

            const productData = await response.json();
            setProduct(productData);
            setFormData({
                name: productData.name || '',
                description: productData.description || '',
                basePrice: productData.basePrice?.toString() || '',
                productType: productData.productType || 'physical',
                category: productData.category || '',
                tags: productData.tags?.join(', ') || '',
                isActive: productData.isActive !== false,
                trackInventory: productData.trackInventory !== false,
                inventoryQuantity: productData.inventoryQuantity || 0,
                requiresShipping: productData.requiresShipping !== false,
            });
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const submitData = {
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            };

            const response = await fetch(`products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            router.push('/dashboard/shop/products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-200 rounded"></div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Product</h1>
                    <p className="text-gray-600 mt-1">Update your product information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Product Details
                            </CardTitle>
                            <CardDescription>
                                Basic information about your product
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe your product"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="basePrice">Base Price ($) *</Label>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.basePrice}
                                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                                    required
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="productType">Product Type</Label>
                                <Select
                                    value={formData.productType}
                                    onValueChange={(value) => handleInputChange('productType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="physical">Physical Product</SelectItem>
                                        <SelectItem value="digital">Digital Product</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    placeholder="Product category"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => handleInputChange('tags', e.target.value)}
                                    placeholder="tag1, tag2, tag3"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Separate tags with commas
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Settings</CardTitle>
                            <CardDescription>
                                Configure inventory and shipping options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-sm text-gray-500">
                                        Product is visible to customers
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Track Inventory</Label>
                                    <p className="text-sm text-gray-500">
                                        Monitor stock levels
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.trackInventory}
                                    onCheckedChange={(checked) => handleInputChange('trackInventory', checked)}
                                />
                            </div>

                            {formData.trackInventory && (
                                <div>
                                    <Label htmlFor="inventoryQuantity">Stock Quantity</Label>
                                    <Input
                                        id="inventoryQuantity"
                                        type="number"
                                        min="0"
                                        value={formData.inventoryQuantity}
                                        onChange={(e) => handleInputChange('inventoryQuantity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            )}

                            {formData.productType === 'physical' && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Requires Shipping</Label>
                                        <p className="text-sm text-gray-500">
                                            Product will be shipped to customers
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.requiresShipping}
                                        onCheckedChange={(checked) => handleInputChange('requiresShipping', checked)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/shop/products')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}