import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPushcutNotification } from '@/lib/pushcut';
import { recordPaymentInSupabase, recordPaymentMethod, upsertCustomer } from '@/lib/supabase';

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
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      let email = paymentIntent.receipt_email || paymentIntent.metadata?.email || '';
      let fullName = paymentIntent.metadata?.full_name || '';
      let pmCard: Stripe.PaymentMethod.Card | null = null;
      let pmId = '';

      // Retrieve payment method first so we extract the real billing email and name entered at checkout
      if (paymentIntent.payment_method) {
        try {
          const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
          pmId = pm.id;
          if (pm.billing_details?.email && !email) {
            email = pm.billing_details.email;
          }
          if (pm.billing_details?.name && (!fullName || fullName === 'Anonymous')) {
            fullName = pm.billing_details.name;
          }
          if (pm.card) {
            pmCard = pm.card;
          }
        } catch (e) {
          console.warn('Could not retrieve payment method details:', e);
        }
      }

      const finalEmail = (email || 'customer@verified.com').trim().toLowerCase();
      const finalName = (fullName && fullName !== 'Anonymous' ? fullName : 'Verified Listener').trim();
      const offerId = paymentIntent.metadata?.offer_id || 'front_9_00';

      // 1. Record payment in Supabase (deduplicated by stripe_payment_id and email)
      await recordPaymentInSupabase({
        email: finalEmail,
        full_name: finalName,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripe_payment_id: paymentIntent.id,
        status: 'succeeded',
        accumulated_balance: 114.93,
        country: paymentIntent.metadata?.country || 'US',
      });

      // 2. Send Pushcut "Venda Aprovada" (deduplicated by server lock in lib/pushcut.ts)
      if (finalEmail !== 'customer@verified.com') {
        sendPushcutNotification('approved', {
          name: finalName,
          email: finalEmail,
          offerId,
          paymentIntentId: paymentIntent.id,
        }).catch((e) => console.warn('Pushcut approved notification error:', e));
      }

      // 3. Record payment method details (last4, brand, exp)
      if (pmCard && pmId) {
        try {
          const custRes = await upsertCustomer({
            email: finalEmail,
            full_name: finalName,
            stripe_customer_id: paymentIntent.customer as string,
          });
          await recordPaymentMethod({
            customer_id: custRes.customer?.id,
            brand: pmCard.brand,
            last4: pmCard.last4,
            exp_month: pmCard.exp_month,
            exp_year: pmCard.exp_year,
            stripe_payment_method_id: pmId,
          });
        } catch (e) {
          console.warn('Could not save payment method details:', e);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const email =
        paymentIntent.receipt_email ||
        paymentIntent.metadata?.email ||
        paymentIntent.last_payment_error?.payment_method?.billing_details?.email ||
        'customer@verified.com';
      const fullName =
        paymentIntent.last_payment_error?.payment_method?.billing_details?.name ||
        paymentIntent.metadata?.full_name ||
        'Verified Listener';
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

      await recordPaymentInSupabase({
        email: email.trim().toLowerCase(),
        full_name: fullName,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripe_payment_id: paymentIntent.id,
        status: 'failed',
        error_message: errorMessage,
        accumulated_balance: 114.93,
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
