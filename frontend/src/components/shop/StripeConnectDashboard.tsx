'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CreditCard,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Clock,
    Settings,
    DollarSign
} from 'lucide-react';

interface StripeConnectStatus {
    hasAccount: boolean;
    onboardingComplete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    accountId?: string;
}

export default function StripeConnectDashboard() {
    const [status, setStatus] = useState<StripeConnectStatus>({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
    });
    const [loading, setLoading] = useState(true);
    const [creatingAccount, setCreatingAccount] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const response = await fetch('stripe-connect/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();
            setStatus(data.data);
        } catch (error) {
            console.error('Failed to load Stripe status:', error);
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async () => {
        setCreatingAccount(true);
        try {
            const response = await fetch('stripe-connect/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                // Redirect to Stripe onboarding
                window.location.href = data.data.onboardingUrl;
            }
        } catch (error) {
            console.error('Failed to create account:', error);
        } finally {
            setCreatingAccount(false);
        }
    };

    const continueOnboarding = async () => {
        try {
            const response = await fetch('stripe-connect/onboarding-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                window.location.href = data.data.onboardingUrl;
            }
        } catch (error) {
            console.error('Failed to create onboarding link:', error);
        }
    };

    const openStripeDashboard = async () => {
        try {
            const response = await fetch('stripe-connect/login-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();

            if (data.success) {
                window.open(data.data.loginUrl, '_blank');
            }
        } catch (error) {
            console.error('Failed to create login link:', error);
        }
    };

    const refreshStatus = async () => {
        setLoading(true);
        await loadStatus();
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Stripe Connect Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading Stripe status...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = () => {
        if (!status.hasAccount) {
            return <Badge variant="outline">Not Connected</Badge>;
        }
        if (status.onboardingComplete && status.chargesEnabled && status.payoutsEnabled) {
            return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        }
        if (status.chargesEnabled && !status.payoutsEnabled) {
            return <Badge className="bg-yellow-100 text-yellow-800">Partial Setup</Badge>;
        }
        return <Badge className="bg-orange-100 text-orange-800">Setup Required</Badge>;
    };

    const getStatusMessage = () => {
        if (!status.hasAccount) {
            return {
                title: "Connect Your Stripe Account",
                description: "Start accepting payments by creating a Stripe Express account. You'll be guided through the KYC process.",
                icon: <AlertCircle className="h-8 w-8 text-orange-600" />
            };
        }
        if (status.onboardingComplete && status.chargesEnabled && status.payoutsEnabled) {
            return {
                title: "Stripe Account Fully Active",
                description: "Your account is ready to accept payments and receive payouts. You can manage your account through the Stripe Dashboard.",
                icon: <CheckCircle className="h-8 w-8 text-green-600" />
            };
        }
        if (status.chargesEnabled && !status.payoutsEnabled) {
            return {
                title: "Almost Ready - Complete Payout Setup",
                description: "You can accept payments, but you need to complete additional verification to receive payouts. Check your Stripe Dashboard for required information.",
                icon: <AlertCircle className="h-8 w-8 text-yellow-600" />
            };
        }
        return {
            title: "Complete Your Stripe Setup",
            description: "Finish the onboarding process to start accepting payments. This typically takes a few minutes.",
            icon: <Clock className="h-8 w-8 text-blue-600" />
        };
    };

    const statusInfo = getStatusMessage();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Stripe Connect Status
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge()}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshStatus}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        {statusInfo.icon}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{statusInfo.title}</h3>
                            <p className="text-gray-600 mb-4">{statusInfo.description}</p>

                            {/* Account Details */}
                            {status.hasAccount && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium mb-2">Account Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Charges: {status.chargesEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Payouts: {status.payoutsEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            <span>Onboarding: {status.onboardingComplete ? 'Complete' : 'In Progress'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {!status.hasAccount ? (
                                    <Button
                                        onClick={createAccount}
                                        disabled={creatingAccount}
                                        className="min-w-32"
                                    >
                                        {creatingAccount ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Create Stripe Account
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <>
                                        {!status.onboardingComplete && (
                                            <Button onClick={continueOnboarding}>
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Complete Setup
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={openStripeDashboard}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Open Stripe Dashboard
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Why Stripe Connect?</strong> Stripe Express allows you to accept payments directly from customers.
                    Platform fees are automatically deducted, and payouts are sent directly to your bank account.
                    The KYC (Know Your Customer) process is required by financial regulations and typically takes a few minutes to complete.
                </AlertDescription>
            </Alert>
        </div>
    );
}