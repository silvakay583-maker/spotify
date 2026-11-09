import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey || publishableKey.trim() === '' || publishableKey.includes('placeholder')) {
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
