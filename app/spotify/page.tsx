'use client';

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Headphones,
  Lock,
  Play,
  ShieldCheck,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MetaPixelTracker from '../components/MetaPixelTracker';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const SPOTIFY_LOGO_URL = '/spotify-full-logo.png';
const SPOTIFY_ICON_URL = '/spotify-logo.webp';
const HERO_BANNER_URL = '/spotify-hero-banner.webp';

const reviewerNotifications = [
  { name: 'Ella from California', action: 'Became a Spotify Reviewer', time: 'Just now' },
  { name: 'Marcus from Texas', action: 'Withdrew $142.50 in payouts', time: 'Just now' },
  { name: 'Hannah from Florida', action: 'Became a Spotify Reviewer', time: '1 min ago' },
  { name: 'Noah from New York', action: 'Completed first 5 song reviews', time: 'Just now' },
  { name: 'Chloe from Illinois', action: 'Became a Spotify Reviewer', time: '2 mins ago' },
  { name: 'Liam from Georgia', action: 'Withdrew $218.00 in payouts', time: 'Just now' },
  { name: 'Sophia from Arizona', action: 'Became a Spotify Reviewer', time: 'Just now' },
  { name: 'Mason from Ohio', action: 'Earned $64.00 reviewing tracks', time: '1 min ago' },
];

const quickHighlights = [
  {
    icon: DollarSign,
    title: 'Up to $350/Day',
    subtitle: 'Paid per song reviewed',
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    subtitle: 'Work anytime from phone',
  },
  {
    icon: Headphones,
    title: 'No Experience',
    subtitle: 'Simple Yes/No feedback',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    subtitle: 'Same-day USD withdrawal',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    icon: Play,
    title: 'Listen to Unreleased Tracks',
    description: 'Press play on tracks from major and independent record labels straight from your phone.',
  },
  {
    step: '02',
    icon: Headphones,
    title: 'Rate Melody & Rhythm',
    description: 'Answer quick tap questions about audience appeal before songs hit global playlists.',
  },
  {
    step: '03',
    icon: DollarSign,
    title: 'Withdraw Your USD Balance',
    description: 'Each completed review adds USD directly to your balance for immediate cashout.',
  },
];

const testimonials = [
  {
    name: 'Emily Carter',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    earnings: '+$114.93 Today',
    comment:
      "Super straightforward. I did my first session right from my phone in about 20 minutes and withdrew the same day.",
  },
  {
    name: 'Jason Miller',
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    earnings: '+$285.40 Earned',
    comment:
      "I already listen to music all day anyway. Getting paid per track evaluation on my break is honestly a game changer.",
  },
  {
    name: 'Jessica Thompson',
    location: 'Orlando, FL',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    earnings: '+$178.50 Withdrawn',
    comment:
      "Very easy to use on mobile. You just listen to the preview, rate the rhythm and vocals, and watch your balance grow.",
  },
];

const faqs = [
  {
    question: 'Why does Spotify pay listeners to evaluate songs?',
    answer:
      'Record labels invest millions launching new tracks. Paying real listeners to validate melody, rhythm, and retention before global release saves labels millions in marketing.',
  },
  {
    question: 'How fast do I receive my earnings?',
    answer:
      'Your commission is credited immediately after each song evaluation. Once you finish your first evaluation session, your balance is unlocked for same-day withdrawal.',
  },
  {
    question: 'Do I need any equipment or prior experience?',
    answer:
      'No experience is needed. You only need a smartphone or computer, internet connection, and headphones to listen and submit your ratings.',
  },
];

export default function SpotifyLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [notifIndex, setNotifIndex] = useState(0);
  const [showNotif, setShowNotif] = useState(true);
  const [notifDismissed, setNotifDismissed] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    if (notifDismissed) return;

    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycleNotification = () => {
      const nextDelay = Math.floor(Math.random() * 14000) + 12000;
      showTimer = setTimeout(() => {
        setShowNotif(false);
        hideTimer = setTimeout(() => {
          setNotifIndex((prev) => (prev + 1) % reviewerNotifications.length);
          setShowNotif(true);
          cycleNotification();
        }, 1200);
      }, nextDelay);
    };

    cycleNotification();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [notifDismissed]);

  const currentNotif = reviewerNotifications[notifIndex];

  return (
    <div
      className={`${jakarta.className} landing-root min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-[#1db954] selection:text-black`}
    >
      <MetaPixelTracker eventName="PageView" customData={{ content_name: 'Spotify Rewards Offer' }} />

      {/* Compact Sticky Mobile-First Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/90 border-b border-[#1f1f1f]">
        <div className="max-w-3xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link href="/spotify" className="inline-flex items-center">
              <Image
                src={SPOTIFY_LOGO_URL}
                alt="Spotify Logo"
                width={110}
                height={32}
                className="h-6 w-auto object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>

          <Link
            href="/spotify/rewards"
            className="inline-flex items-center gap-1.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            <span>Start Evaluating</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* 1. COMPACT ABOVE-THE-FOLD HERO */}
      <section className="relative pt-5 sm:pt-10 pb-6 sm:pb-10 px-3.5 sm:px-6 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[180px] bg-[#1db954]/12 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Compact Top Status Line */}
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full overflow-hidden shadow-[0_0_15px_rgba(29,185,84,0.4)]">
              <Image
                src={SPOTIFY_ICON_URL}
                alt="Spotify Official Icon"
                width={24}
                height={24}
                className="w-full h-full object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1db954]">
              Official Evaluator Program • Open Slots
            </span>
          </div>

          {/* Direct Headline */}
          <h1 className="text-[21px] sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.22] text-white mb-4">
            Earn up to <span className="text-[#1db954]">$350 per day</span> working with Spotify evaluating music for major record labels.
          </h1>

          {/* Hero Woman Image (Placed directly above CTA & highlights) */}
          <Link href="/spotify/rewards" className="block group mb-4">
            <div className="relative mx-auto rounded-xl p-1 bg-[#161616] border border-[#262626] group-hover:border-[#1db954]/50 shadow-xl transition-all">
              <div className="relative w-full rounded-lg overflow-hidden bg-[#101010]">
                <Image
                  src={HERO_BANNER_URL}
                  alt="Spotify Music Evaluator Program"
                  width={1200}
                  height={550}
                  className="w-full h-auto object-cover block"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </Link>

          {/* Primary High-Converting Mobile CTA */}
          <Link
            href="/spotify/rewards"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-base sm:text-lg py-3.5 px-6 rounded-xl shadow-[0_8px_25px_rgba(29,185,84,0.3)] transition-all active:scale-[0.98] mb-2.5"
          >
            <span>Start Your First Evaluation Now</span>
            <ArrowRight size={19} />
          </Link>

          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5 mb-5">
            <ShieldCheck size={13} className="text-[#1db954] shrink-0" />
            <span>Free instant access • Works on any phone • Daily USD payouts</span>
          </p>

          {/* Why Become a Spotify Reviewer — Ultra-Compact 2x2 Grid on Mobile */}
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-extrabold text-white text-center mb-2.5">
              Why Become a Spotify Reviewer?
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickHighlights.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#141414] border border-[#242424] rounded-xl p-3 flex items-start gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW THE PROGRAM WORKS + DAILY EARNINGS (COMPACT SINGLE SCREEN) */}
      <section className="py-6 sm:py-10 px-3.5 sm:px-6 bg-[#101010] border-y border-[#1f1f1f]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1db954]">
              How It Works
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">
              3 Simple Steps to Start Earning Today
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Record labels pay for real human feedback before promoting new songs to 600M+ listeners.
            </p>
          </div>

          {/* Compact Horizontal Row Cards on Mobile */}
          <div className="space-y-2.5 mb-5">
            {howItWorksSteps.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1db954]/15 text-[#1db954] flex items-center justify-center shrink-0 font-extrabold text-xs">
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1db954]">
                        Step {item.step}
                      </span>
                      <span className="text-gray-600">·</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400 leading-snug mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-Side 3-Column Daily Payout Estimator on Mobile */}
          <div className="bg-[#151515] border border-[#262626] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-white">Daily Payout Potential</span>
              <span className="text-[11px] text-[#1db954] font-semibold">Paid in USD</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#0e0e0e] border border-[#222222] rounded-lg py-2.5 px-1.5">
                <span className="block text-[10px] text-gray-400 font-medium">30 Mins</span>
                <strong className="block text-xs sm:text-base font-extrabold text-white mt-0.5">
                  $45–$70
                </strong>
                <span className="block text-[9px] text-gray-500">~5 Songs</span>
              </div>
              <div className="bg-[#1db954]/12 border border-[#1db954]/40 rounded-lg py-2.5 px-1.5">
                <span className="block text-[10px] text-[#1db954] font-bold">1–2 Hours</span>
                <strong className="block text-xs sm:text-base font-extrabold text-[#1db954] mt-0.5">
                  $114–$180
                </strong>
                <span className="block text-[9px] text-[#1db954]/80">~10 Songs</span>
              </div>
              <div className="bg-[#0e0e0e] border border-[#222222] rounded-lg py-2.5 px-1.5">
                <span className="block text-[10px] text-gray-400 font-medium">3+ Hours</span>
                <strong className="block text-xs sm:text-base font-extrabold text-white mt-0.5">
                  Up to $350
                </strong>
                <span className="block text-[9px] text-gray-500">20+ Songs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPACT SOCIAL PROOF & ESSENTIAL FAQ */}
      <section className="py-6 sm:py-10 px-3.5 sm:px-6 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto">
          {/* Verified Reviews Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-white">
                Verified Evaluator Feedback
              </h2>
              <p className="text-[11px] text-gray-400">Real payouts from active listeners</p>
            </div>
            <div className="flex items-center gap-1 text-[#1db954] text-xs font-bold">
              <Star size={14} className="fill-[#1db954]" />
              <span>4.9/5</span>
            </div>
          </div>

          {/* Compact Testimonials List */}
          <div className="space-y-2.5 mb-7">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#141414] p-3.5 rounded-xl border border-[#242424] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/15 shrink-0">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-xs">{item.name}</h4>
                        <CheckCircle2 size={12} className="text-[#1db954]" />
                      </div>
                      <span className="text-[10px] text-gray-400">{item.location}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#1db954] shrink-0">
                    {item.earnings}
                  </span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Essential Quick FAQ */}
          <div className="mb-7">
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-2.5 text-center">
              Quick Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414] rounded-xl border border-[#242424] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-3.5 py-3 flex items-center justify-between gap-3 font-bold text-white text-xs sm:text-sm"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`text-base font-mono text-[#1db954] transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-3.5 pb-3 text-gray-300 text-xs leading-relaxed border-t border-[#222222] pt-2.5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Compact Action Box */}
          <div className="bg-[#141414] border border-[#1db954]/30 rounded-2xl p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-xl font-extrabold text-white mb-1.5">
              Ready to evaluate your first 3 songs?
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your listener session is ready. Complete your first evaluations now and unlock your USD payout.
            </p>
            <Link
              href="/spotify/rewards"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg shadow-[#1db954]/20 transition-all active:scale-95"
            >
              <span>Apply &amp; Start Evaluating Now</span>
              <ArrowRight size={18} />
            </Link>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
              <Lock size={11} className="text-[#1db954]" />
              <span>256-bit SSL Encrypted • Official Partner Portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="py-6 px-4 pb-20 sm:pb-8 bg-[#070707] border-t border-[#181818] text-center text-[11px] text-gray-500">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <Image
            src={SPOTIFY_LOGO_URL}
            alt="Spotify"
            width={90}
            height={26}
            className="h-5 w-auto object-contain opacity-70"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Spotify Media Service AB • Stockholm, Sweden • Official Music Validation Partner Program
          </p>
          <span className="text-gray-600 text-[10px]">
            © {new Date().getFullYear()} Spotify AB. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Floating Social Proof Notification Card */}
      {!notifDismissed && (
        <div
          className={`fixed bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 sm:left-4 sm:translate-x-0 z-50 w-[235px] sm:w-[275px] bg-[#141414]/95 backdrop-blur-md border border-[#282828] rounded-xl p-2.5 shadow-2xl transition-all duration-500 ${
            showNotif
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => setNotifDismissed(true)}
            aria-label="Close notification"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={12} />
          </button>

          <div className="flex items-center gap-2.5 pr-4">
            <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden">
              <Image
                src={SPOTIFY_ICON_URL}
                alt="Spotify"
                width={24}
                height={24}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate leading-tight">
                {currentNotif.name}
              </p>
              <p className="text-[10px] text-gray-300 truncate leading-tight mt-0.5">
                {currentNotif.action}
              </p>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                <span className="text-[9px] text-gray-500">{currentNotif.time}</span>
                <span className="text-[9px] text-gray-400">
                  Verified by <strong className="text-[#1db954] font-bold">SPOTIFY</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
