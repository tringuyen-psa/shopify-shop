'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shopsApi, Shop, CreateShopRequest } from '@/lib/api/shops';
import {
  Store,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function ShopOnboardingPage() {
  const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<CreateShopRequest>({
    name: '',
    description: '',
    email: user?.email || '',
    phone: user?.phone || '',
    website: ''
  });

  useEffect(() => {
    checkExistingShop();
  }, []);

  async function checkExistingShop() {
    try {
      const existingShop = await shopsApi.getMyShop();
      setShop(existingShop);

      if (existingShop.stripeChargesEnabled) {
        // Shop is fully set up, redirect to dashboard
        router.push('/dashboard/shop');
      } else if (existingShop.stripeAccountId) {
        // Shop exists but KYC not complete
        setStep(2);
      }
    } catch (error) {
      // No shop exists, start from step 1
      console.log('No existing shop found');
    }
  }

  async function handleCreateShop(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const newShop = await shopsApi.createShop(formData);
      setShop(newShop);
      setStep(2);
    } catch (error: any) {
      alert(error.message || 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartKYC() {
    if (!shop) return;

    setLoading(true);
    try {
      const { onboardingUrl } = await shopsApi.startOnboarding(shop.id);
      window.location.href = onboardingUrl;
    } catch (error: any) {
      alert(error.message || 'Failed to start KYC process');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckKYCStatus() {
    if (!shop) return;

    try {
      const status = await shopsApi.getConnectStatus(shop.id);
      if (status.chargesEnabled) {
        // KYC complete, redirect to dashboard
        router.push('/dashboard/shop');
      } else {
        alert('KYC verification is still in progress. Please complete it in Stripe dashboard.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to check KYC status');
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Create Your Shop</CardTitle>
            <CardDescription>
              Let's start by setting up your shop information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShop} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Shop Name *</label>
                <Input
                  placeholder="Enter your shop name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe your shop and what you sell"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shop Email *</label>
                <Input
                  type="email"
                  placeholder="shop@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating Shop...' : 'Create Shop'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* KYC Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Payment Setup
            </CardTitle>
            <CardDescription>
              Complete your Stripe Connect setup to start receiving payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shop?.stripeAccountId ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium">KYC In Progress</p>
                    <p className="text-yellow-700 text-sm">
                      Your Stripe account has been created but verification is pending.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleStartKYC}
                    disabled={loading}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Continue KYC Process
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCheckKYCStatus}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Ready to Set Up Payments?</h3>
                  <p className="text-gray-600">
                    We'll guide you through Stripe's secure onboarding process
                  </p>
                </div>
                <Button
                  onClick={handleStartKYC}
                  disabled={loading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Redirecting...' : 'Start Payment Setup'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Business Information</h4>
                  <p className="text-sm text-gray-600">
                    Provide basic details about your business
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Personal Verification</h4>
                  <p className="text-sm text-gray-600">
                    Verify your identity as the business owner
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Bank Account Setup</h4>
                  <p className="text-sm text-gray-600">
                    Connect your bank account for payouts
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Start Selling</h4>
                  <p className="text-sm text-gray-600">
                    Once approved, you can start receiving payments immediately
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Stripe Connect?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Secure payment processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Fast payouts (2-7 days)</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Multi-currency support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Built-in fraud protection</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}