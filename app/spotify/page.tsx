'use client';

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Headphones,
  Lock,
  Music2,
  Play,
  PlayCircle,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MetaPixelTracker from '../components/MetaPixelTracker';

const inter = Inter({
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
  { name: 'Ava from North Carolina', action: 'Became a Spotify Reviewer', time: 'Just now' },
  { name: 'Ethan from Washington', action: 'Became a Spotify Reviewer', time: 'Just now' },
];

const reviewerBenefits = [
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'Earn up to $350/day reviewing music',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Work on your schedule from phone or PC',
  },
  {
    icon: Headphones,
    title: 'Early Access',
    description: 'Listen to tracks before public release',
  },
  {
    icon: PlayCircle,
    title: 'Music Discovery',
    description: "Find tomorrow's hits today",
  },
];

const testimonials = [
  {
    name: 'Emily Carter',
    location: 'Austin, Texas (TX)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    stars: 5,
    earnings: '$114.93 withdrawn today',
    date: 'Today, at 2:22 PM',
    comment:
      "I thought it was going to be more complicated lol, but it's actually pretty easy to understand. I really like being able to do everything from my phone without having to sit in front of a computer.",
  },
  {
    name: 'Jason Miller',
    location: 'Miami, Florida (FL)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    stars: 5,
    earnings: '$285.40 earned today',
    date: 'Yesterday, at 7:40 PM',
    comment:
      "What I like most is how convenient it is. I can check things out whenever I have some free time. I was a little confused at first, but once I got the hang of it, everything made more sense.",
  },
  {
    name: 'Jessica Thompson',
    location: 'Orlando, Florida (FL)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
    stars: 5,
    earnings: '$350.00 daily',
    date: '2 days ago',
    comment:
      "I'm still getting familiar with how everything works, but so far I think the idea is pretty interesting. I already spend a good part of my day listening to music anyway lol.",
  },
  {
    name: 'Michael Anderson',
    location: 'Phoenix, Arizona (AZ)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    stars: 5,
    earnings: '$178.50 withdrawn',
    date: 'Today, at 11:05 AM',
    comment:
      "I like the concept, especially being able to use it right from my phone. I just wish some of the instructions were a little more straightforward, but overall it's been easy to navigate.",
  },
];

const faqs = [
  {
    question: 'How much can I really earn as a music evaluator?',
    answer:
      'Earnings vary depending on the number of completed song evaluations. On average, active evaluators earn between $70 and up to $350 per day, depending on demand from partner record labels and producers.',
  },
  {
    question: 'Do I need prior experience in the music industry?',
    answer:
      'No! The program specifically seeks the genuine perspective of everyday listeners. You just need to listen carefully and answer whether you like the melody, lyrics, or rhythm.',
  },
  {
    question: 'Why does Spotify pay listeners to evaluate music?',
    answer:
      'Major labels and independent producers invest heavily to test audience retention and viral potential before launching tracks onto major global playlists. Your direct feedback saves millions in traditional marketing costs.',
  },
  {
    question: 'How and when do I receive my accumulated money?',
    answer:
      'When you complete your daily evaluation session, an official signed payment receipt is generated right in the chat and funds are immediately cleared for transfer to your payout account.',
  },
  {
    question: 'Can I complete the evaluations on my smartphone?',
    answer:
      'Yes! The system is 100% optimized for mobile phones (Android and iOS) as well as tablets and desktop computers. All you need is an internet connection and headphones.',
  },
];

export default function SpotifyLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      const nextDelay = Math.floor(Math.random() * 14000) + 12000; // 12s to 26s organic interval
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
    <div className={`${inter.className} landing-root min-h-screen bg-[#0c0c0c] text-white antialiased selection:bg-[#1db954] selection:text-black`}>
      {/* Meta Pixel & CAPI Tracker exclusively for Spotify */}
      <MetaPixelTracker eventName="PageView" customData={{ content_name: 'Spotify Rewards Offer' }} />

      {/* Minimalist Spotify Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0c0c0c]/90 border-b border-[#222222]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 mr-1"
            >
              <span>←</span>
              <span className="hidden sm:inline">Next Offer Spot</span>
            </Link>
            <Link href="/spotify" className="inline-flex items-center gap-2">
              <Image
                src={SPOTIFY_LOGO_URL}
                alt="Spotify Logo"
                width={120}
                height={36}
                className="h-6 sm:h-7 w-auto object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/spotify/rewards"
              className="inline-flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <span>Start Evaluating</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — Centered Minimalist Spotify Aesthetic */}
      <section className="relative pt-12 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Subtle centered ambient Spotify green glow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[420px] h-[240px] bg-[#1db954]/12 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Centered Round Green Spotify Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-[0_0_40px_rgba(29,185,84,0.35)]">
              <Image
                src={SPOTIFY_ICON_URL}
                alt="Spotify Official Icon"
                width={80}
                height={80}
                className="w-full h-full object-contain rounded-full"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Compact "Now Hiring" Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1db954] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-[#1db954]">
              Now Hiring • Official Evaluator Program
            </span>
          </div>

          {/* Primary Headline — Clean Spotify Typography */}
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.025em] leading-[1.22] max-w-3xl mx-auto mb-4 text-white">
            Earn up to <span className="text-[#1db954]">$350 per day</span> working with Spotify evaluating music as a partner for major record labels.
          </h1>

          {/* Supporting Subheading */}
          <p className="text-sm sm:text-base text-[#a7a7a7] font-normal max-w-2xl mx-auto mb-12 leading-relaxed">
            Get paid in USD listening to music releases from global superstars like Taylor Swift, Adele, and The Weeknd as well as emerging independent artists before songs hit global playlists.
          </p>

          {/* Why Become a Spotify Reviewer? — 4 Minimalist Cards (Exact Reference Layout) */}
          <div className="mt-4 mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-8">
              Why Become a Spotify Reviewer?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {reviewerBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-[#181818] border border-[#262626] hover:border-[#1db954]/40 rounded-xl p-6 sm:p-7 flex flex-col items-center text-center transition-colors"
                  >
                    <div className="text-[#1db954] mb-4">
                      <IconComponent size={24} strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Hero Visual Banner Inside Clean Dark Spotify Frame */}
          <Link href="/spotify/rewards" className="block cursor-pointer group">
            <div className="relative mx-auto max-w-4xl rounded-2xl p-1.5 bg-[#181818] border border-[#262626] hover:border-[#1db954]/50 shadow-2xl transition-all duration-300">
              <div className="relative w-full rounded-xl overflow-hidden bg-[#121212]">
                <Image
                  src={HERO_BANNER_URL}
                  alt="Spotify Rewards Banner - Evaluating Music"
                  width={1200}
                  height={550}
                  className="w-full h-auto object-cover block"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Why Spotify Pays Section — Clean Spotify Desktop Card Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#111111] border-y border-[#222222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 inline-block mb-3">
              Understand the Market
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Why does Spotify pay up to $350 a day for you to evaluate music?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Spotify&apos;s algorithm recommends music to over 600 million users every single day. But before promoting a track worldwide, record labels need real human validation and listener feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-[#181818] p-6 sm:p-7 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center mb-5">
                <Music2 size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Major and Independent Artists</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                From established names like Adele and The Weeknd to independent upcoming talent and regional record labels needing audience testing.
              </p>
            </div>

            <div className="bg-[#181818] p-6 sm:p-7 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center mb-5">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Million Savings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Record labels prefer paying listeners directly to test rhythm and melody rather than spending millions on unengaging marketing campaigns.
              </p>
            </div>

            <div className="bg-[#181818] p-6 sm:p-7 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center mb-5">
                <DollarSign size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Direct USD Payouts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                You earn a commission payout for every completed track. Each finished review set adds directly to your balance for immediate withdrawal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 inline-block mb-3">
              Step-by-Step
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              How the daily work works
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              You can work from anywhere, using just your phone or computer with an internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#181818] p-6 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center">
                  <Play size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Step 01</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Listen to the Track</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Press play and listen to the song to evaluate the artist&apos;s melody, lyrics, and rhythm.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center">
                  <Headphones size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Step 02</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Answer Questions</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Give your honest feedback with quick &quot;Yes&quot; or &quot;No&quot; clicks regarding the song and artist.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Step 03</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Accumulate Balance</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Each completed review credits your commission in real-time with a satisfying confirmation sound.
              </p>
            </div>

            <div className="bg-[#181818] p-6 rounded-xl border border-[#262626] hover:border-[#1db954]/40 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1db954]/15 text-[#1db954] flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Step 04</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">4. Cash Out Earnings</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Generate your official receipt signed by the CFO and withdraw your accumulated earnings the same day.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/spotify/rewards"
              className="inline-flex items-center gap-2.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg transition-all transform hover:scale-[1.03] shadow-lg shadow-[#1db954]/20"
            >
              <span>Try Your First Evaluation Now</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Earnings Potential Table */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 bg-[#111111] border-t border-[#222222]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#181818] rounded-2xl p-6 sm:p-10 border border-[#262626]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 inline-block mb-2">
                Earnings Estimate
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                How much time do you want to spend?
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Payouts are calculated instantly for every set of evaluated songs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#121212] p-6 rounded-xl border border-[#262626] text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Beginner (30 min)
                </span>
                <strong className="block text-2xl sm:text-3xl font-black text-white">$45 to $70</strong>
                <span className="text-[11px] text-gray-500 mt-1">~5 Songs Evaluated</span>
              </div>

              <div className="bg-[#1db954]/10 p-6 rounded-xl border border-[#1db954]/40 text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-[#1db954] uppercase tracking-wider mb-2">
                  Intermediate (1-2 hrs)
                </span>
                <strong className="block text-2xl sm:text-3xl font-black text-[#1db954]">$114 to $180</strong>
                <span className="text-[11px] text-[#1db954]/80 mt-1">~10 Songs Evaluated</span>
              </div>

              <div className="bg-[#121212] p-6 rounded-xl border border-[#262626] text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Dedicated (3-4 hrs)
                </span>
                <strong className="block text-2xl sm:text-3xl font-black text-white">Up to $350</strong>
                <span className="text-[11px] text-gray-500 mt-1">20+ Songs Evaluated</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/spotify/rewards"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg transition-all transform hover:scale-[1.03] shadow-lg shadow-[#1db954]/25"
              >
                <span>Start Working With Spotify Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials and Ratings */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0c0c0c] border-t border-[#222222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-1.5 text-[#1db954] mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-[#1db954] text-[#1db954]" />
              ))}
              <span className="text-white font-bold ml-2 text-sm sm:text-base">4.9 / 5.0 stars</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Reviews from active evaluators
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              See feedback from real people working as Spotify partner reviewers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#181818] p-6 rounded-xl border border-[#262626] flex flex-col justify-between hover:border-[#1db954]/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/15 shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{item.name}</h4>
                        <span className="text-xs text-gray-400">{item.location}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30">
                        {item.earnings}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3 text-[#1db954]">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} size={13} className="fill-[#1db954] text-[#1db954]" />
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#262626] flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <CheckCircle2 size={13} className="text-[#1db954]" />
                    Verified Official Evaluator
                  </span>
                  <span>
                    Verified by <strong className="text-[#1db954]">SPOTIFY</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#111111] border-t border-[#222222]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm">
              Get answers to common questions before starting your evaluation session.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#181818] rounded-xl border border-[#262626] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-[#1db954] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`text-xl font-mono text-[#1db954] transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-gray-300 text-xs sm:text-sm leading-relaxed border-t border-[#262626] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden text-center bg-[#0c0c0c] border-t border-[#222222]">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-14 h-14 rounded-full bg-[#1db954]/15 text-[#1db954] mx-auto flex items-center justify-center mb-5 border border-[#1db954]/30">
            <Sparkles size={26} />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Start now and secure your earnings of up to $350 per day
          </h2>

          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Evaluator slots are limited per region to guarantee payout quotas. Click below to open your evaluation session immediately.
          </p>

          <Link
            href="/spotify/rewards"
            className="inline-flex items-center justify-center gap-2.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm sm:text-lg px-9 py-4 rounded-lg transition-all duration-200 transform hover:scale-[1.03] shadow-xl shadow-[#1db954]/25 active:scale-95"
          >
            <span>Apply &amp; Start Evaluating</span>
            <ArrowRight size={20} />
          </Link>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock size={13} className="text-[#1db954]" />
            <span>Secure Access with 256-bit SSL Encryption • Official Partner Program</span>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="py-10 px-4 sm:px-6 bg-[#080808] border-t border-[#1e1e1e] text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div>
            <Image
              src={SPOTIFY_LOGO_URL}
              alt="Spotify"
              width={110}
              height={32}
              className="h-6 w-auto object-contain opacity-75 mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="max-w-xl text-gray-500 leading-relaxed">
            Spotify Media Service AB • Regeringsgatan 19, Stockholm, Sweden • VAT: SE556703748501.
            <br />
            Official Spotify Rewards music validation program in partnership with accredited artists and record labels.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-[11px] pt-1">
            <span>Privacy</span>
            <span>•</span>
            <span>Partnership Terms</span>
            <span>•</span>
            <span>Evaluation Guidelines</span>
            <span>•</span>
            <span>Official Support</span>
          </div>

          <span className="text-gray-600 text-[11px]">
            © {new Date().getFullYear()} Spotify AB. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Floating Social Proof Notification Card — Compact & Centered on Mobile, Bottom-Left on Desktop */}
      {!notifDismissed && (
        <div
          className={`fixed bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4 sm:left-4 sm:translate-x-0 z-50 w-[230px] sm:w-[285px] bg-[#141414]/95 backdrop-blur-md border border-[#282828] rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-2xl transition-all duration-500 ${
            showNotif
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => setNotifDismissed(true)}
            aria-label="Close notification"
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={12} />
          </button>

          <div className="flex items-center sm:items-start gap-2.5 sm:gap-3 pr-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shrink-0 overflow-hidden">
              <Image
                src={SPOTIFY_ICON_URL}
                alt="Spotify"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">
                {currentNotif.name}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-300 truncate leading-tight mt-0.5">
                {currentNotif.action}
              </p>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                <span className="text-[9px] sm:text-[10px] text-gray-500">{currentNotif.time}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-400">
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
