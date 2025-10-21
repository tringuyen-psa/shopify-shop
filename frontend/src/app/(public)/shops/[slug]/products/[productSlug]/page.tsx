import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { slug, productSlug } = resolvedParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/shops" className="text-gray-500 hover:text-gray-700">Shops</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href={`/shops/${slug}`} className="text-gray-500 hover:text-gray-700">
              {slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">
              {productSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((img) => (
                <div key={img} className="w-full h-24 bg-gray-200 rounded-lg cursor-pointer hover:opacity-75"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {productSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>

            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
              <span className="ml-2 text-sm text-gray-600">(4.8) • 125 Reviews</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${Math.floor(Math.random() * 100) + 10}.00
              </span>
            </div>

            <p className="text-gray-600 mb-6">
              This amazing product offers exceptional quality and value. Perfect for everyday use or as a special gift.
              Made with premium materials and attention to detail.
            </p>

            {/* Product Options */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Product Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                      <option>X-Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2">
                      {['Black', 'White', 'Blue', 'Red'].map((color) => (
                        <Button key={color} variant="outline" size="sm">
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button size="lg" className="w-full">
                Buy Now
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                Add to Cart
              </Button>
            </div>

            {/* Shop Info */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">Verified Shop • 4.8 Rating</p>
                  </div>
                  <Link href={`/shops/${slug}`}>
                    <Button variant="outline" size="sm">Visit Shop</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Material</dt>
                    <dd className="font-medium">Premium Quality</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Dimensions</dt>
                    <dd className="font-medium">10&quot; x 8&quot; x 2&quot;</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Weight</dt>
                    <dd className="font-medium">1.5 lbs</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Origin</dt>
                    <dd className="font-medium">Made in USA</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping & Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Free shipping on orders over $50
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    3-5 business days delivery
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    30-day return policy
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    International shipping available
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}