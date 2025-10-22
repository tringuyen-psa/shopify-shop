'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscriptionsApi, Subscription } from '@/lib/api/subscriptions';
import {
    CreditCard,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Pause,
    Play,
    X,
    ArrowRight
} from 'lucide-react';

export default function CustomerSubscriptions() {
    const { user } = useRequireAuth(['customer']);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    async function loadSubscriptions() {
        try {
            const response = await subscriptionsApi.getMySubscriptions();
            setSubscriptions(Array.isArray(response?.subscriptions) ? response.subscriptions : []);
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
            setError('Failed to load subscriptions. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancelSubscription(subscriptionId: string) {
        if (!confirm('Are you sure you want to cancel this subscription? This will stop future billing.')) {
            return;
        }

        try {
            await subscriptionsApi.cancelSubscription(subscriptionId);
            // Refresh subscriptions
            await loadSubscriptions();
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
            setError('Failed to cancel subscription. Please try again.');
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'canceled':
                return <X className="h-5 w-5 text-red-500" />;
            case 'past_due':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
            case 'paused':
                return <Pause className="h-5 w-5 text-yellow-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'past_due':
                return 'bg-orange-100 text-orange-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    function getBillingCycleDisplay(cycle: string) {
        return cycle.charAt(0).toUpperCase() + cycle.slice(1, -2);
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
                        <p className="text-gray-600 mt-2">Manage your recurring payments and subscriptions</p>
                    </div>
                    <Link href="/shops">
                        <Button className="flex items-center gap-2">
                            Browse Products
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {!Array.isArray(subscriptions) || subscriptions.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                            You don't have any active subscriptions yet. Subscribe to products to enjoy recurring deliveries and exclusive benefits.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/shops">
                                <Button>Browse Products</Button>
                            </Link>
                            <Link href="/dashboard/customer">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {subscriptions.filter(s => s.status === 'active').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${subscriptions
                                        .filter(s => s.status === 'active')
                                        .reduce((sum, sub) => {
                                            const monthlyAmount = sub.billingCycle === 'monthly' ? sub.amount :
                                                sub.billingCycle === 'yearly' ? sub.amount / 12 :
                                                    sub.billingCycle === 'weekly' ? sub.amount * 4.33 : sub.amount;
                                            return sum + monthlyAmount;
                                        }, 0)
                                        .toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per month average
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {subscriptions
                                        .filter(s => s.status === 'active')
                                        .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())[0]
                                        ? new Date(
                                            subscriptions
                                                .filter(s => s.status === 'active')
                                                .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())[0]
                                                .nextBillingDate
                                        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Earliest next payment
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subscriptions List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Your Subscriptions</h2>
                        {subscriptions.map((subscription) => (
                            <Card key={subscription.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{subscription.productName}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(subscription.status)}`}>
                                                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-1">{subscription.shopName}</p>
                                            <p className="text-sm text-gray-500">
                                                {getBillingCycleDisplay(subscription.billingCycle)} • ${subscription.amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">${subscription.amount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">/{getBillingCycleDisplay(subscription.billingCycle).toLowerCase()}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Next Billing Info */}
                                        {subscription.status === 'active' && (
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm text-blue-800">
                                                        Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Subscription Details */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Started:</span>
                                                <p className="font-medium">
                                                    {new Date(subscription.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Status:</span>
                                                <div className="flex items-center gap-1">
                                                    {getStatusIcon(subscription.status)}
                                                    <span className="font-medium capitalize">{subscription.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            {subscription.status === 'active' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelSubscription(subscription.id)}
                                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                >
                                                    Cancel Subscription
                                                </Button>
                                            )}
                                            <Link href={`/shops/${subscription.shopSlug}/products/${subscription.productSlug}`}>
                                                <Button variant="outline" size="sm">
                                                    View Product
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}