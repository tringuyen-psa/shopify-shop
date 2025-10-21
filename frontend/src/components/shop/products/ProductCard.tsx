'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/data-service';

interface ProductCardProps {
  product: Product;
  variant?: 'list' | 'grid' | 'compact';
  showShopInfo?: boolean;
  showQuickActions?: boolean;
}

export function ProductCard({
  product,
  variant = 'grid',
  showShopInfo = true,
  showQuickActions = false,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPriceToDisplay = () => {
    if (product.compareAtPrice && product.compareAtPrice > product.basePrice) {
      return {
        current: formatPrice(product.basePrice),
        original: formatPrice(product.compareAtPrice),
        hasDiscount: true,
        discountPercent: Math.round(
          ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100
        ),
      };
    }
    return {
      current: formatPrice(product.basePrice),
      original: null,
      hasDiscount: false,
      discountPercent: 0,
    };
  };

  const price = getPriceToDisplay();

  const imageUrl = product.images?.[0] || '/placeholder-product.jpg';

  const containerClasses = {
    grid: 'group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200',
    list: 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200',
    compact: 'bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow duration-200',
  };

  const imageSizes = {
    grid: 'w-full h-48',
    list: 'w-24 h-24 flex-shrink-0',
    compact: 'w-20 h-20 flex-shrink-0',
  };

  return (
    <div className={containerClasses[variant]}>
      {/* Product Image */}
      <div className={variant === 'grid' ? imageSizes.grid : 'relative'}>
        {variant !== 'list' && (
          <Link href={`/shops/${product.shop?.slug}/products/${product.slug}`}>
            <div className={`${imageSizes[variant]} relative overflow-hidden bg-gray-100`}>
              {imageLoaded && (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-4-4l1.414 1.414a2 2 0 102.828 0L20 12"
                    />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Badges */}
        {(product.isSubscription || product.compareAtPrice) && (
          <div className="absolute top-2 left-2 flex gap-2">
            {product.isSubscription && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                Subscription
              </span>
            )}
            {price.hasDiscount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{price.discountPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={variant === 'grid' ? 'p-4' : 'flex-1'}>
        {/* Shop Name */}
        {showShopInfo && product.shop && (
          <div className="flex items-center mb-2">
            {product.shop.logo && (
              <Image
                src={product.shop.logo}
                alt={product.shop.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full mr-2 object-cover"
              />
            )}
            <Link
              href={`/shops/${product.shop.slug}`}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              {product.shop.name}
            </Link>
          </div>
        )}

        {/* Product Name */}
        <Link href={`/shops/${product.shop?.slug}/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (variant === 'grid' || variant === 'list') && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (variant === 'grid' || variant === 'list') && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Product Type Indicator */}
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <span className={`inline-flex items-center px-2 py-1 rounded-full ${
            product.productType === 'digital'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {product.productType === 'digital' ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                  <path d="M5 3v4h14V3a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                </svg>
                Digital
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5h1zM5.5 4a.5.5 0 0 0-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1zM13 4a.5.5 0 0 0-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1zM5.5 7.5a.5.5 0 0 0-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1z" />
                  <path d="M10.5 12.5a.5.5 0 0 1 .5.5v3.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-3.5a.5.5 0 0 1 .5-.5h1z" />
                </svg>
                Physical
              </>
            )}
          </span>

          {/* Inventory Status */}
          {product.trackInventory && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full ${
              product.inventoryQuantity > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.inventoryQuantity > 0
                ? `${product.inventoryQuantity} in stock`
                : 'Out of stock'
              }
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-3">
          <div className="text-lg font-bold text-gray-900">
            {price.current}
          </div>
          {price.original && (
            <div className="text-sm text-gray-500 line-through">
              {price.original}
            </div>
          )}
        </div>

        {/* Subscription Pricing */}
        {product.isSubscription && (variant === 'grid' || variant === 'list') && (
          <div className="flex flex-wrap gap-2 mb-3 text-sm">
            {product.monthlyPrice && (
              <div className="text-gray-600">
                <span className="font-medium">{formatPrice(product.monthlyPrice)}</span>/month
              </div>
            )}
            {product.yearlyPrice && (
              <div className="text-gray-600">
                <span className="font-medium">{formatPrice(product.yearlyPrice)}</span>/year
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && variant === 'grid' && (
          <div className="flex gap-2">
            <button
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={() => window.location.href = `/checkout/create?productId=${product.id}`}
            >
              Quick Buy
            </button>
            <button className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              View
            </button>
          </div>
        )}

        {/* Features List */}
        {product.features && product.features.length > 0 && variant === 'grid' && (
          <ul className="text-sm text-gray-600 space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414 0l8 8a1 1 0 001.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </li>
            ))}
            {product.features.length > 3 && (
              <li className="text-gray-400">+{product.features.length - 3} more</li>
            )}
          </ul>
        )}
      </div>

      {/* Compact Mode - Action Buttons */}
      {variant === 'compact' && (
        <div className="flex gap-2 mt-3">
          <button
            className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded hover:bg-blue-700 transition-colors text-xs"
            onClick={() => window.location.href = `/checkout/create?productId=${product.id}`}
          >
            Buy
          </button>
        </div>
      )}
    </div>
  );
}