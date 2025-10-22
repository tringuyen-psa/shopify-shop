'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { shopsApi, Shop } from '@/lib/api/shops';
import { checkStripeAccountStatus } from '@/lib/api/stripe-connect';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    CreditCard,
    AlertCircle,
    CheckCircle,
    Settings,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

export default function ShopOwnerDashboard() {
    const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
    const router = useRouter();
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [accountStatus, setAccountStatus] = useState<any>(null);
    const [checkingAccount, setCheckingAccount] = useState(false);
    const [showAccountDialog, setShowAccountDialog] = useState(false);

    useEffect(() => {
        loadShop();
    }, []);

    async function loadShop() {
        try {
            const shops = await shopsApi.getMyShop();

            if (!shops || shops.length === 0) {
                setShop(null);
            } else {
                // Set the first shop (assuming one shop per user for now)
                setShop(shops[0]);
            }
        } catch (error) {
            console.error('Failed to load shop:', error);
            setShop(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleStartOnboarding() {
        if (!shop) return;

        try {
            const { onboardingUrl } = await shopsApi.startOnboarding(shop.id);
            window.location.href = onboardingUrl;
        } catch (error) {
            console.error('Failed to start onboarding:', error);
        }
    }

    async function handleCheckAccountStatus() {
        if (!shop?.stripeAccountId) return;

        setCheckingAccount(true);
        try {
            const data = await checkStripeAccountStatus(shop.stripeAccountId);
            setAccountStatus(data.data);
            setShowAccountDialog(true);
        } catch (error) {
            console.error('Error checking account status:', error);
        } finally {
            setCheckingAccount(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

    if (!shop && !loading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Shop Found</h1>
                    <p className="text-gray-600 mb-6">You haven't created a shop yet. Create your first shop to start selling products.</p>
                    <Button onClick={() => router.push('/dashboard/shop/create')}>
                        Create Your Shop
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    {shop ? `Welcome to ${shop.name}` : 'Manage your shop and track your sales'}
                </p>
            </div>

            {/* KYC Status Alert */}
            {shop && !shop.stripeChargesEnabled && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-800">
                                    Complete Your Shop Setup
                                </h3>
                                <p className="text-yellow-700 mt-1">
                                    To start receiving payments, you need to complete the KYC verification process with Stripe.
                                </p>
                                <div className="flex gap-3 mt-3">
                                    <Button
                                        onClick={handleStartOnboarding}
                                        className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Complete KYC Verification
                                    </Button>
                                    {shop?.stripeAccountId && (
                                        <Button
                                            variant="outline"
                                            onClick={handleCheckAccountStatus}
                                            disabled={checkingAccount}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${checkingAccount ? 'animate-spin' : ''}`} />
                                            Check Account Status
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {shop && shop.stripeChargesEnabled && (
                <Card className="mb-6 border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">
                                    Shop Ready for Business
                                </h3>
                                <p className="text-green-700">
                                    Your shop is fully set up and ready to receive payments
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Active products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Active subscriptions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Add Your First Product
                        </CardTitle>
                        <CardDescription>
                            Start selling by adding your first product
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Create Product
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            View Analytics
                        </CardTitle>
                        <CardDescription>
                            Track your sales and performance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            View Analytics
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Shop Settings
                        </CardTitle>
                        <CardDescription>
                            Configure your shop details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Manage Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Your latest shop activity and updates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent activity</p>
                        <p className="text-sm">Start by adding products to your shop</p>
                    </div>
                </CardContent>
            </Card>

            {/* Account Status Dialog */}
            <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Stripe Account Status
                        </DialogTitle>
                    </DialogHeader>

                    {accountStatus && (
                        <div className="space-y-6">
                            {/* Account Overview */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Account ID:</span>
                                        <p className="font-mono text-xs mt-1">{accountStatus.accountId}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Email:</span>
                                        <p className="mt-1">{accountStatus.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="space-y-3">
                                <h4 className="font-semibold">Account Status</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Charges Enabled</span>
                                        <Badge className={accountStatus.chargesEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {accountStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Payouts Enabled</span>
                                        <Badge className={accountStatus.payoutsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {accountStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Details Submitted</span>
                                        <Badge className={accountStatus.detailsSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {accountStatus.detailsSubmitted ? 'Submitted' : 'Pending'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Overall Status</span>
                                        <Badge className={accountStatus.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {accountStatus.isVerified ? 'Verified ✅' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            {accountStatus.currentlyDue && accountStatus.currentlyDue.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-yellow-700">Required Information</h4>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {accountStatus.currentlyDue.map((req: string, index: number) => (
                                                <li key={index} className="flex items-center gap-2 text-sm">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Shop Status */}
                            {accountStatus.shop && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Shop Status</h4>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span>Shop Name</span>
                                                <span className="font-medium">{accountStatus.shop.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Active</span>
                                                <Badge className={accountStatus.shop.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {accountStatus.shop.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`https://dashboard.stripe.com/${accountStatus.accountId}`, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Stripe Dashboard
                                </Button>
                                <Button
                                    onClick={() => setShowAccountDialog(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}