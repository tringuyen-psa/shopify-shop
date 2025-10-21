import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                MarketPlace
              </Link>
              <nav className="hidden md:flex space-x-8 ml-10">
                <Link href="/shops" className="text-gray-600 hover:text-gray-900">
                  Shops
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Categories
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Deals
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MarketPlace</h3>
              <p className="text-gray-400">
                Your trusted platform for quality products and services.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shops" className="hover:text-white">Browse Shops</Link></li>
                <li><Link href="#" className="hover:text-white">Categories</Link></li>
                <li><Link href="#" className="hover:text-white">Deals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Sell</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register/shop-owner" className="hover:text-white">Start Selling</Link></li>
                <li><Link href="#" className="hover:text-white">Seller Resources</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MarketPlace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}