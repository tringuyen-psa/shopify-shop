import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-4xl w-full p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Đăng ký tài khoản</h1>
          <p className="text-lg text-gray-600">
            Chọn loại tài khoản bạn muốn tạo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Registration */}
          <Link href="/register/customer">
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <CardTitle className="text-2xl">Mua sắm</CardTitle>
                <CardDescription>
                  Tạo tài khoản để mua hàng, theo dõi đơn hàng và quản lý subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 mb-6 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Mua hàng nhanh chóng
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Theo dõi đơn hàng
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Quản lý subscriptions
                  </li>
                </ul>
                <span className="text-blue-600 font-semibold text-lg">
                  Đăng ký miễn phí →
                </span>
              </CardContent>
            </Card>
          </Link>

          {/* Shop Owner Registration */}
          <Link href="/register/shop-owner">
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🏪</div>
                <CardTitle className="text-2xl">Bán hàng</CardTitle>
                <CardDescription>
                  Mở shop và bắt đầu bán hàng trên nền tảng của chúng tôi
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 mb-6 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Tạo shop miễn phí
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Quản lý sản phẩm dễ dàng
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Nhận tiền qua Stripe Connect
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Phí chỉ 15% mỗi giao dịch
                  </li>
                </ul>
                <span className="text-blue-600 font-semibold text-lg">
                  Bắt đầu bán hàng →
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}