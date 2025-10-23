'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShopProducts, useMutation } from '@/hooks/useDataService';
import {
    Plus,
    Package,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Search
} from 'lucide-react';

export default function ProductsPage() {
    const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // Get the user's shop products using the data service hook
    const { data: products, loading, error, refetch } = useShopProducts(
        'current' // Get current user's shop products
    );

    // Handle error when user doesn't have a shop
    if (error?.message?.includes('User does not have a shop')) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">No Shop Found</h1>
                    <p className="text-gray-600 mb-4">You need to create a shop before adding products.</p>
                    <Button onClick={() => router.push('/dashboard/shop')}>
                        Create Shop
                    </Button>
                </div>
            </div>
        );
    }


    const deleteProductMutation = useMutation(
        async (productId: string) => {
            if (!confirm('Are you sure you want to delete this product?')) {
                throw new Error('User cancelled');
            }
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            return response;
        }
    );

    // Handle successful deletion
    useEffect(() => {
        if (!deleteProductMutation.loading && !deleteProductMutation.error && deleteProductMutation.data) {
            refetch();
        }
    }, [deleteProductMutation.loading, deleteProductMutation.error, deleteProductMutation.data, refetch]);

    const filteredProducts = products?.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load products</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => refetch()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-2">Manage your shop products</p>
                </div>
                <Button onClick={() => router.push('/dashboard/shop/products/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'No products found' : 'No products yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Try searching with different keywords'
                                : 'Start by adding your first product to your shop'
                            }
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => router.push('/dashboard/shop/products/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Product
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {product.category && <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                {product.category}
                                            </span>}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/shop/products/${product.id}/edit`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteProductMutation.mutate(product.id)}
                                            disabled={deleteProductMutation.loading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Product Image */}
                                {product.images[0] && (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-md mb-4"
                                    />
                                )}

                                {/* Product Info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-green-600">
                                            ${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : parseFloat(product.basePrice || '0').toFixed(2)}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded ${product.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Subscription Pricing */}
                                    {(product.weeklyPrice || product.monthlyPrice || product.yearlyPrice) && (
                                        <div className="text-sm text-gray-600">
                                            <div>Subscription from: ${Math.min(
                                                typeof product.weeklyPrice === 'number' ? product.weeklyPrice : parseFloat(product.weeklyPrice || 'Infinity'),
                                                typeof product.monthlyPrice === 'number' ? product.monthlyPrice : parseFloat(product.monthlyPrice || 'Infinity'),
                                                typeof product.yearlyPrice === 'number' ? product.yearlyPrice : parseFloat(product.yearlyPrice || 'Infinity')
                                            ).toFixed(2)}/week</div>
                                        </div>
                                    )}

                                    {/* Product Type */}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Package className="h-4 w-4 mr-1" />
                                        {product.productType === 'physical' ? 'Physical Product' : 'Digital Product'}
                                    </div>

                                    {/* Inventory */}
                                    {product.trackInventory && (
                                        <div className="text-sm text-gray-500">
                                            Stock: {typeof product.inventoryQuantity === 'number' ? product.inventoryQuantity : parseInt(product.inventoryQuantity || '0')} units
                                        </div>
                                    )}

                                    {/* Description */}
                                    {product.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                router.push(`/shops/${product.shop?.slug || 'default'}/products/${product.slug || 'no-slug'}`);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => router.push(`/dashboard/shop/products/${product.id}/edit`)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}