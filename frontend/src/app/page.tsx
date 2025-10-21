'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Shopify Clone</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Xin chào, {user.name}
                  </span>
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Đăng nhập</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Nền tảng thương mại điện tử
            <span className="text-blue-600"> đa nhà cung cấp</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Bán hàng dễ dàng với Stripe Connect tích hợp. Quản lý shop, sản phẩm và thanh toán
            tất cả trong một nền tảng. Phí chỉ 15% trên mỗi giao dịch.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Bắt đầu ngay
              </Button>
            </Link>
            <Link href="/shops">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Khám phá shops
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">🏪</span>
                Tạo Shop Miễn Phí
              </CardTitle>
              <CardDescription>
                Mở shop online chỉ trong vài phút. Không phí thiết lập, không phí ẩn.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">💳</span>
                Thanh Toán An Toàn
              </CardTitle>
              <CardDescription>
                Tích hợp Stripe Connect với KYC tự động. Nhận tiền ngay sau khi giao dịch.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">📦</span>
                Quản lý Đơn Hàng
              </CardTitle>
              <CardDescription>
                Theo dõi đơn hàng, quản lý shipping, và tự động hóa quy trình bán hàng.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">🔄</span>
                Subscription Billing
              </CardTitle>
              <CardDescription>
                Hỗ trợ thanh toán định kỳ với các gói weekly, monthly, yearly.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Theo dõi doanh thu, đơn hàng và hiệu quả bán hàng với báo cáo chi tiết.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">🚀</span>
                Checkout Nhanh
              </CardTitle>
              <CardDescription>
                3-step checkout flow tối ưu, tăng tỷ lệ chuyển đổi và giảm bỏ giỏ hàng.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng bắt đầu bán hàng?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Đăng ký ngay hôm nay và nhận 30 ngày miễn phí platform fee
            </p>
            <Link href="/register/shop-owner">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Mở Shop Miễn Phí
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}