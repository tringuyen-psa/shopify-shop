'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useProductBySlug } from "@/hooks/useDataService";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Loader2, Package, ShoppingBag, Heart, Share2, Truck, Shield, RefreshCw, Star, Check, ChevronLeft, ChevronRight, Mail, Phone, Globe } from "lucide-react";

interface ProductPageProps {
    params: Promise<{
        slug: string;
        productSlug: string;
    }>;
}

export default function ProductPage({ params }: ProductPageProps) {
    const { slug, productSlug } = React.use(params) as { slug: string; productSlug: string };
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'weekly' | null>(null);

    const { user } = useAuth();
    // Fetch product by shop slug and product slug
    const { data: product, loading, error } = useProductBySlug(slug, productSlug);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading amazing product...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-gray-400 mb-6">
                        <Package className="h-24 w-24 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">{error || 'This product could not be found.'}</p>
                    <Link href="/shops">
                        <Button size="lg" className="px-8">Browse Shops</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const basePrice = typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice || '0');
    const comparePrice = product.compareAtPrice ?
        (typeof product.compareAtPrice === 'number' ? product.compareAtPrice : parseFloat(product.compareAtPrice)) : null;

    const handlePrevImage = () => {
        if (product.images && product.images.length > 0) {
            setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    const handleExpressCheckout = async () => {
        try {
            if (!product) return;

            // Create checkout session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: quantity,
                    plan: selectedPlan,
                    express: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const result = await response.json();

            if (!result.sessionId) {
                throw new Error('No session ID returned from checkout API');
            }

            // Redirect to checkout
            window.location.href = `/checkout/${result.sessionId}`;
        } catch (error) {
            console.error('Express checkout error:', error);
            alert(`Failed to start checkout: ${error.message}. Please try again.`);
        }
    };

    const handleFullCheckout = () => {
        // Redirect to full checkout page with product info
        const params = new URLSearchParams({
            productId: product.id,
            quantity: quantity.toString(),
            plan: selectedPlan || '',
        });
        window.location.href = `/checkout?${params.toString()}`;
    };

    const handleNextImage = () => {
        if (product.images && product.images.length > 0) {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-gray-700">Home</Link>
                        <span>/</span>
                        <Link href="/shops" className="hover:text-gray-700">Shops</Link>
                        <span>/</span>
                        <Link href={`/shops/${slug}`} className="hover:text-gray-700">
                            {product.shop?.name || 'Shop'}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Product Layout - Horizontal Design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left Column: Product Images */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="relative">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-24 w-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Image Navigation Arrows */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-blue-600 shadow-lg scale-105'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} - Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Information */}
                    <div className="space-y-8">
                        {/* Product Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Reviews and Stock */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-600 font-medium">4.8</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">125 Reviews</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-green-600 font-medium">In Stock</span>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-baseline space-x-3 mb-6">
                                <span className="text-4xl font-bold text-gray-900">
                                    ${basePrice.toFixed(2)}
                                </span>
                                {comparePrice && comparePrice > basePrice && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            ${comparePrice.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                                            Save ${(comparePrice - basePrice).toFixed(2)}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Product Type Badge */}
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${product.productType === 'physical'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {product.productType === 'physical' ? (
                                        <>
                                            <Package className="h-4 w-4 mr-2" />
                                            Physical Product
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Digital Product
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Purchase Section */}
                        <div className="border-t pt-6">
                            {/* Subscription Options */}
                            {(product.monthlyPrice || product.yearlyPrice || product.weeklyPrice) ? (
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Plan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        {/* Monthly Plan */}
                                        {product.monthlyPrice && (
                                            <div className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedPlan('monthly')}
                                            >
                                                <div className="text-center">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly</h4>
                                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                                        ${typeof product.monthlyPrice === 'number' ? product.monthlyPrice.toFixed(2) : parseFloat(product.monthlyPrice || '0').toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">per month</div>
                                                    {product.trialDays > 0 && (
                                                        <div className="mt-4 text-sm text-green-600 font-medium">
                                                            {product.trialDays} days free trial
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Yearly Plan */}
                                        {product.yearlyPrice && (
                                            <div className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedPlan('yearly')}
                                            >
                                                <div className="text-center">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Yearly</h4>
                                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                                        ${typeof product.yearlyPrice === 'number' ? product.yearlyPrice.toFixed(2) : parseFloat(product.yearlyPrice || '0').toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">per year</div>
                                                    {product.yearlyPrice && product.monthlyPrice && (
                                                        <div className="mt-2 text-sm text-green-600 font-medium">
                                                            Save ${(
                                                                (parseFloat(product.monthlyPrice || '0') * 12 - parseFloat(product.yearlyPrice || '0'))
                                                            ).toFixed(2)} annually
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Weekly Plan */}
                                        {product.weeklyPrice && (
                                            <div className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedPlan === 'weekly' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedPlan('weekly')}
                                            >
                                                <div className="text-center">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Weekly</h4>
                                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                                        ${typeof product.weeklyPrice === 'number' ? product.weeklyPrice.toFixed(2) : parseFloat(product.weeklyPrice || '0').toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-600">per week</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* One-time Purchase */
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">One-time Purchase</h3>
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Purchase Price:</span>
                                            <span className="text-2xl font-bold text-gray-900">
                                                ${basePrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector (for one-time purchase) */}
                            {!selectedPlan && (
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                        <div className="flex items-center border rounded-lg">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-6 py-2 border-l border-r min-w-[80px] text-center font-medium">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        Total: ${(basePrice * quantity).toFixed(2)}
                                    </div>
                                </div>
                            )}

                            {/* Checkout Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Express Checkout */}
                                <Button
                                    size="lg"
                                    onClick={handleExpressCheckout}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium relative"
                                >
                                    <div className="flex items-center justify-center">
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        {selectedPlan ? 'Start Subscription' : 'Buy Now'}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-yellow-400 text-xs text-gray-800 px-2 py-1 rounded">
                                            Fast
                                        </div>
                                    </div>
                                </Button>

                                {/* Full Checkout */}
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleFullCheckout}
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex justify-center space-x-8">
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                                    <span className="text-sm font-medium">{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                    <span className="text-sm font-medium">Share</span>
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                                <div className="text-center">
                                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Secure Payment</div>
                                    <div className="text-xs text-gray-500">Powered by Stripe</div>
                                </div>
                                <div className="text-center">
                                    <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Flexible Plans</div>
                                    <div className="text-xs text-gray-500">Cancel anytime</div>
                                </div>
                                <div className="text-center">
                                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-sm text-gray-600 font-medium">Instant Access</div>
                                    <div className="text-xs text-gray-500">Start immediately</div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 border-t pt-6">
                            <div className="flex flex-col items-center space-y-2">
                                <Truck className="h-8 w-8 text-green-600" />
                                <span className="text-sm text-gray-600 font-medium text-center">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <Shield className="h-8 w-8 text-green-600" />
                                <span className="text-sm text-gray-600 font-medium text-center">Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <RefreshCw className="h-8 w-8 text-green-600" />
                                <span className="text-sm text-gray-600 font-medium text-center">30-Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Information Section - Full Width */}
                <div className="mb-16">
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                        {product.shop?.logo ? (
                                            <img
                                                src={product.shop.logo}
                                                alt={product.shop.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-gray-500 text-xl font-bold">
                                                    {product.shop?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.shop?.name}</h2>
                                        <div className="flex items-center space-x-6 text-gray-600 mb-3">
                                            <div className="flex items-center space-x-2">
                                                <Mail className="h-4 w-4" />
                                                <span className="text-sm">{(product.shop as any)?.email || 'contact@shop.com'}</span>
                                            </div>
                                            {product.shop && 'phone' in product.shop && (product.shop as any).phone && (
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="text-sm">{(product.shop as any).phone}</span>
                                                </div>
                                            )}
                                            {product.shop && 'website' in product.shop && (product.shop as any).website && (
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="h-4 w-4" />
                                                    <a
                                                        href={(product.shop as any).website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Website
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {(product.shop as any)?.description || 'Quality products and excellent customer service.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <Link href={`/shops/${slug}`}>
                                        <Button variant="outline" size="lg">Visit Shop</Button>
                                    </Link>
                                    <Button>Contact Seller</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Product Details Tabs - Full Width */}
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8">
                            <button className="py-4 px-1 border-b-2 border-blue-600 font-medium text-sm text-blue-600">
                                Description
                            </button>
                            <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                                Specifications
                            </button>
                            <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                                Reviews
                            </button>
                            <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                                Shipping
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column - Features */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features</h3>
                                <div className="space-y-4">
                                    {product.features && product.features.length > 0 ? (
                                        product.features.map((feature, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 leading-relaxed">{feature}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">Premium quality materials and construction</span>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">Fast and reliable shipping worldwide</span>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">30-day satisfaction guarantee</span>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Check className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">24/7 customer support available</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Specifications */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Product Specifications</h3>
                                <div className="space-y-4">
                                    {(product as any).sku && (
                                        <div className="flex justify-between py-3 border-b">
                                            <span className="text-gray-600 font-medium">SKU</span>
                                            <span className="text-gray-900 font-medium">{(product as any).sku}</span>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div className="flex justify-between py-3 border-b">
                                            <span className="text-gray-600 font-medium">Weight</span>
                                            <span className="text-gray-900 font-medium">{product.weight} lbs</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600 font-medium">Category</span>
                                        <span className="text-gray-900 font-medium capitalize">{product.category || 'General'}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600 font-medium">Product Type</span>
                                        <span className="text-gray-900 font-medium capitalize">{product.productType}</span>
                                    </div>
                                    {product.trackInventory && (
                                        <div className="flex justify-between py-3 border-b">
                                            <span className="text-gray-600 font-medium">Availability</span>
                                            <span className="text-green-600 font-medium">{product.inventoryQuantity} units in stock</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3">
                                        <span className="text-gray-600 font-medium">Shipping</span>
                                        <span className="text-gray-900 font-medium">Free shipping on orders over $50</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}