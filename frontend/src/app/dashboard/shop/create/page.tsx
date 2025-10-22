'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Store } from 'lucide-react';

export default function CreateShopPage() {
    const { user } = useRequireAuth(['shop_owner', 'platform_admin']);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        email: user?.email || '',
        phone: '',
        website: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create shop');
            }

            const shop = await response.json();
            router.push('/dashboard/shop');
        } catch (error) {
            console.error('Error creating shop:', error);
            alert('Failed to create shop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create Your Shop</h1>
                    <p className="text-gray-600 mt-1">Set up your online store</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shop Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Store className="h-5 w-5 mr-2" />
                                Shop Information
                            </CardTitle>
                            <CardDescription>
                                Basic information about your shop
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="name">Shop Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                    placeholder="Enter your shop name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe your shop and what you sell"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Shop Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                    placeholder="shop@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="https://your-shop.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Getting Started Guide */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                What's Next?
                            </CardTitle>
                            <CardDescription>
                                After creating your shop, you'll be able to:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">1</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Add Products</h4>
                                    <p className="text-sm text-gray-600">List your products for sale</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Setup Payments</h4>
                                    <p className="text-sm text-gray-600">Connect Stripe to receive payments</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-medium">Start Selling</h4>
                                    <p className="text-sm text-gray-600">Accept orders from customers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                Creating Shop...
                            </>
                        ) : (
                            <>
                                <Store className="h-4 w-4 mr-2" />
                                Create Shop
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}