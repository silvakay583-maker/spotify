import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { upsertCustomer } from '@/lib/supabase';

const OFFER_CATALOG: Record<
  string,
  { amountCents: number; productName: string; description: string }
> = {
  front_9_00: {
    amountCents: parseInt(process.env.ENTRY_PASS_AMOUNT_CENTS || '', 10) || 900,
    productName: 'Anti-Spam Verification Pass ($9.00)',
    description: 'Music Rewards Program - Refundable Anti-Spam Verification Entry Pass',
  },
  upsell_vip_19_90: {
    amountCents: 1990,
    productName: 'VIP Gold 7-Day Fast Payout Pass ($19.90)',
    description: 'Spotify Rewards - Upgrade to 7-Day VIP Fast Payout Schedule',
  },
  downsell_vip_11_90: {
    amountCents: 1190,
    productName: 'VIP 7-Day Payout Fast-Track 40% OFF ($11.90)',
    description: 'Spotify Rewards - Special 40% Discount 7-Day VIP Payout Pass',
  },
  upsell_booster3_16_97: {
    amountCents: 1697,
    productName: 'Task Booster Tier 2 (+3 Extra Tracks/Day) ($16.97)',
    description: 'Spotify Rewards - Expand Daily Evaluation Limit to 6 Tracks/Day',
  },
  downsell_booster2_9_12: {
    amountCents: 912,
    productName: 'Special Booster Pass (+2 Extra Tracks/Day) ($9.12)',
    description: 'Spotify Rewards - Expand Daily Evaluation Limit to 5 Tracks/Day',
  },
  upsell_skip12h_9_65: {
    amountCents: 965,
    productName: 'Instant 12-Hour Timer Bypass Pass ($9.65)',
    description: 'Spotify Rewards - Fast-Forward 12-Hour Queue Cooldown Timer',
  },
  upsell_antifraud_9_97: {
    amountCents: 997,
    productName: 'Anti-Fraud Banking Reconciliation Deposit ($9.97)',
    description: 'Spotify Rewards - Refundable Anti-Fraud Verification Deposit (Added to Payout Balance)',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, sessionId, idempotencyKey, offerId } = body;

    const selectedOfferKey =
      offerId && OFFER_CATALOG[offerId] ? offerId : 'front_9_00';
    const offerConfig = OFFER_CATALOG[selectedOfferKey];
    const chargeAmountCents = offerConfig.amountCents;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey || stripeSecretKey.trim() === '' || stripeSecretKey.includes('placeholder')) {
      return NextResponse.json({
        mockMode: true,
        clientSecret: null,
        offerId: selectedOfferKey,
        productName: offerConfig.productName,
        amount: chargeAmountCents,
        currency: 'usd',
        displayAmount: (chargeAmountCents / 100).toFixed(2),
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

    // 3. Create Stripe PaymentIntent associated with Customer & Selected Offer
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: chargeAmountCents,
        currency: 'usd',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
        setup_future_usage: 'off_session',
        description: offerConfig.description,
        receipt_email: email && email.includes('@') ? email : undefined,
        metadata: {
          session_id: sessionId || 'unknown',
          full_name: name || 'Anonymous',
          accumulated_balance: '114.93',
          offer_id: selectedOfferKey,
          product_name: offerConfig.productName,
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
      offerId: selectedOfferKey,
      productName: offerConfig.productName,
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
