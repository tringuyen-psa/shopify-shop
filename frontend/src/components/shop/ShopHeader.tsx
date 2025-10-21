'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Mail,
  Phone,
  Star,
  Package,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Shop } from '@/services/data-service';

interface ShopHeaderProps {
  shop: Shop;
  productCount?: number;
  averageRating?: number;
  totalReviews?: number;
  showActions?: boolean;
  variant?: 'full' | 'compact' | 'card';
}

export function ShopHeader({
  shop,
  productCount = 0,
  averageRating = 0,
  totalReviews = 0,
  showActions = true,
  variant = 'full'
}: ShopHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const getStatusBadge = () => {
    switch (shop.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderStripeStatus = () => {
    if (variant === 'compact') return null;

    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            shop.stripeChargesEnabled ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-gray-600">
            Payments {shop.stripeChargesEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {shop.stripePayoutsEnabled && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Payouts Enabled</span>
          </div>
        )}
      </div>
    );
  };

  const renderCompact = () => (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="relative w-12 h-12">
        {shop.logo && !imageError ? (
          <Image
            src={shop.logo}
            alt={shop.name}
            fill
            className="object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-sm">
              {shop.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-600 truncate">
          {productCount} products
        </p>
      </div>

      <Link href={`/shops/${shop.slug}`}>
        <Button variant="ghost" size="sm">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );

  const renderCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          {shop.logo && !imageError ? (
            <Image
              src={shop.logo}
              alt={shop.name}
              fill
              className="object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">
                {shop.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{shop.name}</h3>
            {getStatusBadge()}
          </div>

          {shop.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {shop.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {productCount > 0 && (
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{productCount} products</span>
              </div>
            )}

            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{averageRating.toFixed(1)}</span>
                {totalReviews > 0 && (
                  <span className="text-gray-400">({totalReviews})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFull = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border border-gray-200 rounded-xl overflow-hidden">
      {/* Cover and Profile */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute -bottom-10 left-6">
          <div className="relative w-20 h-20 bg-white rounded-lg p-1 shadow-lg">
            {shop.logo && !imageError ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className="object-cover rounded-md"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                <span className="text-gray-500 font-bold text-xl">
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              {getStatusBadge()}
            </div>

            {shop.description && (
              <p className="text-gray-600 mb-4 max-w-3xl">
                {shop.description}
              </p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{shop.email}</span>
              </div>

              {shop.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{shop.phone}</span>
                </div>
              )}

              {shop.website && (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4">
              {productCount > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-semibold text-gray-900">{productCount}</div>
                    <div className="text-sm text-gray-500">Products</div>
                  </div>
                </div>
              )}

              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <div>
                    <div className="font-semibold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">
                      {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {renderStripeStatus()}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2">
              <Link href={`/shops/${shop.slug}`}>
                <Button variant="outline" size="sm">
                  Visit Shop
                </Button>
              </Link>

              <Link href={`/contact/${shop.slug}`}>
                <Button size="sm">
                  Contact Seller
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'card':
      return renderCard();
    case 'full':
    default:
      return renderFull();
  }
}