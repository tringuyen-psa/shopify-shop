'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminApi, PlatformStats, AdminShop } from '@/lib/api/admin';
import {
    Store,
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Eye,
    Edit,
    BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useRequireAuth(['platform_admin']);
    const [loading, setLoading] = useState(true);
    const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
    const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
    const [recentShops, setRecentShops] = useState<AdminShop[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            // Load real data from APIs
            const [statsResponse, shopsResponse] = await Promise.all([
                adminApi.getPlatformStats(),
                adminApi.getShops({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
            ]);

            setPlatformStats(statsResponse);
            setRevenueGrowth(statsResponse.revenueGrowth);
            setRecentShops(shopsResponse.shops);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'suspended':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
                <p className="text-gray-600 mt-2">Monitor and manage your multi-vendor platform</p>
            </div>

            {/* Overview Stats */}
            {platformStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{platformStats.totalShops}</div>
                            <p className="text-xs text-muted-foreground">
                                {platformStats.activeShops} active • {platformStats.pendingShops} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {platformStats.totalCustomers} customers • {platformStats.totalShopOwners} sellers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{platformStats.totalOrders.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {platformStats.ordersToday} today • {platformStats.ordersThisMonth} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${platformStats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                ${platformStats.totalPlatformFees.toLocaleString()} in fees
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Revenue Overview
                            <Button variant="outline" size="sm">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            Monthly platform revenue and trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {platformStats && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">This Month</p>
                                        <p className="text-2xl font-bold">${platformStats.revenueThisMonth.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {revenueGrowth >= 0 ? (
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-500" />
                                        )}
                                        <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Platform Fees</p>
                                            <p className="font-semibold">${(platformStats.revenueThisMonth * 0.15).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Shop Revenue</p>
                                            <p className="font-semibold">${(platformStats.revenueThisMonth * 0.85).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    {platformStats && (
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active Shops</span>
                                <span className="font-semibold">{platformStats.activeShops}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pending Approval</span>
                                <span className="font-semibold text-yellow-600">{platformStats.pendingShops}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Suspended Shops</span>
                                <span className="font-semibold text-red-600">{platformStats.suspendedShops || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Avg. Order Value</span>
                                <span className="font-semibold">${platformStats.totalOrders > 0 ? (platformStats.totalRevenue / platformStats.totalOrders).toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Monthly MRR</span>
                                <span className="font-semibold">${platformStats.monthlyRecurringRevenue.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Recent Shop Registrations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Recent Shop Registrations
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Latest shops waiting for approval or recently activated
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentShops.map((shop) => (
                            <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <h4 className="font-medium">{shop.name}</h4>
                                        {getStatusIcon(shop.status)}
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(shop.status)}`}>
                                            {shop.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Owner: {shop.ownerName}</p>
                                    <p className="text-xs text-gray-500">{shop.ownerEmail} • {new Date(shop.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {shop.status === 'pending' && (
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}