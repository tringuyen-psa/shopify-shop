import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get user's shop
    const shopsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shops/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch shops' },
        { status: shopsResponse.status }
      );
    }

    const shops = await shopsResponse.json();
    if (!shops || shops.length === 0) {
      return NextResponse.json(
        { error: 'No shop found' },
        { status: 404 }
      );
    }

    const shop = shops[0];

    // Call backend to force update Stripe status to true
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe-connect/force-complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to complete Stripe setup' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        hasAccount: true,
        onboardingComplete: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        shop: data.shop
      }
    });

  } catch (error) {
    console.error('Force complete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}