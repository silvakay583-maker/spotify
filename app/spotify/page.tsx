'use client';

import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Headphones,
  Lock,
  Music2,
  Play,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import MetaPixelTracker from '../components/MetaPixelTracker';

const SPOTIFY_LOGO_URL = '/spotify-full-logo.png';
const HERO_BANNER_URL = '/spotify-hero-banner.webp';

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-root min-h-screen bg-[#0a0a0a] text-white selection:bg-[#1db954] selection:text-black">
      {/* Meta Pixel & CAPI Tracker exclusively for Spotify */}
      <MetaPixelTracker eventName="PageView" customData={{ content_name: 'Spotify Rewards Offer' }} />

      {/* Top Urgency Banner */}
      <aside aria-label="Urgency Banner" className="bg-gradient-to-r from-[#1db954]/20 via-[#1db954] to-[#128a3a] text-black font-semibold text-xs sm:text-sm py-2 px-4 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-black animate-pulse" />
          <span>
            <strong>Open Slots Today:</strong> The Spotify Rewards program is selecting new evaluators to earn <strong>up to $350/day</strong>.
          </span>
        </div>
      </aside>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0a]/90 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 mr-2">
              <span>←</span>
              <span className="hidden sm:inline">Next Offer Spot</span>
            </Link>
            <Link href="/spotify" className="inline-block">
              <Image
                src={SPOTIFY_LOGO_URL}
                alt="Spotify Logo"
                width={132}
                height={40}
                className="h-7 sm:h-8 w-auto object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30">
              Rewards
            </span>
          </div>

          <Link
            href="/spotify/rewards"
            className="inline-flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-full transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-lg shadow-[#1db954]/20"
          >
            <span>Start Evaluating</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1db954]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#1db954] animate-ping" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-300">
              Official Evaluator Partner Program • Spotify Media Service
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.12] mb-6 text-white">
            Earn up to <span className="text-[#1db954] underline decoration-[#1db954] underline-offset-8">$350 per day</span> working with Spotify evaluating music as a partner for major record labels.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
            Get paid in USD listening to tracks and new music releases from global superstars as well as emerging independent artists. Give your verdict before songs hit the biggest global playlists.
          </p>

          {/* Main Hero Image */}
          <Link href="/spotify/rewards" className="block cursor-pointer group">
            <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-[#1db954]/50 via-white/10 to-transparent shadow-2xl shadow-[#1db954]/25 transition-transform duration-300 group-hover:scale-[1.01]">
              <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#121212] border border-white/10">
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

      {/* Why Spotify Pays Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0f0f0f] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 inline-block mb-3">
              Understand the Market
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Why does Spotify pay up to $350 a day for you to evaluate music?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Spotify&apos;s algorithm recommends music to over 600 million users every single day. But before promoting a track worldwide, record labels need real human validation and listener feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-[#181818] p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-[#1db954]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1db954]/10 text-[#1db954] flex items-center justify-center mb-5">
                <Music2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Major and Independent Artists</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                From established names like Adele and The Weeknd to independent upcoming talent and regional record labels needing audience testing.
              </p>
            </div>

            <div className="bg-[#181818] p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-[#1db954]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1db954]/10 text-[#1db954] flex items-center justify-center mb-5">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Million Savings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Record labels prefer paying listeners directly to test rhythm and melody rather than spending millions on unengaging marketing campaigns.
              </p>
            </div>

            <div className="bg-[#181818] p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-[#1db954]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1db954]/10 text-[#1db954] flex items-center justify-center mb-5">
                <DollarSign size={24} />
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
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 inline-block mb-3">
              Step-by-Step
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              How the daily work works
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              You can work from anywhere, using just your phone with an internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative flex flex-col">
              <span className="text-4xl font-black text-white/10 mb-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mb-4">
                <Play size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Listen to the Track</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Press play and listen to the song to evaluate the artist&apos;s melody, lyrics, and rhythm.
              </p>
            </div>

            <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative flex flex-col">
              <span className="text-4xl font-black text-white/10 mb-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mb-4">
                <Headphones size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Answer Questions</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Give your honest feedback with quick &quot;Yes&quot; or &quot;No&quot; clicks regarding the song and artist.
              </p>
            </div>

            <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative flex flex-col">
              <span className="text-4xl font-black text-white/10 mb-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mb-4">
                <DollarSign size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Accumulate Balance</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Each completed review credits your commission in real-time with a satisfying confirmation sound.
              </p>
            </div>

            <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 relative flex flex-col">
              <span className="text-4xl font-black text-white/10 mb-4">04</span>
              <div className="w-10 h-10 rounded-lg bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">4. Cash Out Earnings</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Generate your official receipt signed by the CFO and withdraw your accumulated earnings the same day.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/spotify/rewards"
              className="inline-flex items-center gap-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-sm sm:text-base px-8 py-4 rounded-full transition-all transform hover:scale-[1.03] shadow-lg shadow-[#1db954]/25"
            >
              <span>TRY YOUR FIRST EVALUATION NOW</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials and Ratings */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0c0c0c] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-1.5 text-yellow-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="fill-yellow-400" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#141414] p-6 sm:p-7 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-[#1db954]/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{item.name}</h4>
                        <span className="text-xs text-gray-400">{item.location}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30">
                        {item.earnings}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-1">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3 text-yellow-400">
                    {[...Array(item.stars)].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed italic">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#1db954]" />
                    Verified Official Evaluator
                  </span>
                  <span>Spotify Rewards AB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Earnings Potential Table */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-[#181818] to-[#121212] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1db954] px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/20 inline-block mb-2">
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
              <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Beginner (30 min)</span>
                <strong className="block text-2xl sm:text-3xl font-black text-white">$45 to $70</strong>
              </div>

              <div className="bg-[#1db954]/10 p-6 rounded-2xl border border-[#1db954]/30 text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-[#1db954] uppercase tracking-wider mb-2">Intermediate (1-2 hrs)</span>
                <strong className="block text-2xl sm:text-3xl font-black text-[#1db954]">$114 to $180</strong>
              </div>

              <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dedicated (3-4 hrs)</span>
                <strong className="block text-2xl sm:text-3xl font-black text-white">Up to $350</strong>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/spotify/rewards"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-base px-8 py-4 rounded-full transition-all transform hover:scale-[1.03] shadow-lg shadow-[#1db954]/30"
              >
                <span>START WORKING WITH SPOTIFY NOW</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm">
              Get answers to common questions before starting your free evaluation session.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#161616] rounded-2xl border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-[#1db954] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className={`text-xl font-mono text-[#1db954] transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden text-center bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-black">
        <div className="absolute inset-0 bg-[#1db954]/10 blur-[150px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1db954]/20 text-[#1db954] mx-auto flex items-center justify-center mb-6">
            <Sparkles size={32} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Start now and secure your earnings of up to $350 per day
          </h2>

          <p className="text-gray-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Evaluator slots are limited per region to guarantee payout quotas. Click below to open your evaluation session immediately.
          </p>

          <Link
            href="/spotify/rewards"
            className="inline-flex items-center justify-center gap-3 bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-base sm:text-xl px-10 py-5 rounded-full transition-all duration-300 transform hover:scale-[1.05] shadow-2xl shadow-[#1db954]/50 active:scale-95 uppercase tracking-wide"
          >
            <span>START WORKING WITH SPOTIFY NOW</span>
            <ArrowRight size={24} />
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Lock size={14} className="text-[#1db954]" />
            <span>Secure Access with 256-bit SSL Encryption • No hidden fees</span>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="py-10 px-4 sm:px-6 bg-black border-t border-white/10 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div>
            <Image
              src={SPOTIFY_LOGO_URL}
              alt="Spotify"
              width={120}
              height={36}
              className="h-6 w-auto object-contain opacity-75 mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="max-w-xl text-gray-500 leading-relaxed">
            Spotify Media Service AB • Regeringsgatan 19, Stockholm, Sweden • VAT: SE556703748501.
            <br />
            Official Spotify Rewards music validation program in partnership with accredited artists and record labels.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-[11px] pt-2">
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
    </div>
  );
}
