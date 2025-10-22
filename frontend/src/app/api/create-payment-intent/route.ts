import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethodId, sessionId, amount, stripeAccountId } = body;

    if (!paymentMethodId || !sessionId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentMethodId, sessionId, amount' },
        { status: 400 }
      );
    }

    // Create payment intent via backend API
    const response = await fetch(`${API_URL}/checkout/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        paymentMethodId,
        amount,
        stripeAccountId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment intent');
    }

    const result = await response.json();

    return NextResponse.json({
      clientSecret: result.data.clientSecret,
    });

  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}