import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordPaymentInSupabase } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json({ message: 'Stripe secret key not configured' }, { status: 200 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // If webhook secret not configured yet, parse body directly for testing
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle specific Stripe event types
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment confirmed: ${paymentIntent.id} for amount ${paymentIntent.amount} ${paymentIntent.currency}`);

      // Record transaction into Supabase database
      await recordPaymentInSupabase({
        email: paymentIntent.receipt_email || paymentIntent.metadata?.email || 'customer@verified.com',
        full_name: paymentIntent.metadata?.full_name || 'Verified Listener',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripe_payment_id: paymentIntent.id,
        status: 'succeeded',
        accumulated_balance: 114.93,
        country: paymentIntent.metadata?.country || 'US',
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn(`Payment failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message}`);
      break;
    }
    case 'payment_intent.processing': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment is processing: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
