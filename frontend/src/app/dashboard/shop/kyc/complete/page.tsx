'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shopsApi } from '@/lib/api/shops';
import { CheckCircle, AlertCircle, ArrowRight, Shield, CreditCard } from 'lucide-react';

export default function KYCCompletePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'pending' | 'error'>('pending');
    const [connectStatus, setConnectStatus] = useState<any>(null);

    useEffect(() => {
        checkKYCStatus();
    }, []);

    async function checkKYCStatus() {
        try {
            // Get shop ID from storage
            const shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
            if (!shopId) {
                setStatus('error');
                setLoading(false);
                return;
            }

            const status = await shopsApi.getConnectStatus(shopId);
            setConnectStatus(status);

            if (status.chargesEnabled && status.payoutsEnabled) {
                setStatus('success');
            } else if (status.accountId) {
                setStatus('pending');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error checking KYC status:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }

    async function handleContinue() {
        router.push('/dashboard/shop');
    }

    async function handleDashboard() {
        const shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
        if (!shopId) return;

        try {
            const { dashboardUrl } = await shopsApi.getDashboardLink(shopId);
            window.open(dashboardUrl, '_blank');
        } catch (error: any) {
            alert(error.message || 'Failed to open Stripe dashboard');
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold">Verifying KYC Status...</h3>
                        <p className="text-gray-600 mt-2">Please wait while we check your verification status.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-800 mb-2">KYC Verification Complete!</h3>
                        <p className="text-green-700 mb-6">
                            Your identity has been successfully verified and your Stripe account is ready for payments.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button onClick={handleContinue} size="lg">
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Go to Dashboard
                            </Button>
                            <Button onClick={handleDashboard} variant="outline" size="lg">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Stripe Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            What's Enabled Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                                    <span className="font-medium">Payment Processing</span>
                                </div>
                                <span className="text-sm text-green-700">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                                    <span className="font-medium">Payouts</span>
                                </div>
                                <span className="text-sm text-green-700">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                                    <span className="font-medium">Stripe Dashboard Access</span>
                                </div>
                                <span className="text-sm text-blue-700">Available</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-yellow-800 mb-2">Verification In Progress</h3>
                        <p className="text-yellow-700 mb-6">
                            Your KYC verification is being processed. Stripe may need additional information or time to complete the review.
                        </p>
                        <div className="space-y-4">
                            <Button onClick={handleDashboard} variant="outline" className="w-full">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Check Stripe Dashboard
                            </Button>
                            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Check Status Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {connectStatus && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Account Created</span>
                                    <span className={`px-2 py-1 text-xs rounded ${connectStatus.accountId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {connectStatus.accountId ? 'Complete' : 'Incomplete'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Charges Enabled</span>
                                    <span className={`px-2 py-1 text-xs rounded ${connectStatus.chargesEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {connectStatus.chargesEnabled ? 'Yes' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">Payouts Enabled</span>
                                    <span className={`px-2 py-1 text-xs rounded ${connectStatus.payoutsEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {connectStatus.payoutsEnabled ? 'Yes' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardContent className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-800 mb-2">KYC Verification Issue</h3>
                    <p className="text-red-700 mb-6">
                        There was an issue with your KYC verification. Please check your Stripe dashboard for more information.
                    </p>
                    <div className="space-y-4">
                        <Button onClick={handleDashboard} className="w-full">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Go to Stripe Dashboard
                        </Button>
                        <Button onClick={() => router.push('/dashboard/shop/onboarding')} variant="outline" className="w-full">
                            Start Over
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}