import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
}) : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        // Update checkout session status
        await updateCheckoutSession(paymentIntent.metadata.checkoutSessionId, 'completed');

        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPaymentIntent.id);

        // Update checkout session status
        await updateCheckoutSession(failedPaymentIntent.metadata.checkoutSessionId, 'pending');

        break;

      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', checkoutSession.id);

        // Update checkout session status
        await updateCheckoutSessionByStripeId(checkoutSession.id, 'completed');

        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', expiredSession.id);

        // Update checkout session status
        await updateCheckoutSessionByStripeId(expiredSession.id, 'expired');

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function updateCheckoutSession(sessionId: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/update-session-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        status,
      }),
    });

    if (!response.ok) {
      console.error('Failed to update checkout session status');
    }
  } catch (error) {
    console.error('Error updating checkout session:', error);
  }
}

async function updateCheckoutSessionByStripeId(stripeSessionId: string, status: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/update-session-by-stripe-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripeSessionId,
        status,
      }),
    });

    if (!response.ok) {
      console.error('Failed to update checkout session by stripe ID');
    }
  } catch (error) {
    console.error('Error updating checkout session by stripe ID:', error);
  }
}