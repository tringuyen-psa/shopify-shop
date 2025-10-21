import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ShopPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-gray-600 mb-4">
                Premium quality products with excellent customer service and fast shipping.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">125 Products</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">Verified Shop</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">Follow Shop</Button>
              <Button>Contact Shop</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" size="sm">All</Button>
            <Button variant="ghost" size="sm">Digital</Button>
            <Button variant="ghost" size="sm">Physical</Button>
            <Button variant="ghost" size="sm">Subscription</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sample product cards */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((product) => (
            <Card key={product} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Product {product}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  High-quality product with amazing features
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${Math.floor(Math.random() * 100) + 10}.00
                  </span>
                  <Link href={`/shops/${slug}/products/product-${product}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline">Load More Products</Button>
        </div>
      </div>
    </div>
  );
}