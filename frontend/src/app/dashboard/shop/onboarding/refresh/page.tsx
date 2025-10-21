'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shopsApi } from '@/lib/api/shops';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function OnboardingRefreshPage() {
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

  async function handleRefreshLink() {
    if (!shopId) return;

    setLoading(true);
    try {
      const { onboardingUrl } = await shopsApi.refreshOnboarding(shopId);
      window.location.href = onboardingUrl;
    } catch (error: any) {
      alert(error.message || 'Failed to refresh onboarding link');
      setLoading(false);
    }
  }

  async function handleCreateNewLink() {
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
          <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Refresh Your Onboarding</CardTitle>
          <p className="text-gray-600 mt-2">
            Your previous onboarding link has expired. Create a new one to continue your setup.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Why did this happen?</h4>
            <p className="text-blue-800 text-sm">
              Stripe onboarding links expire after a period of inactivity or after one use.
              This is for security reasons to ensure your account setup is up to date.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRefreshLink}
              disabled={loading}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {loading ? 'Creating Link...' : 'Continue Original Onboarding'}
            </Button>

            <div className="text-center text-sm text-gray-500">
              or
            </div>

            <Button
              onClick={handleCreateNewLink}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Start Fresh KYC Verification
            </Button>
          </div>

          <div className="text-center">
            <Button
              onClick={() => router.push('/dashboard/shop/onboarding')}
              variant="ghost"
              size="sm"
            >
              Back to Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}