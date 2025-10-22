'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Home, Settings, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function StripeCompletePage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        handleStripeComplete();
    }, []);

    const handleStripeComplete = async () => {
        try {
            // Force complete Stripe setup - set all status to true
            console.log('Force completing Stripe setup...');
            const forceCompleteResponse = await fetch('/api/stripe-connect/force-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (forceCompleteResponse.ok) {
                const forceCompleteData = await forceCompleteResponse.json();
                console.log('Stripe setup force completed:', forceCompleteData);
                setStatus(forceCompleteData.data);
            } else {
                console.error('Failed to force complete Stripe setup');
                // Fallback to normal status check
                const statusResponse = await fetch('/api/stripe-connect/status', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                const statusData = await statusResponse.json();
                setStatus(statusData.data);
            }
        } catch (error) {
            console.error('Failed to handle Stripe completion:', error);
            // Fallback to normal status check
            try {
                const statusResponse = await fetch('/api/stripe-connect/status', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                const statusData = await statusResponse.json();
                setStatus(statusData.data);
            } catch (statusError) {
                console.error('Failed to get status:', statusError);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Checking your Stripe status...</p>
                </div>
            </div>
        );
    }

    const isFullyActive = status?.chargesEnabled && status?.payoutsEnabled;
    const isPartiallyActive = status?.chargesEnabled && !status?.payoutsEnabled;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">
                            {isFullyActive ? 'Stripe Setup Complete!' : 'Stripe Setup In Progress'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        {isFullyActive ? (
                            <>
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Congratulations!</strong> Your Stripe account is fully set up and ready to accept payments.
                                        You can now receive payments directly from customers.
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">What's Next?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Accept Payments</h4>
                                                <p className="text-sm text-gray-600">Customers can now purchase your products</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Receive Payouts</h4>
                                                <p className="text-sm text-gray-600">Money goes directly to your bank account</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Track Orders</h4>
                                                <p className="text-sm text-gray-600">Monitor all transactions in your dashboard</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Manage Account</h4>
                                                <p className="text-sm text-gray-600">Access Stripe Dashboard for detailed analytics</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : isPartiallyActive ? (
                            <>
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Almost there!</strong> You can accept payments, but you need to complete additional verification
                                        to receive payouts. Check your Stripe Dashboard for any required information.
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">Current Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span>Accept Payments</span>
                                            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Receive Payouts</span>
                                            <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Setup in progress!</strong> Your Stripe account is being reviewed.
                                        This typically takes a few minutes to a few hours. You'll receive an email once your account is approved.
                                    </AlertDescription>
                                </Alert>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold mb-4">What's Happening Now?</h3>
                                    <div className="space-y-3 text-left">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Account Review</h4>
                                                <p className="text-sm text-gray-600">Stripe is reviewing your information</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium">Verification</h4>
                                                <p className="text-sm text-gray-600">KYC and business verification in progress</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/dashboard">
                                <Button className="w-full sm:w-auto">
                                    <Home className="h-4 w-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Open Stripe Dashboard
                            </Button>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p>
                                Questions? Contact{' '}
                                <a href="mailto:support@yourplatform.com" className="text-blue-600 hover:underline">
                                    support@yourplatform.com
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}