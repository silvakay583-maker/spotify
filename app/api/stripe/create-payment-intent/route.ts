import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPushcutNotification } from '@/lib/pushcut';
import { upsertCustomer } from '@/lib/supabase';

const DEFAULT_AMOUNT_CENTS = 900;
const CHARGE_AMOUNT_CENTS = parseInt(process.env.ENTRY_PASS_AMOUNT_CENTS || '', 10) || DEFAULT_AMOUNT_CENTS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, sessionId, idempotencyKey } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey || stripeSecretKey.trim() === '' || stripeSecretKey.includes('placeholder')) {
      return NextResponse.json({
        mockMode: true,
        clientSecret: null,
        amount: CHARGE_AMOUNT_CENTS,
        currency: 'usd',
        displayAmount: (CHARGE_AMOUNT_CENTS / 100).toFixed(2),
        message: 'Stripe API keys not yet configured in environment variables. Running in development test mode.',
      });
    }

    const stripe = new Stripe(stripeSecretKey);

    // 1. Create or retrieve Stripe Customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({ email: email || undefined, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: {
          session_id: sessionId || 'unknown',
          program: 'Spotify Rewards',
        },
      });
    }

    // 2. Save customer lead in Supabase
    if (email) {
      await upsertCustomer({
        email,
        full_name: name,
        stripe_customer_id: customer.id,
      });
    }

    // 3. Create Stripe PaymentIntent associated with Customer
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: CHARGE_AMOUNT_CENTS,
        currency: 'usd',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
        setup_future_usage: 'off_session', // Authorize future recurring charges / payouts
        description: 'Music Rewards Program - Refundable Anti-Spam Verification Entry Pass',
        receipt_email: email && email.includes('@') ? email : undefined,
        metadata: {
          session_id: sessionId || 'unknown',
          full_name: name || 'Anonymous',
          accumulated_balance: '114.93',
          product_name: 'Anti-Spam Verification Pass',
          refund_policy: '100% refundable within 1-2 hours',
          company: 'MM Systems / Next Offer Spot',
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    return NextResponse.json({
      mockMode: false,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      customerId: customer.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      displayAmount: (paymentIntent.amount / 100).toFixed(2),
    });
  } catch (err: any) {
    console.error('Error creating Stripe PaymentIntent & Customer:', err);
    return NextResponse.json(
      {
        error: err.message || 'Internal server error creating payment session.',
      },
      { status: 500 }
    );
  }
}
