'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function KycTestPage() {
    const [stripeAccountId, setStripeAccountId] = useState('acct_1SKyKqGwEqlEb8pc');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const checkKYC = async () => {
        setLoading(true);
        setResult(null);

        try {
            // Gọi API để lấy details từ Stripe
            const response = await fetch('stripe-connect/check-kyc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ stripeAccountId })
            });

            const data = await response.json();
            setResult(data);

            console.log('KYC Check Result:', data);
        } catch (error) {
            console.error('KYC Check Error:', error);
            setResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const activateShop = async () => {
        if (!result?.success) {
            alert('Vui lòng check KYC trước khi kích hoạt shop');
            return;
        }

        try {
            const response = await fetch('stripe-connect/onboarding-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ stripeAccountId })
            });

            const data = await response.json();
            console.log('Activate Shop Result:', data);
            alert('Đã kích hoạt shop thành công!');
        } catch (error) {
            console.error('Activate Shop Error:', error);
            alert('Lỗi khi kích hoạt shop: ' + error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">KYC Test Tool</CardTitle>
                        <CardDescription>
                            Kiểm tra trạng thái KYC và kích hoạt shop
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                            <Input
                                id="stripeAccountId"
                                value={stripeAccountId}
                                onChange={(e) => setStripeAccountId(e.target.value)}
                                placeholder="acct_xxxxxxxxxxxx"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                onClick={checkKYC}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Đang kiểm tra...' : 'Kiểm tra KYC từ Stripe'}
                            </Button>

                            <Button
                                onClick={activateShop}
                                disabled={!result?.success}
                                variant="default"
                                className="flex-1"
                            >
                                Kích hoạt Shop
                            </Button>
                        </div>

                        {result && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {result.success ? '✅ KYC Status' : '❌ KYC Error'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <strong>Charges Enabled:</strong> {result.shopStatus?.stripeChargesEnabled ? '✅ Yes' : '❌ No'}
                                        </div>
                                        <div>
                                            <strong>Payouts Enabled:</strong> {result.shopStatus?.stripePayoutsEnabled ? '✅ Yes' : '❌ No'}
                                        </div>
                                        <div>
                                            <strong>Shop Active:</strong> {result.shopStatus?.isActive ? '✅ Yes' : '❌ No'}
                                        </div>
                                        <div>
                                            <strong>Shop Status:</strong> {result.shopStatus?.status}
                                        </div>
                                        {result.message && (
                                            <div>
                                                <strong>Message:</strong> {result.message}
                                            </div>
                                        )}
                                        {result.requirements && result.requirements.length > 0 && (
                                            <div>
                                                <strong>Requirements:</strong>
                                                <ul className="list-disc list-inside ml-4 mt-2">
                                                    {result.requirements.map((req: any, index) => (
                                                        <li key={index} className="text-sm">{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Hướng dẫn sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>
                                <strong>Bước 1:</strong> Nhập Stripe Account ID của shop
                            </li>
                            <li>
                                <strong>Bước 2:</strong> Click "Kiểm tra KYC từ Stripe" để lấy trạng thái hiện tại
                            </li>
                            <li>
                                <strong>Bước 3:</strong> Nếu KYC hoàn tất (charges enabled + payouts enabled), click "Kích hoạt Shop"
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4">
                <p className="text-sm text-gray-600 text-center">
                    Note: Đây là công cụ test. Trong production, quá trình này sẽ tự động chạy qua webhook.
                </p>
            </div>
        </div>
    );
}