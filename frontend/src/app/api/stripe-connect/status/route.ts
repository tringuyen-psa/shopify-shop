import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/stripe-connect/account-details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If no account exists, return default status
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: {
            hasAccount: false,
            onboardingComplete: false,
            chargesEnabled: false,
            payoutsEnabled: false,
          }
        });
      }

      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get Stripe status');
    }

    const result = await response.json();
    const account = result.data;

    // Extract relevant status information
    const statusData = {
      hasAccount: true,
      onboardingComplete: account.charges_enabled && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountId: account.id,
    };

    return NextResponse.json({
      success: true,
      data: statusData,
    });
  } catch (error) {
    console.error('Stripe Connect status error:', error);

    // Return default status on error
    return NextResponse.json({
      success: true,
      data: {
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }
    });
  }
}