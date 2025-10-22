import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, message: 'Shop ID is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:29000';

    // Call stripe onboarding complete endpoint
    const response = await fetch(`${backendUrl}/stripe-connect/onboarding-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || 'dev-token'}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to activate shop' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shop activated successfully',
      data: data.data
    });
  } catch (error) {
    console.error('Activate shop API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}