import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Call the backend checkout confirmation endpoint
    const backendResponse = await fetch(
      `${BACKEND_URL}/checkout/orders/confirm?session_id=${session_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to confirm order'
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Order confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}