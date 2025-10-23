'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get all search params and redirect to main checkout
      const params = new URLSearchParams(searchParams.toString());
      const targetUrl = `/checkout${params.toString() ? '?' + params.toString() : ''}`;

      // Add a small delay to ensure proper routing
      const timer = setTimeout(() => {
        router.push(targetUrl);
      }, 100);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Redirect error:', err);
      setError('Failed to redirect to checkout');
    }
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <h2 className="text-xl font-semibold">Redirect Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/shops'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}