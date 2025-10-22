import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, plan, express = false } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Convert plan to billingCycle
    let billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly' = 'one_time';
    if (plan === 'weekly') billingCycle = 'weekly';
    else if (plan === 'monthly') billingCycle = 'monthly';
    else if (plan === 'yearly') billingCycle = 'yearly';

    // Create checkout session via backend API
    const sessionData = {
      productId,
      quantity,
      billingCycle,
    };

    const response = await fetch(`${API_URL}/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const result = await response.json();

    if (!result.data || !result.data.sessionId) {
      console.error('Invalid response structure:', result);
      throw new Error('Invalid response from backend: missing session ID');
    }

    return NextResponse.json({
      success: true,
      sessionId: result.data.sessionId,
      checkoutUrl: result.data.checkoutUrl || `/checkout/${result.data.sessionId}`,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}