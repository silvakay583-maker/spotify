import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { recordPaymentInSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { paymentIntentId, email, name } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    let finalEmail = (email || '').trim();
    let finalName = name || 'Verified Listener';
    let status = 'unverified';
    let amount = 9.0;
    let currency = 'usd';

    // Verify directly with Stripe when secret key and paymentIntentId are provided
    if (stripeSecretKey && stripeSecretKey.trim() !== '' && !stripeSecretKey.includes('placeholder') && paymentIntentId) {
      try {
        const stripe = new Stripe(stripeSecretKey);
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

        status = pi.status;
        amount = pi.amount / 100;
        currency = pi.currency;

        if (pi.receipt_email) {
          finalEmail = pi.receipt_email.trim();
        } else if (pi.metadata?.email) {
          finalEmail = pi.metadata.email.trim();
        }

        if (pi.metadata?.full_name) {
          finalName = pi.metadata.full_name;
        }
      } catch (stripeErr) {
        console.warn('Could not retrieve paymentIntent from Stripe:', stripeErr);
      }
    }

    const cleanLowerEmail = finalEmail.toLowerCase();
    const isRealEmail =
      cleanLowerEmail &&
      cleanLowerEmail.includes('@') &&
      cleanLowerEmail !== 'customer@verified.com' &&
      cleanLowerEmail !== 'listener@spotifyrewards.com' &&
      !cleanLowerEmail.endsWith('@spotify.lead');

    if (status === 'succeeded' && isRealEmail && paymentIntentId) {
      // 1. Record approved payment in Supabase only for verified Stripe payments with real email
      await recordPaymentInSupabase({
        email: finalEmail,
        full_name: finalName,
        amount,
        currency,
        stripe_payment_id: paymentIntentId,
        status: 'succeeded',
        accumulated_balance: 114.93,
      });
    }

    return NextResponse.json({
      success: true,
      status,
      email: finalEmail,
      name: finalName,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
