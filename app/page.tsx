'use client';

import {
  ArrowRight,
  BadgeAlert,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  Flame,
  Globe,
  Headphones,
  Lock,
  Music2,
  Play,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Tv,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CampaignItem {
  id: string;
  brand: string;
  brandTag: string;
  brandColor: string;
  brandBorder: string;
  title: string;
  status: 'active' | 'closed';
  statusBadge: string;
  rewardValue: string;
  rewardSub: string;
  category: string;
  slotsText: string;
  dateBadge: string;
  description: string;
  highlights: string[];
  href: string;
  accentBg: string;
  isHot?: boolean;
}

const campaigns: CampaignItem[] = [
  {
    id: 'spotify-evaluator-2026',
    brand: 'Spotify',
    brandTag: 'Official Partner',
    brandColor: 'text-[#107c37]',
    brandBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-500/10',
    title: 'Music Track & Audio Evaluator Program',
    status: 'active',
    statusBadge: 'Open & Recruiting',
    rewardValue: 'Up to $350 / day',
    rewardSub: 'Instant Payout per Batch',
    category: 'Audio Streaming & Music QA',
    slotsText: '7 Positions Available Today',
    dateBadge: 'Active Right Now',
    description:
      'Evaluate new audio releases from top global hitmakers and independent music producers. Rate song melody, lyrics and rhythm on your phone and withdraw daily commissions directly.',
    highlights: ['Earphones/Headphones', 'Daily Bank Transfer', 'No Experience Required'],
    href: '/spotify',
    isHot: true,
  },
  {
    id: 'netflix-preview-qa',
    brand: 'Netflix',
    brandTag: 'Streaming Labs',
    brandColor: 'text-[#e50914]',
    brandBorder: 'border-rose-300',
    accentBg: 'bg-rose-50',
    title: 'Teaser & Subtitle Audience Engagement Test',
    status: 'closed',
    statusBadge: 'Campaign Ended (Quota Reached)',
    rewardValue: '$45.00 / test batch',
    rewardSub: 'Total Paid: $22,500',
    category: 'Video Streaming & Subtitles',
    slotsText: '500 / 500 Applicants Approved',
    dateBadge: 'Concluded 3 Days Ago',
    description:
      'Evaluated 30-second localized trailers to verify subtitle synchronization, comedic timing, and viewer retention scores prior to season premieres.',
    highlights: ['Closed Intake', 'Full Quota Reached', 'Vouchers Disbursed'],
    href: '/spotify',
  },
  {
    id: 'amazon-shopper-panel',
    brand: 'Amazon',
    brandTag: 'Retail Panel',
    brandColor: 'text-[#d97706]',
    brandBorder: 'border-amber-300',
    accentBg: 'bg-amber-50',
    title: 'Consumer Grocery Receipt & Brand Pulse Panel',
    status: 'closed',
    statusBadge: 'Intake Closed (Waitlist Only)',
    rewardValue: '$120.00 / month',
    rewardSub: 'Recurring Monthly Balance',
    category: 'Retail Analytics & Receipts',
    slotsText: 'Capacity Cap Reached',
    dateBadge: 'Closed Last Week',
    description:
      'Select monthly consumer group uploading shopping receipts and sharing brief opinions on weekly grocery items with guaranteed electronic gift cards.',
    highlights: ['Intake Cap 1,200', 'Waitlist Active', 'Next Intake Q3'],
    href: '/spotify',
  },
  {
    id: 'tiktok-sound-curator',
    brand: 'TikTok',
    brandTag: 'Creator Insights',
    brandColor: 'text-[#0ea5e9]',
    brandBorder: 'border-sky-300',
    accentBg: 'bg-sky-50',
    title: 'Viral Audio Soundbite & Trend Categorization',
    status: 'closed',
    statusBadge: 'Campaign Completed',
    rewardValue: '$28.50 / hour',
    rewardSub: 'Total Paid: $14,200',
    category: 'Social Media & Audio Trends',
    slotsText: '250 / 250 Verified',
    dateBadge: 'Closed 2 Weeks Ago',
    description:
      'Screened 15-second background audio clips to classify trending music subgenres and ensure platform safety standards before viral hashtag rollouts.',
    highlights: ['Completed Round', 'All Funds Released', 'Archived'],
    href: '/spotify',
  },
];

export default function NextOfferSpotHome() {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

  const filtered = campaigns.filter((c) => {
    if (filter === 'active') return c.status === 'active';
    if (filter === 'closed') return c.status === 'closed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Lively Color Notification Ribbon */}
      <aside className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white text-xs py-2.5 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>
              <strong>Next Offer Spot Hub:</strong> Verified partner campaigns, remote micro-tasks, and real-time payouts.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-indigo-100">
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">1 Active Campaign Today</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Zero Application Fees</span>
          </div>
        </div>
      </aside>

      {/* Main Clean & Colorful Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo with Distinctive Clean Color Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              NOS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Next Offer Spot
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Verified Remote Offers &amp; Rewards</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#campaigns" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>All Offers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {campaigns.length}
              </span>
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#trust-guarantee" className="hover:text-indigo-600 transition-colors">
              Verified Payouts
            </a>
          </nav>

          {/* Prominent Direct Button to Active Spotify Offer */}
          <Link
            href="/spotify"
            className="inline-flex items-center gap-2 bg-[#1ed760] hover:bg-[#1db954] text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full transition-all duration-200 transform hover:scale-[1.03] shadow-md shadow-emerald-500/25"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
            </span>
            <span>Spotify ($350/day)</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero Section with Warm Color Accents */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-[#f3f6fb] border-b border-slate-200/60">
        {/* Subtle Decorative Color Blobs */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-indigo-200/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/80 mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold text-indigo-900 tracking-wide">
              Next Offer Spot Central Directory • Real-Time Openings
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15] mb-5">
            Discover Verified Remote Offers &amp;{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              High-Payout Micro Tasks
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
            We partner directly with leading media, retail, and tech corporations to host exclusive evaluation campaigns. Access open positions before slots fill up.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Daily Top Pay</span>
              <strong className="text-lg sm:text-xl font-black text-emerald-600">$350.00</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Open Offers</span>
              <strong className="text-lg sm:text-xl font-black text-indigo-600">1 Live Now</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Archived Offers</span>
              <strong className="text-lg sm:text-xl font-black text-slate-700">3 Concluded</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Access Fee</span>
              <strong className="text-lg sm:text-xl font-black text-emerald-600">100% Free</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Offers Section */}
      <section id="campaigns" className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Controls Bar: Title & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                <span>Directory Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Partner Campaigns &amp; Positions
              </h2>
            </div>

            {/* Filter Pills with Color */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Campaigns ({campaigns.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  filter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                Active Only (1)
              </button>
              <button
                type="button"
                onClick={() => setFilter('closed')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                  filter === 'closed'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ended / Closed (3)
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-6">
            {filtered.map((item) => {
              const isActive = item.status === 'active';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-6 sm:p-8 border transition-all relative overflow-hidden ${
                    isActive
                      ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 hover:border-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Active Highlight Top Strip */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#1ed760] to-teal-500" />
                  )}

                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    {/* Left: Brand Identity & Title */}
                    <div className="flex-1">
                      {/* Tags Bar */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Brand Badge */}
                        <span
                          className={`font-black text-xs px-2.5 py-0.5 rounded-md border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.brand} • {item.brandTag}
                        </span>

                        {/* Status Badge */}
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {item.statusBadge}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock size={12} />
                            {item.statusBadge}
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-medium">{item.dateBadge}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-2xl">
                        {item.description}
                      </p>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item.highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                              isActive
                                ? 'bg-slate-50 text-slate-700 border-slate-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Compensation & Actions */}
                    <div className="w-full lg:w-72 shrink-0 flex flex-col justify-between sm:items-end p-4 sm:p-0 rounded-xl bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
                      <div className="sm:text-right mb-4">
                        <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                          Verified Compensation
                        </span>
                        <strong
                          className={`text-2xl sm:text-3xl font-black block tracking-tight ${
                            isActive ? 'text-emerald-600' : 'text-slate-700'
                          }`}
                        >
                          {item.rewardValue}
                        </strong>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {item.rewardSub}
                        </span>
                        <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {item.slotsText}
                        </span>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="w-full flex flex-col gap-2">
                        {isActive ? (
                          <>
                            <Link
                              href="/spotify"
                              className="w-full inline-flex items-center justify-center gap-2 bg-[#1ed760] hover:bg-[#1db954] text-slate-950 font-black text-sm py-3 px-5 rounded-xl transition-all transform hover:scale-[1.02] shadow-md shadow-emerald-500/25"
                            >
                              <span>Open Spotify Offer Page</span>
                              <ArrowRight size={16} />
                            </Link>

                            <Link
                              href="/spotify/rewards"
                              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
                            >
                              <Headphones size={14} className="text-emerald-400" />
                              <span>Direct Evaluator Chat</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 cursor-not-allowed"
                            >
                              <Lock size={13} />
                              <span>Registration Closed</span>
                            </button>

                            <Link
                              href="/spotify"
                              className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 py-1 transition-colors"
                            >
                              <span>Apply to Open Spotify Offer instead →</span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Banner Preview (Spotify Active) */}
      <section className="py-10 px-4 sm:px-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 inline-block mb-3">
                Featured Campaign Spotlight
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                Spotify Music Evaluator Program ($350/day)
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xl">
                The only live campaign currently accepting new participants with instant commission release. Review 6 sample tracks to test the evaluation platform today.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/spotify"
                  className="inline-flex items-center gap-2 bg-[#1ed760] hover:bg-[#1db954] text-slate-950 font-black text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>Go to Offer Details</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/spotify/rewards"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  <span>Open Audio Funnel</span>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <Link href="/spotify" className="block group">
                <div className="relative rounded-xl overflow-hidden border border-emerald-300 shadow-md bg-black group-hover:scale-105 transition-transform">
                  <Image
                    src="/spotify-hero-banner.webp"
                    alt="Spotify Music Evaluator Banner"
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover block"
                    priority
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 text-xs text-white">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Session Active
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 sm:py-18 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 inline-block mb-3">
              Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              How Next Offer Spot Distributes Campaigns
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A clear, verified pathway from corporate sponsorship to evaluator payout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-sm shadow-indigo-600/30">
                1
              </div>
              <h4 className="font-black text-slate-900 text-base mb-2">Dedicated Route Per Offer</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Each verified partner gets a custom sub-path (e.g. <code>/spotify</code>) containing complete instructions, terms, and the interactive evaluator tool.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-sm shadow-emerald-600/30">
                2
              </div>
              <h4 className="font-black text-slate-900 text-base mb-2">Live Intake Monitoring</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Positions are tracked in real-time. When a partner’s quota is achieved, the campaign status updates automatically to prevent unpaid work.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-sm shadow-blue-600/30">
                3
              </div>
              <h4 className="font-black text-slate-900 text-base mb-2">Instant Accounting &amp; Cashout</h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Evaluators finish their assigned batches and generate signed documentation with immediate transfer capability to their preferred account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee */}
      <section id="trust-guarantee" className="py-10 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-white text-base">Next Offer Spot Partner Verification</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Zero fees for participants. All campaigns undergo legal and compensation verification before publishing to the hub.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Verified Escrow
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Free Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Direct USD Payouts
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              NOS
            </div>
            <span className="font-black text-slate-900 text-base">Next Offer Spot</span>
            <span className="text-slate-400 text-xs">| Central Offers Hub</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 font-semibold">
            <Link href="/spotify" className="hover:text-emerald-600 transition-colors">
              Active: Spotify ($350/day)
            </Link>
            <Link href="/spotify/rewards" className="hover:text-emerald-600 transition-colors">
              Evaluator Chat (/spotify/rewards)
            </Link>
            <span className="text-slate-400">Terms</span>
            <span className="text-slate-400">Privacy</span>
            <span className="text-slate-400">Support</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            &copy; {new Date().getFullYear()} Next Offer Spot LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
