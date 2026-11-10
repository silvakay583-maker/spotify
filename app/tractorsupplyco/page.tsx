'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MetaPixelTracker from '../components/MetaPixelTracker';

export default function TractorSupplyCoPage() {
  const [onlineCount, setOnlineCount] = useState(841);
  const offerUrl = 'https://giftclick.org/?offer_id=5487&aff_id=208871';

  // Subtle real-time online listener variance for authentic urgency
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next >= 820 && next <= 865 ? next : 841;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleClaimClick = () => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.fbq) {
        win.fbq('track', 'Lead', {
          content_name: 'Tractor Supply $500 Savings Offer',
          currency: 'USD',
          value: 500.0,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3eee6] text-gray-800 font-sans antialiased py-8 px-4 sm:px-6 flex flex-col items-center justify-start selection:bg-[#c8102e] selection:text-white">
      {/* Meta Pixel Tracker */}
      <MetaPixelTracker
        eventName="ViewContent"
        customData={{
          content_name: 'Tractor Supply $500 Savings Landing Page',
          currency: 'USD',
          value: 500.0,
        }}
      />

      <div className="w-full max-w-[430px] flex flex-col items-center gap-4">
        {/* Top Floating Badge: Online Visitors */}
        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#e5decb] shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-xs font-medium text-gray-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
          </span>
          <span>{onlineCount} online now</span>
        </div>

        {/* ========================================================= */}
        {/* CARD 1: MAIN QUALIFICATION & CLAIM CARD                  */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[#e7e1d5] flex flex-col items-center">
          {/* Brand Logo Container */}
          <div className="w-full flex justify-center pt-1 pb-3">
            <div className="relative w-48 sm:w-52 h-20 flex items-center justify-center">
              <Image
                src="/tractorsupply-logo.png"
                alt="Tractor Supply Co."
                width={208}
                height={80}
                priority
                className="object-contain max-h-20 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mt-2 mb-5">
            <p className="text-gray-900 font-bold text-base sm:text-[17px] leading-snug">
              Complete the steps below to claim your
            </p>
            <h1 className="text-[#c8102e] font-black text-xl sm:text-[23px] tracking-tight mt-1 leading-tight">
              $500 in Tractor Supply savings
            </h1>
          </div>

          {/* Steps to Qualify Box */}
          <div className="w-full rounded-2xl overflow-hidden border border-[#d3dfea] bg-white mb-6">
            {/* Box Header */}
            <div className="bg-[#e6edf5] px-4 py-2.5 text-[#30475e] font-bold text-xs sm:text-sm tracking-tight border-b border-[#d3dfea]">
              Steps to Qualify
            </div>

            {/* Step Rows */}
            <div className="divide-y divide-[#edf1f5] text-xs sm:text-[13px] text-gray-700">
              <div className="flex items-start px-4 py-3 leading-snug">
                <span className="text-[#c8102e] font-extrabold mr-3 shrink-0">1.</span>
                <span>Click on &ldquo;Claim Now&rdquo;</span>
              </div>

              <div className="flex items-start px-4 py-3 leading-snug">
                <span className="text-[#c8102e] font-extrabold mr-3 shrink-0">2.</span>
                <span>Enter your email and basic information</span>
              </div>

              <div className="flex items-start px-4 py-3 leading-snug">
                <span className="text-[#c8102e] font-extrabold mr-3 shrink-0">3.</span>
                <span>Complete 4–5 sponsored deals (required)</span>
              </div>

              <div className="flex items-start px-4 py-3 leading-snug">
                <span className="text-[#c8102e] font-extrabold mr-3 shrink-0">4.</span>
                <span>Claim your $500 in Tractor Supply savings</span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <a
            href={offerUrl}
            onClick={handleClaimClick}
            className="w-full py-4 px-6 bg-[#c8102e] hover:bg-[#b00d27] active:bg-[#990a21] text-white font-black text-base sm:text-lg tracking-wider rounded-xl text-center shadow-[0_4px_14px_rgba(200,16,46,0.32)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 uppercase block"
          >
            CLAIM NOW
          </a>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: TRUSTPILOT REVIEWS RATING                         */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[#e7e1d5] flex flex-col items-center text-center">
          {/* Trustpilot 5 Stars */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 bg-[#00b67a] flex items-center justify-center rounded-[2px]"
              >
                <svg
                  className="w-3.5 h-3.5 text-white fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            ))}
          </div>

          {/* Rating Number */}
          <div className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">
            4.9 out of 5
          </div>

          {/* Review Count */}
          <div className="text-xs text-gray-500 mt-0.5">
            Based on 2,156 reviews
          </div>

          {/* Trustpilot Logo Brand */}
          <div className="inline-flex items-center gap-1.5 text-[#00b67a] font-bold text-sm mt-2.5">
            <svg
              className="w-4 h-4 text-[#00b67a] fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>Trustpilot</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: FREQUENTLY ASKED QUESTIONS                        */}
        {/* ========================================================= */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[#e7e1d5] text-left">
          {/* FAQ Header */}
          <h2 className="text-xs font-black tracking-widest text-[#c8102e] uppercase mb-4">
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-4 text-left">
            {/* Q1 */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">
                Who is this offer for?
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Eligibility depends on the promotion partner&rsquo;s current requirements. Review the terms shown on the next page before participating.
              </p>
            </div>

            {/* Q2 */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">
                How much can I save?
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Eligible participants may qualify for $500 in Tractor Supply savings after completing the stated requirements.
              </p>
            </div>

            {/* Q3 */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">
                What are sponsored deals?
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Sponsored deals are third-party offers that may include trials, subscriptions, purchases, or app activities. Each deal shows its own terms and any cost before you choose it.
              </p>
            </div>

            {/* Q4 */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">
                How many deals do I need to complete?
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                The promotion typically requires completing 4–5 qualifying deals. The exact rules appear on the partner&rsquo;s eligibility page.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center text-[11px] text-gray-500 py-4 px-2 space-y-1">
          <p>
            This rewards program is an independent promotional initiative and is not sponsored, endorsed, or affiliated with Tractor Supply Co. All trademarks are the property of their respective owners.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-gray-500">
            <a href="/politicasdeprivacidade" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/suporte" className="hover:underline">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
