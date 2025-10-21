'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useAllShops } from "@/hooks/useDataService";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, Star } from "lucide-react";
import { Header } from "@/components/Header";

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  const { user } = useAuth();
  const { data: shopsData, loading, error, refetch } = useAllShops({
    page: currentPage,
    limit,
    status: 'active', // Only show active shops
    search: searchTerm || undefined,
    sortBy: sortBy as 'name' | 'createdAt' | 'revenue' | 'orders',
    sortOrder
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setSortBy(field);
    setCurrentPage(1);
  };
  // Loading state
  if (loading && !shopsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading shops...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <Star className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Failed to load shops</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Shops
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our curated marketplace of unique shops offering quality products and exceptional service.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search shops by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Shops Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchTerm ? `Search Results (${shopsData?.total || 0} shops)` : `All Shops (${shopsData?.total || 0} shops)`}
          </h2>

          {shopsData?.shops && shopsData.shops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shopsData.shops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {shop.logo ? (
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-semibold">
                              {shop.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{shop.name}</CardTitle>
                        {shop.status === 'active' && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                            Verified Shop
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {shop.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {shop.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {shop.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/shops/${shop.slug}`} className="flex-1">
                        <Button className="w-full">View Shop</Button>
                      </Link>
                      {shop.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={shop.website} target="_blank" rel="noopener noreferrer">
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No shops found' : 'No shops available'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `No shops match "${searchTerm}". Try different search terms.`
                    : 'There are no active shops at the moment.'
                  }
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => handleSearch('')}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {shopsData && shopsData.total > limit && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(shopsData.total / limit)}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(Math.ceil(shopsData.total / limit), currentPage + 1))}
              disabled={currentPage >= Math.ceil(shopsData.total / limit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Want to Start Your Own Shop?</h2>
            <p className="text-xl mb-8">Join our marketplace and start selling to customers worldwide.</p>
            <Link href="/register/shop-owner">
              <Button size="lg" variant="secondary">
                Create Your Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}