'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import MetaPixelTracker from './components/MetaPixelTracker';

const OFFER_URL = 'https://giftclick.org/?offer_id=5487&aff_id=208871';
const BRAND_LOGO_URL = 'https://tradenetlease.com/wp-content/uploads/2023/02/tenant-page-logos-25.png';

export default function TractorSupplyLandingPage() {
  const [onlineUsers, setOnlineUsers] = useState(841);
  const [logoSrc, setLogoSrc] = useState('/brand-logo.png');

  // Realistic subtle live users fluctuation around 840
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const updated = prev + delta;
        return updated < 820 ? 835 : updated > 865 ? 850 : updated;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleClaimClick = () => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.fbq) {
        win.fbq('track', 'InitiateCheckout', {
          content_name: 'Tractor Supply $500 Savings',
          value: 500.0,
          currency: 'USD',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#2D3139] font-sans antialiased py-6 px-4 sm:px-6 flex flex-col items-center justify-start">
      {/* Meta Pixel Tracker */}
      <MetaPixelTracker
        eventName="PageView"
        customData={{
          content_name: 'Tractor Supply $500 Savings Offer Landing',
          currency: 'USD',
        }}
      />

      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
        {/* Top Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E5DFD5] shadow-xs text-xs sm:text-[13px] font-medium text-gray-700 mb-4 transition-all">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse inline-block" />
          <span>
            <strong className="font-semibold text-gray-900 tabular-nums">{onlineUsers}</strong> online now
          </span>
        </div>

        {/* ========================================================= */}
        {/* CARD 1: MAIN PROMOTION & STEPS TO QUALIFY CARD            */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#EDE8DE] flex flex-col items-center text-center">
          {/* Brand Logo Container */}
          <div className="w-full flex justify-center items-center py-2 min-h-[70px]">
            <div className="relative w-[210px] sm:w-[240px] h-[72px]">
              <Image
                src={logoSrc}
                alt="Tractor Supply Co. Official Logo"
                fill
                sizes="(max-width: 640px) 210px, 240px"
                className="object-contain"
                priority
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoSrc !== BRAND_LOGO_URL) {
                    setLogoSrc(BRAND_LOGO_URL);
                  }
                }}
              />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-[17px] sm:text-[19px] font-bold text-[#1E2229] leading-snug tracking-tight mt-3">
            Complete the steps below to claim your
          </h1>

          {/* Subheading Highlight */}
          <div className="text-[20px] sm:text-[23px] font-black text-[#C8102E] leading-tight tracking-tight mt-1 mb-5">
            $500 in Tractor Supply savings
          </div>

          {/* Steps to Qualify Box */}
          <div className="w-full rounded-2xl overflow-hidden bg-[#EDF3F8] border border-[#DEE7F0] text-left">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#E1EAF2] border-b border-[#D4E0EC]">
              <h2 className="text-sm sm:text-[15px] font-bold text-[#1E2D3D] tracking-tight">
                Steps to Qualify
              </h2>
            </div>

            {/* Step 1 */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#DFE7EE]">
              <span className="font-bold text-[#C8102E] text-sm shrink-0 w-4">
                1.
              </span>
              <span className="text-[13.5px] sm:text-[14px] font-medium text-[#334155] leading-snug">
                Click on “Claim Now”
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#DFE7EE]">
              <span className="font-bold text-[#C8102E] text-sm shrink-0 w-4">
                2.
              </span>
              <span className="text-[13.5px] sm:text-[14px] font-medium text-[#334155] leading-snug">
                Enter your email and basic information
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#DFE7EE]">
              <span className="font-bold text-[#C8102E] text-sm shrink-0 w-4">
                3.
              </span>
              <span className="text-[13.5px] sm:text-[14px] font-medium text-[#334155] leading-snug">
                Complete 4–5 sponsored deals (required)
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="font-bold text-[#C8102E] text-sm shrink-0 w-4">
                4.
              </span>
              <span className="text-[13.5px] sm:text-[14px] font-medium text-[#334155] leading-snug">
                Claim your $500 in Tractor Supply savings
              </span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <a
            href={OFFER_URL}
            onClick={handleClaimClick}
            className="w-full mt-6 bg-[#C8102E] hover:bg-[#A90D25] active:scale-[0.985] text-white font-extrabold text-[15px] sm:text-base tracking-wider uppercase py-4 px-6 rounded-2xl shadow-[0_4px_14px_rgba(200,16,46,0.35)] transition-all flex items-center justify-center cursor-pointer select-none text-center"
          >
            CLAIM NOW
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: SOCIAL PROOF / TRUSTPILOT RATING CARD             */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#EDE8DE] flex flex-col items-center text-center mt-5">
          {/* Trustpilot 5 Stars */}
          <div className="flex items-center justify-center gap-1.5 text-[#00B67A]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>

          {/* Rating */}
          <div className="text-2xl sm:text-[26px] font-black text-[#1E2229] tracking-tight mt-2.5 mb-0.5">
            4.9 out of 5
          </div>

          {/* Review Count */}
          <div className="text-xs sm:text-[13px] text-gray-500 font-medium mb-2.5">
            Based on 2,156 reviews
          </div>

          {/* Trustpilot Branding */}
          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#00B67A]">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Trustpilot</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: FREQUENTLY ASKED QUESTIONS CARD                   */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-[26px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#EDE8DE] flex flex-col text-left mt-5">
          {/* FAQ Kicker */}
          <h2 className="text-xs sm:text-[13px] font-bold text-[#C8102E] uppercase tracking-wider mb-5">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-5">
            {/* Q1 */}
            <div>
              <h3 className="text-sm sm:text-[15px] font-bold text-[#1E2229] mb-1.5">
                Who is this offer for?
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#555E6C] leading-relaxed">
                Eligibility depends on the promotion partner’s current requirements. Review the terms shown on the next page before participating.
              </p>
            </div>

            {/* Q2 */}
            <div>
              <h3 className="text-sm sm:text-[15px] font-bold text-[#1E2229] mb-1.5">
                How much can I save?
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#555E6C] leading-relaxed">
                Eligible participants may qualify for $500 in Tractor Supply savings after completing the stated requirements.
              </p>
            </div>

            {/* Q3 */}
            <div>
              <h3 className="text-sm sm:text-[15px] font-bold text-[#1E2229] mb-1.5">
                What are sponsored deals?
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#555E6C] leading-relaxed">
                Sponsored deals are third-party offers that may include trials, subscriptions, purchases, or app activities. Each deal shows its own terms and any cost before you choose it.
              </p>
            </div>

            {/* Q4 */}
            <div>
              <h3 className="text-sm sm:text-[15px] font-bold text-[#1E2229] mb-1.5">
                How many deals do I need to complete?
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#555E6C] leading-relaxed">
                The promotion typically requires completing 4–5 qualifying deals. The exact rules appear on the partner’s eligibility page.
              </p>
            </div>
          </div>
        </div>

        {/* Footer & Compliance Disclaimer */}
        <footer className="w-full mt-7 mb-6 text-center text-[11px] text-[#848B96] space-y-3 leading-relaxed px-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-gray-500 font-medium">
            <a href={OFFER_URL} className="hover:text-gray-700 transition-colors">
              Terms &amp; Conditions
            </a>
            <span>•</span>
            <a href={OFFER_URL} className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href={OFFER_URL} className="hover:text-gray-700 transition-colors">
              FAQ &amp; Help
            </a>
          </div>

          <p>
            Tractor Supply Co. trademarks and logos are the property of Tractor Supply Company. This independent promotional rewards program is sponsored and operated by GiftClick.
          </p>

          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
