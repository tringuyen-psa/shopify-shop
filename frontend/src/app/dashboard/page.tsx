'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dataService } from '@/services/data-service';
import {
  Store,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [shopLoading, setShopLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Redirect based on user role
    if (user.role === 'customer') {
      router.push('/dashboard/customer');
      return;
    }

    if (user.role === 'platform_admin') {
      router.push('/admin');
      return;
    }

    // For shop_owner, load shop info and stats
    if (user.role === 'shop_owner') {
      loadShopData();
    }
  }, [user, router]);

  async function loadShopData() {
    if (!user) return;

    setShopLoading(true);
    try {
      // Try to get shop info
      const shopData = await dataService.getMyShop();
      setShop(shopData);

      // Get order stats
      const statsData = await dataService.getOrderStats({
        shopId: shopData.id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endDate: new Date().toISOString()
      });
      setStats(statsData);
    } catch (error) {
      console.log('No shop found or error loading shop data');
      // User might need to create a shop first
    } finally {
      setShopLoading(false);
    }
  }

  if (loading || shopLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // If user is customer, show redirect message
  if (user?.role === 'customer') {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to Customer Dashboard</h1>
          <p className="text-gray-600 mb-4">Taking you to your customer dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If user is admin, show redirect message
  if (user?.role === 'platform_admin') {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Dashboard</h1>
          <p className="text-gray-600 mb-4">Taking you to the admin dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Shop Owner Dashboard
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's your shop overview.
          </p>
        </div>
        {shop && (
          <Button onClick={() => router.push('/dashboard/shop')}>
            View Full Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* No Shop State */}
      {!shop && user?.role === 'shop_owner' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Store className="h-6 w-6 mr-2" />
              Set Up Your Shop
            </CardTitle>
            <CardDescription className="text-blue-600">
              You don't have a shop yet. Let's get you started!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Create Your Shop</h4>
                  <p className="text-sm text-blue-600">Set up your shop information and branding</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Add Products</h4>
                  <p className="text-sm text-blue-600">List your products for customers to purchase</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Set Up Payments</h4>
                  <p className="text-sm text-blue-600">Configure Stripe Connect to receive payments</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/dashboard/shop/onboarding')}
                className="w-full mt-4"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Exists - Show Overview */}
      {shop && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.averageOrderValue?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per order
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shop Status</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold capitalize">
                  {shop.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-yellow-600">Setup Required</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {shop.name}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/shop/products')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Manage Products
                </CardTitle>
                <CardDescription>
                  Add, edit, and manage your product listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Go to Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/shop/orders')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  View Orders
                </CardTitle>
                <CardDescription>
                  Track and fulfill customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Go to Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push('/dashboard/shop')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  View detailed sales and performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Analytics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {!shop.stripeChargesEnabled && (
              <Card className="border-yellow-200 bg-yellow-50 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/dashboard/shop/onboarding')}>
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <Settings className="h-5 w-5 mr-2" />
                    Complete Setup
                  </CardTitle>
                  <CardDescription className="text-yellow-600">
                    Finish your shop setup to start selling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Complete Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}