'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shopsApi } from '@/lib/api/shops';
import { RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';

export default function KYCRefreshPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    // Get shop ID from storage
    const storedShopId = localStorage.getItem('currentShopId') || sessionStorage.getItem('currentShopId');
    if (storedShopId) {
      setShopId(storedShopId);
    } else {
      // If no shop ID, redirect to onboarding start
      router.push('/dashboard/shop/onboarding');
    }
  }, [router]);

  async function handleCreateNewKYCLink() {
    if (!shopId) return;

    setLoading(true);
    try {
      const { kycUrl } = await shopsApi.createKYCLink(shopId);
      window.location.href = kycUrl;
    } catch (error: any) {
      alert(error.message || 'Failed to create new KYC link');
      setLoading(false);
    }
  }

  async function handleStartOnboarding() {
    if (!shopId) return;

    setLoading(true);
    try {
      const { onboardingUrl } = await shopsApi.startOnboarding(shopId);
      window.location.href = onboardingUrl;
    } catch (error: any) {
      alert(error.message || 'Failed to start onboarding');
      setLoading(false);
    }
  }

  async function handleDashboard() {
    if (!shopId) return;

    try {
      const { dashboardUrl } = await shopsApi.getDashboardLink(shopId);
      window.open(dashboardUrl, '_blank');
    } catch (error: any) {
      alert(error.message || 'Failed to open Stripe dashboard');
    }
  }

  if (!shopId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold">Loading...</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">KYC Verification Required</CardTitle>
          <p className="text-gray-600 mt-2">
            Your KYC verification link has expired or additional verification is needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Why is this needed?</h4>
            <p className="text-yellow-800 text-sm">
              Stripe requires identity verification to comply with financial regulations.
              This ensures secure payment processing and protects against fraud.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What you'll need:</h4>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Government-issued ID (passport, driver's license, etc.)</li>
              <li>Business registration documents (if applicable)</li>
              <li>Bank account information for payouts</li>
              <li>Proof of address (utility bill, bank statement)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCreateNewKYCLink}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {loading ? 'Creating Link...' : 'Start KYC Verification'}
            </Button>

            <div className="text-center text-sm text-gray-500">
              If you need to complete general onboarding first:
            </div>

            <Button
              onClick={handleStartOnboarding}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Complete General Onboarding
            </Button>

            <Button
              onClick={handleDashboard}
              variant="ghost"
              className="w-full"
            >
              Open Stripe Dashboard
            </Button>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/dashboard/shop')}
              variant="ghost"
              size="sm"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}