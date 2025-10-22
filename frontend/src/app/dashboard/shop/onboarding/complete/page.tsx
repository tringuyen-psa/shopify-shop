'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shopsApi } from '@/lib/api/shops';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function OnboardingCompletePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'pending' | 'error'>('pending');

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    async function checkOnboardingStatus() {
        try {
            // Get shop ID from session storage or localStorage
            const shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
            if (!shopId) {
                setStatus('error');
                setLoading(false);
                return;
            }

            const connectStatus = await shopsApi.getConnectStatus(shopId);

            if (connectStatus.chargesEnabled && connectStatus.payoutsEnabled) {
                setStatus('success');
            } else if (connectStatus.accountId) {
                setStatus('pending');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }

    async function handleContinue() {
        router.push('/dashboard/shop');
    }

    async function handleRetryKYC() {
        const shopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
        if (!shopId) {
            router.push('/dashboard/shop/onboarding');
            return;
        }

        try {
            const { kycUrl } = await shopsApi.createKYCLink(shopId);
            window.location.href = kycUrl;
        } catch (error: any) {
            alert(error.message || 'Failed to create KYC link');
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold">Checking Your Status...</h3>
                        <p className="text-gray-600 mt-2">Please wait while we verify your Stripe account setup.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h3>
                        <p className="text-green-700 mb-6">
                            Your Stripe Connect account has been successfully set up and you're ready to start receiving payments.
                        </p>
                        <Button onClick={handleContinue} size="lg">
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardContent className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-yellow-800 mb-2">Verification In Progress</h3>
                        <p className="text-yellow-700 mb-6">
                            Your Stripe account setup is in progress. You may need to complete additional verification steps in your Stripe dashboard.
                        </p>
                        <div className="space-y-4">
                            <Button onClick={handleRetryKYC} variant="outline" className="w-full">
                                Continue Verification
                            </Button>
                            <Button onClick={handleContinue} variant="outline" className="w-full">
                                Go to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Card>
                <CardContent className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-800 mb-2">Setup Incomplete</h3>
                    <p className="text-red-700 mb-6">
                        We couldn't complete your Stripe Connect setup. Let's try again.
                    </p>
                    <div className="space-y-4">
                        <Button onClick={() => router.push('/dashboard/shop/onboarding')} className="w-full">
                            Start Over
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}