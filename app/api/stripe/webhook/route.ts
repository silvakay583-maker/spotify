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
      const email = paymentIntent.receipt_email || paymentIntent.metadata?.email || 'customer@verified.com';
      const fullName = paymentIntent.metadata?.full_name || 'Verified Listener';

      // 1. Record payment in Supabase
      await recordPaymentInSupabase({
        email,
        full_name: fullName,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripe_payment_id: paymentIntent.id,
        status: 'succeeded',
        accumulated_balance: 114.93,
        country: paymentIntent.metadata?.country || 'US',
      });

      // 1.5 Send Pushcut "Venda Aprovada" notification to iPhone
      sendPushcutNotification('approved', { name: fullName, email }).catch((e) =>
        console.warn('Pushcut approved notification error:', e)
      );

      // 2. If payment method was used, record payment method details (last4, brand, exp)
      if (paymentIntent.payment_method) {
        try {
          const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
          if (pm.card) {
            const custRes = await upsertCustomer({ email, full_name: fullName, stripe_customer_id: paymentIntent.customer as string });
            await recordPaymentMethod({
              customer_id: custRes.customer?.id,
              brand: pm.card.brand,
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
              stripe_payment_method_id: pm.id,
            });
          }
        } catch (e) {
          console.warn('Could not retrieve payment method details:', e);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const email = paymentIntent.receipt_email || paymentIntent.metadata?.email || 'customer@verified.com';
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

      await recordPaymentInSupabase({
        email,
        full_name: paymentIntent.metadata?.full_name || 'Verified Listener',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        stripe_payment_id: paymentIntent.id,
        status: 'failed',
        error_message: errorMessage,
        accumulated_balance: 114.93,
      });
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription event ${event.type}: ${subscription.id} status: ${subscription.status}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
