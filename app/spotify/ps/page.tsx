'use client';

import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  Lock,
  Music2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MetaPixelTracker, { trackFunnelPixelEvent } from '../../components/MetaPixelTracker';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const SPOTIFY_ICON_URL = '/spotify-logo.webp';
const SPOTIFY_LOGO_URL = '/spotify-full-logo.png';

interface QuizQuestion {
  id: string;
  badge: string;
  question: string;
  subtitle: string;
  options: {
    label: string;
    sublabel?: string;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'music_habit',
    badge: 'Question 1 of 4 • Listening Habits',
    question: 'Do you enjoy listening to music in your daily routine?',
    subtitle:
      'Let us know how often you listen to music, playlists, or audio content during the week.',
    options: [
      { label: 'Yes, I listen to music every single day', sublabel: 'Daily active listener' },
      { label: 'Yes, several times a week', sublabel: 'Regular weekly listener' },
      { label: 'Mostly while commuting, working, or relaxing', sublabel: 'Casual listener' },
    ],
  },
  {
    id: 'spotify_usage',
    badge: 'Question 2 of 4 • Platform Experience',
    question: 'Do you already use Spotify in your day-to-day life?',
    subtitle:
      'We want to understand your familiarity with playlists, new releases, and streaming features.',
    options: [
      { label: 'Yes, Spotify is my main music app', sublabel: 'Primary streaming platform' },
      { label: 'Yes, I use Spotify frequently', sublabel: 'Active platform user' },
      { label: 'I use it occasionally or want to start now', sublabel: 'Open to new releases' },
    ],
  },
  {
    id: 'service_rating',
    badge: 'Question 3 of 4 • Service Feedback',
    question: 'How would you rate Spotify’s streaming service and music catalog?',
    subtitle:
      'Your honest rating helps our partner record labels and audio curators improve the listener experience.',
    options: [
      { label: '5 / 5 Stars — Excellent audio & catalog', sublabel: 'Top rating' },
      { label: '4 / 5 Stars — Very good overall experience', sublabel: 'Positive rating' },
      { label: '3 / 5 Stars — Good, but could discover more tracks', sublabel: 'Neutral rating' },
    ],
  },
  {
    id: 'partner_interest',
    badge: 'Question 4 of 4 • Program Eligibility',
    question:
      'Would you be interested in participating as an official Spotify Listener Partner?',
    subtitle:
      'As a participant, you listen to selected songs from partner artists and share quick feedback directly from your phone.',
    options: [
      {
        label: 'Yes, I want to learn more and start now',
        sublabel: 'Immediate access to the listener session',
      },
      {
        label: 'Yes, I am interested in participating',
        sublabel: 'Proceed to interactive presentation',
      },
    ],
  },
];

export default function SpotifyPresellPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [targetHref, setTargetHref] = useState('/spotify/rewards');

  // Preserve TikTok / Meta URL query parameters (ttclid, utm_source, etc.) when forwarding to /spotify/rewards
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      setTargetHref(`/spotify/rewards${window.location.search}`);
    }
  }, []);

  const totalSteps = QUIZ_QUESTIONS.length;
  const activeQuestion = QUIZ_QUESTIONS[currentStep];
  const progressPercent = isApproved
    ? 100
    : Math.round(((currentStep + (selectedOption !== null ? 0.5 : 0)) / totalSteps) * 100);

  const handleSelectOption = (index: number) => {
    if (isAnalyzing || isApproved) return;
    setSelectedOption(index);

    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setIsAnalyzing(true);
        trackFunnelPixelEvent('ViewContent', {
          content_id: 'spotify_presell_quiz_completed',
          content_name: 'Spotify Presell Quiz Completed',
          content_type: 'product',
        });

        setTimeout(() => {
          setIsAnalyzing(false);
          setIsApproved(true);
        }, 1100);
      }
    }, 220);
  };

  // Auto-redirect shortly after approval while also offering an instant click button
  useEffect(() => {
    if (!isApproved) return;
    const timer = setTimeout(() => {
      router.push(targetHref);
    }, 1400);
    return () => clearTimeout(timer);
  }, [isApproved, router, targetHref]);

  return (
    <div
      className={`${inter.className} min-h-screen bg-[#0c0c0c] text-white antialiased selection:bg-[#1ED760] selection:text-black flex flex-col justify-between relative overflow-hidden`}
    >
      <MetaPixelTracker
        eventName="PageView"
        customData={{
          content_id: 'spotify_presell_ps',
          content_name: 'Spotify Listener Presell Quiz',
          content_type: 'product',
        }}
      />

      {/* Subtle ambient green glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[540px] h-[280px] rounded-full bg-[#1ED760]/[0.07] blur-[110px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-8 pb-12">
        <div className="w-full max-w-xl mx-auto">
          {/* Top Brand Identity */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 shadow-[0_0_35px_rgba(30,215,96,0.22)]">
              <Image
                src={SPOTIFY_ICON_URL}
                alt="Spotify"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1ED760] mb-2">
              <span>Official Partner Program</span>
              <span aria-hidden="true">·</span>
              <span>Listener Survey</span>
            </div>

            <h1
              style={{ textWrap: 'balance' }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug max-w-lg"
            >
              Complete your quick{' '}
              <span className="text-[#1ED760]">Spotify Listener</span> profile
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#A7A7A7] max-w-md leading-relaxed">
              Answer 4 quick questions about your music listening habits to unlock access to the
              interactive session.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-[#A7A7A7] mb-2">
              <span className="font-medium text-white/90">
                {isApproved
                  ? 'Profile Verified'
                  : isAnalyzing
                    ? 'Checking compatibility...'
                    : `Step ${currentStep + 1} of ${totalSteps}`}
              </span>
              <span className="tabular-nums font-semibold text-[#1ED760]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1f1f1f] overflow-hidden">
              <div
                className="h-full bg-[#1ED760] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <div className="rounded-2xl bg-[#161616] border border-[#262626] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
            {!isAnalyzing && !isApproved && (
              <div>
                <div className="text-xs font-medium text-[#1ED760] mb-2">
                  {activeQuestion.badge}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-2">
                  {activeQuestion.question}
                </h2>

                <p className="text-xs sm:text-sm text-[#A7A7A7] leading-relaxed mb-6">
                  {activeQuestion.subtitle}
                </p>

                <div className="space-y-3">
                  {activeQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left rounded-xl p-4 border transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer group ${
                          isSelected
                            ? 'bg-[#1ED760]/15 border-[#1ED760] text-white'
                            : 'bg-[#1f1f1f]/80 border-[#2e2e2e] hover:border-[#1ED760]/60 hover:bg-[#242424] text-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-semibold text-white group-hover:text-[#1ED760] transition-colors">
                            {option.label}
                          </div>
                          {option.sublabel && (
                            <div className="text-xs text-[#9a9a9a] mt-0.5">{option.sublabel}</div>
                          )}
                        </div>

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-[#1ED760] border-[#1ED760] text-black'
                              : 'border-[#3e3e3e] group-hover:border-[#1ED760] text-[#A7A7A7] group-hover:text-[#1ED760]'
                          }`}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analyzing State */}
            {isAnalyzing && (
              <div className="py-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-3 border-[#1ED760]/30 border-t-[#1ED760] animate-spin mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">
                  Submitting your listener profile...
                </h3>
                <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-sm">
                  Preparing your interactive session for the official Spotify Listener program.
                </p>
              </div>
            )}

            {/* Approved / Redirect State */}
            {isApproved && (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/40 flex items-center justify-center text-[#1ED760] mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Profile Confirmed! You’re Ready
                </h3>

                <p className="text-xs sm:text-sm text-[#A7A7A7] max-w-md leading-relaxed mb-6">
                  Thank you for completing the listener survey. You are now being redirected to the{' '}
                  <span className="text-white font-semibold">Spotify Listener</span> interactive
                  experience.
                </p>

                <Link
                  href={targetHref}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1ED760] hover:bg-[#1fdf64] text-black font-bold text-sm sm:text-base transition-all shadow-[0_6px_25px_rgba(30,215,96,0.3)] whitespace-nowrap"
                >
                  <span>Continue to Session</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Minimal Trust Highlights below Quiz */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[#141414] border border-[#222222] px-3 py-3">
              <Headphones className="w-4 h-4 text-[#1ED760] mx-auto mb-1" />
              <div className="text-[11px] sm:text-xs font-semibold text-white">Audio Curation</div>
              <div className="text-[10px] text-[#8e8e8e]">Listen on phone or PC</div>
            </div>
            <div className="rounded-xl bg-[#141414] border border-[#222222] px-3 py-3">
              <Star className="w-4 h-4 text-[#1ED760] mx-auto mb-1" />
              <div className="text-[11px] sm:text-xs font-semibold text-white">Quick Feedback</div>
              <div className="text-[10px] text-[#8e8e8e]">Rate songs & artists</div>
            </div>
            <div className="rounded-xl bg-[#141414] border border-[#222222] px-3 py-3">
              <ShieldCheck className="w-4 h-4 text-[#1ED760] mx-auto mb-1" />
              <div className="text-[11px] sm:text-xs font-semibold text-white">Verified Access</div>
              <div className="text-[10px] text-[#8e8e8e]">256-bit SSL secure</div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean White-Hat Footer */}
      <footer className="relative z-10 border-t border-[#1c1c1c] bg-[#090909] py-6 px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-3">
          <Image
            src={SPOTIFY_LOGO_URL}
            alt="Spotify"
            width={92}
            height={28}
            className="h-6 w-auto object-contain opacity-80"
            referrerPolicy="no-referrer"
          />
          <p className="text-[11px] text-[#737373] max-w-md leading-relaxed">
            Interactive music evaluation and listener feedback survey. Participation is subject to
            program terms and regional availability.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#8e8e8e]">
            <Link href="/politicasdeprivacidade" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/suporte" className="hover:text-white transition-colors">
              Terms & Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
