import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ShopsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

      {/* Featured Shops */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Shops</h2>
          <p className="text-lg text-gray-600">Handpicked shops with excellent ratings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sample shop cards - these would come from API */}
          {[1, 2, 3, 4, 5, 6].map((shop) => (
            <Card key={shop} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <CardTitle className="text-xl">Shop {shop}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Amazing shop offering high-quality products and excellent customer service.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                  </div>
                  <Link href={`/shops/shop-${shop}`}>
                    <Button>View Shop</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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