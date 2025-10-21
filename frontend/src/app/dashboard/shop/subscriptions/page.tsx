'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shopsApi, type Shop } from '@/lib/api/shops';
import { toast } from 'sonner';
import {
  Check,
  X,
  Crown,
  Building,
  Rocket,
  Star,
  Zap,
  Shield,
  TrendingUp,
  AlertCircle,
  CreditCard,
  ArrowRight
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  targetAudience: string;
  purpose: string;
  features: string[];
  limitations: string[];
  recommended?: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 39,
    period: 'tháng',
    description: 'Gói khởi đầu hoàn hảo cho cửa hàng nhỏ',
    targetAudience: 'Cửa hàng nhỏ, mới bắt đầu',
    purpose: 'Bán online cơ bản',
    features: [
      'Tối đa 100 sản phẩm',
      'Báo cáo cơ bản',
      'Phí giao dịch 2.9% + 30¢',
      'Hỗ trợ email 24/7',
      'Theme cơ bản',
      'SSL miễn phí',
      '1 tài khoản nhân viên'
    ],
    limitations: [
      'Không có API nâng cao',
      'Không có tùy chỉnh theme',
      'Phí giao dịch cao hơn',
      'Báo cáo giới hạn'
    ],
    icon: Building,
    color: 'blue'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    price: 105,
    period: 'tháng',
    description: 'Nền tảng mạnh mẽ cho doanh nghiệp phát triển',
    targetAudience: 'Doanh nghiệp đang phát triển',
    purpose: 'Báo cáo chuyên sâu, nhiều tài khoản nhân viên',
    features: [
      'Không giới hạn sản phẩm',
      'Báo cáo nâng cao',
      'Phí giao dịch 2.7% + 30¢',
      'Hỗ trợ ưu tiên 24/7',
      'Tùy chỉnh theme đầy đủ',
      'Gift cards',
      'Tối đa 5 tài khoản nhân viên',
      'Abandoned cart recovery',
      'Professional reports'
    ],
    limitations: [
      'Phí giao dịch vẫn có thể tối ưu hơn',
      'Không có API chuyên nghiệp',
      'Hỗ trợ không riêng tư'
    ],
    icon: Star,
    color: 'green',
    recommended: true
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 399,
    period: 'tháng',
    description: 'Tính năng cao cấp cho doanh nghiệp lớn',
    targetAudience: 'Doanh nghiệp lớn',
    purpose: 'Phân tích nâng cao, phí giao dịch thấp',
    features: [
      'Tất cả tính năng Shopify',
      'Phí giao dịch 2.4% + 30¢',
      'Hỗ trợ riêng tư 24/7',
      'API chuyên nghiệp (Shopify Plus)',
      'Tối đa 15 tài khoản nhân viên',
      'Advanced report builder',
      'Custom checkout',
      'Fraud analysis',
      'International domains'
    ],
    limitations: [
      'Chi phí đầu tư cao',
      'Phức tạp cho người mới bắt đầu'
    ],
    icon: Rocket,
    color: 'purple'
  },
  {
    id: 'shopify_plus',
    name: 'Shopify Plus',
    price: 2000,
    period: 'tháng',
    description: 'Giải pháp enterprise cho thương hiệu lớn',
    targetAudience: 'Thương hiệu lớn, volume cao',
    purpose: 'Hỗ trợ riêng, API cao cấp',
    features: [
      'Tất cả tính năng Advanced',
      'Phí giao dịch tùy chỉnh',
      'Dedicated account manager',
      'Tùy chỉnh API hoàn toàn',
      'Không giới hạn tài khoản',
      'Shopify Flow automation',
      'B2B wholesale',
      'Launch engineer support',
      'Performance optimization'
    ],
    limitations: [
      'Yêu cầu cam đồng tối thiểu 1 năm'
    ],
    icon: Crown,
    color: 'yellow'
  }
];

export default function ShopSubscriptions() {
  const { user } = useRequireAuth(['shop_owner']);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingShop, setFetchingShop] = useState(true);

  useEffect(() => {
    fetchShopData();
  }, []);

  async function fetchShopData() {
    try {
      setFetchingShop(true);
      const shopData = await shopsApi.getMyShop();
      setShop(shopData);
    } catch (error) {
      console.error('Failed to fetch shop data:', error);
      toast.error('Failed to load shop information');
    } finally {
      setFetchingShop(false);
    }
  }

  async function handleUpgradePlan(tierId: string) {
    if (!shop) return;

    setLoading(true);
    try {
      const selectedTier = pricingTiers.find(tier => tier.id === tierId);
      if (!selectedTier) {
        toast.error('Invalid plan selected');
        return;
      }

      await shopsApi.updateSubscription(shop.id, {
        plan: tierId as 'basic' | 'shopify' | 'advanced' | 'shopify_plus',
        price: selectedTier.price,
        period: selectedTier.period,
      });

      toast.success(`Successfully upgraded to ${selectedTier.name} plan!`);
      await fetchShopData(); // Refresh shop data
    } catch (error: any) {
      console.error('Failed to upgrade plan:', error);
      toast.error(error.response?.data?.message || 'Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!shop) return;

    if (!confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.')) {
      return;
    }

    setLoading(true);
    try {
      await shopsApi.cancelSubscription(shop.id);
      toast.success('Subscription cancelled successfully');
      await fetchShopData(); // Refresh shop data
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your business. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      {shop?.subscriptionPlan && shop.subscriptionActive && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-medium text-blue-900">Current Plan: </span>
                <span className="font-bold text-blue-900 capitalize">{shop.subscriptionPlan.replace('_', ' ')}</span>
                <span className="text-sm text-blue-700 ml-2">
                  (${shop.subscriptionPrice}/{shop.subscriptionPeriod})
                </span>
                {shop.subscriptionEndsAt && (
                  <span className="text-sm text-blue-600 ml-2">
                    • Renews {new Date(shop.subscriptionEndsAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                Cancel Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {fetchingShop && (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {pricingTiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = shop?.subscriptionPlan === tier.id && shop.subscriptionActive;

          return (
            <Card
              key={tier.id}
              className={`relative ${
                tier.recommended ? 'ring-2 ring-green-500' : ''
              } ${isCurrentPlan ? 'border-blue-500' : ''}`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">
                    Recommended
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-blue-500 text-white">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-${tier.color}-100`}>
                    <Icon className={`h-6 w-6 text-${tier.color}-600`} />
                  </div>
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className="text-sm">
                  {tier.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-gray-500 ml-1">/{tier.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Target Audience */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Dành cho ai:</p>
                  <p className="text-sm font-medium text-gray-900">{tier.targetAudience}</p>
                  <p className="text-xs text-gray-600 mt-1">Mục đích: {tier.purpose}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm text-gray-900">Tính năng chính:</h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {tier.limitations.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-sm text-gray-900">Hạn chế:</h4>
                    <ul className="space-y-2">
                      {tier.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : tier.recommended
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={isCurrentPlan || loading}
                  onClick={() => handleUpgradePlan(tier.id)}
                >
                  {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' :
                   tier.recommended ? 'Get Started' : 'Upgrade Plan'}
                </Button>

                {isCurrentPlan && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    size="sm"
                  >
                    Manage Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Compare All Plans</CardTitle>
          <CardDescription>
            Detailed comparison of all subscription features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Basic</th>
                  <th className="text-center py-3 px-4">Shopify</th>
                  <th className="text-center py-3 px-4">Advanced</th>
                  <th className="text-center py-3 px-4">Shopify Plus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Giá</td>
                  <td className="text-center py-3 px-4">$39/tháng</td>
                  <td className="text-center py-3 px-4 bg-green-50">$105/tháng</td>
                  <td className="text-center py-3 px-4">$399/tháng</td>
                  <td className="text-center py-3 px-4">Từ $2000/tháng</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Số sản phẩm</td>
                  <td className="text-center py-3 px-4">100</td>
                  <td className="text-center py-3 px-4 bg-green-50">Không giới hạn</td>
                  <td className="text-center py-3 px-4">Không giới hạn</td>
                  <td className="text-center py-3 px-4">Không giới hạn</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Phí giao dịch</td>
                  <td className="text-center py-3 px-4">2.9% + 30¢</td>
                  <td className="text-center py-3 px-4 bg-green-50">2.7% + 30¢</td>
                  <td className="text-center py-3 px-4">2.4% + 30¢</td>
                  <td className="text-center py-3 px-4">Tùy chỉnh</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Tài khoản nhân viên</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 bg-green-50">5</td>
                  <td className="text-center py-3 px-4">15</td>
                  <td className="text-center py-3 px-4">Không giới hạn</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Hỗ trợ khách hàng</td>
                  <td className="text-center py-3 px-4">Email 24/7</td>
                  <td className="text-center py-3 px-4 bg-green-50">Ưu tiên 24/7</td>
                  <td className="text-center py-3 px-4">Riêng tư 24/7</td>
                  <td className="text-center py-3 px-4">Account manager</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">API truy cập</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4 bg-green-50">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Can I change my plan anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Is there a free trial?</h4>
              <p className="text-sm text-gray-600">
                Yes, we offer a 14-day free trial for all new shops. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription anytime. No cancellation fees or long-term commitments.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Need help choosing a plan?
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}