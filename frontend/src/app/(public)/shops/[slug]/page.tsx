'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useShop, useShopProductsData } from "@/hooks/useDataService";
import { Header } from "@/components/Header";
import { Search, Grid, List, Star, ShoppingCart, ExternalLink } from "lucide-react";

interface ShopPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function ShopPage({ params }: ShopPageProps) {
    const { slug } = React.use(params) as { slug: string };
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { data: shop, loading: shopLoading, error: shopError } = useShop(slug);
    const { data: shopProducts, loading: productsLoading } = useShopProductsData(slug);

    // Filter and sort products
    const filteredProducts = shopProducts?.filter(product => {
        // Search filter
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    }).filter(product => {
        // Category filter
        if (selectedCategory) {
            return product.category === selectedCategory;
        }
        return true;
    }).sort((a, b) => {
        // Sort logic
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'price-low') {
            return a.basePrice - b.basePrice;
        } else if (sortBy === 'price-high') {
            return b.basePrice - a.basePrice;
        } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    if (shopLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shop information...</p>
                </div>
            </div>
        );
    }

    if (shopError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-600 mb-4">
                        <Search className="h-12 w-12 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold">Shop Not Found</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{shopError || 'This shop could not be found.'}</p>
                    <Link href="/shops">
                        <Button>Browse Other Shops</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Shop Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {shop?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h1>
                            <div className="flex items-center space-x-3">
                                {shop?.status === 'active' && (
                                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                        ✨ Active Shop
                                    </span>
                                )}
                                {shopProducts && (
                                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                        📦 {shopProducts.length} Products
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="books">Books</option>
                                    <option value="home">Home & Garden</option>
                                    <option value="toys">Toys & Games</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="createdAt">Newest First</option>
                                    <option value="name">Name: A-Z</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>

                                <button
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                                </button>
                            </div>

                            <Button className="flex-1 lg:flex-initial">
                                {shop?.email ? (
                                    <a href={`mailto:${shop.email}`} className="text-blue-600 hover:text-blue-700">
                                        Contact Shop
                                    </a>
                                ) : (
                                    <span className="text-gray-600">Contact Shop</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shop Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden relative">
                                    {shop?.logo ? (
                                        <img
                                            src={shop.logo}
                                            alt={shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-gray-500 text-2xl font-bold">
                                                {shop?.name?.charAt(0).toUpperCase() || slug.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {shop?.name}
                            </h2>
                            <div className="flex items-center justify-center space-x-4 mb-6">
                                {shop?.status === 'active' && (
                                    <span className="inline-block bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full">
                                        ✨ Active Shop
                                    </span>
                                )}
                                {shopProducts && (
                                    <span className="text-sm text-gray-600">
                                        📦 {shopProducts.length} Premium Products
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-700 text-center mb-6">
                                {shop?.description || 'Discover amazing products from our verified shop. Quality guaranteed, excellent customer service, and fast shipping worldwide.'}
                            </p>

                            <div className="flex justify-center space-x-4 mb-6">
                                {shop?.phone && (
                                    <a href={`tel:${shop.phone}`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                                        <span className="text-sm">📞 Call Us</span>
                                        <span className="text-sm font-medium">{shop.phone}</span>
                                    </a>
                                )}
                                {shop?.website && (
                                    <a
                                        href={shop.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-sm">Visit Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid/List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Our Products
                                <span className="ml-3 text-lg text-gray-600">
                                    ({filteredProducts?.length || 0} items)
                                </span>
                            </h2>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Sort:</span>
                                    <span className="text-blue-600 font-medium capitalize">{sortBy === 'createdAt' ? 'Newest' : sortBy === 'name' ? 'Name' : 'Price'}</span>
                                </div>
                                {selectedCategory && (
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">Category:</span>
                                        <span className="text-blue-600 font-medium capitalize">{selectedCategory}</span>
                                        <button
                                            onClick={() => {
                                                setSelectedCategory('');
                                                setSearchQuery('');
                                            }}
                                            className="ml-2 text-blue-600 hover:text-blue-700 text-sm underline"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">View:</span>
                                    <span className="text-blue-600 font-medium capitalize">{viewMode}</span>
                                </div>
                            </div>
                        </div>

                        {/* Products Display */}
                        {productsLoading ? (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                                        <div className={viewMode === 'grid' ? 'h-64 bg-gray-200' : 'h-32 bg-gray-200'}></div>
                                        <div className="p-6">
                                            <div className={viewMode === 'grid' ? 'space-y-2' : 'space-y-4'}>
                                                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts && filteredProducts.length > 0 ? (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-6'}>
                                {filteredProducts.map((product) => (
                                    <Link key={product.id} href={`/shops/${slug}/products/${product.slug}`} className="group">
                                        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            <div className="relative">
                                                {/* Product Image */}
                                                <div className="aspect-square bg-gray-200 overflow-hidden">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                            <ShoppingCart className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Badges */}
                                                <div className="absolute top-2 right-2 flex space-x-2">
                                                    {product.isSubscription && (
                                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                                            🔄 Subscription
                                                        </span>
                                                    )}
                                                    {product.productType === 'digital' && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                            💻 Digital
                                                        </span>
                                                    )}
                                                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                                            🔥 Sale
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h3>

                                                {/* Price */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-2xl font-bold text-green-600">
                                                        ${typeof product.basePrice === 'number' ? product.basePrice.toFixed(2) : parseFloat(product.basePrice || '0').toFixed(2)}
                                                    </span>
                                                    {product.compareAtPrice && typeof product.compareAtPrice === 'number' && product.compareAtPrice > (typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice || '0')) && (
                                                        <span className="ml-2 text-sm text-gray-500 line-through">
                                                            ${product.compareAtPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center mb-3">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {product.rating || 4.8} ({product.reviewCount || 125} reviews)
                                                    </span>
                                                </div>

                                                {/* Category */}
                                                {product.category && (
                                                    <div className="flex items-center mb-3">
                                                        <span className="text-sm text-gray-600">Category:</span>
                                                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium capitalize">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Stock Status */}
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        {product.trackInventory ? (
                                                            <>
                                                                {product.inventoryQuantity > 0 ? (
                                                                    <span className="text-green-600 font-medium">
                                                                        ✅ {product.inventoryQuantity} in stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-orange-600 font-medium">
                                                                        ⚠️ Made to order
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-600">Always available</span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <span>View Details</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Short Description */}
                                                {product.description && (
                                                    <p className="text-gray-700 text-sm line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    {searchQuery || selectedCategory
                                        ? `No products found matching "${searchQuery || selectedCategory}"`
                                        : 'No products available in this shop yet.'
                                    }
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    {searchQuery || selectedCategory
                                        ? 'Try adjusting your filters or check back later for new arrivals.'
                                        : 'Check back soon or browse other shops for amazing products.'
                                    }
                                </p>
                                <div className="flex justify-center space-x-4">
                                    {(searchQuery || selectedCategory) && (
                                        <Button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory('');
                                            }}
                                            variant="outline"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Link href="/shops">
                                        <Button>Browse Other Shops</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}