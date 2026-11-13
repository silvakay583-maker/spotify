'use client';

import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  KeyRound,
  Layers,
  LogOut,
  Music2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  Users,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { SPOTIFY_SCHEMA_SQL, supabase } from '../../../lib/supabase';

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
  stripe_payment_id?: string;
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
  commissionsEarned: number;
  lastActivityAt: string;
  paymentsHistory: PaymentItem[];
  funnelHistory: FunnelEventItem[];
  songsHistory: ListenerProgressItem[];
}

const CATALOG_OFFERS = [
  {
    id: 'front_9_00',
    name: 'Front-End: Taxa de Ativação ($9.00)',
    shortBadge: 'Ativação ($9.00)',
    price: 9.0,
    type: 'FRONT-END',
    description: 'Taxa inicial de verificação de conta no checkout principal',
  },
  {
    id: 'upsell_vip_19_90',
    name: 'Upsell #1: Saque VIP 7 Dias ($19.90)',
    shortBadge: 'VIP 7 Dias ($19.90)',
    price: 19.9,
    type: 'UPSELL #1',
    description: 'Reduz o prazo de saque de 15 dias para 7 dias (após aceitar diretrizes)',
  },
  {
    id: 'downsell_vip_11_90',
    name: 'Downsell #1: Saque VIP 7 Dias ($11.90)',
    shortBadge: 'Downsell VIP ($11.90)',
    price: 11.9,
    type: 'DOWNSELL #1',
    description: '40% OFF para quem recusou o Upsell #1 (exibido após a 2ª música)',
  },
  {
    id: 'upsell_booster3_16_97',
    name: 'Upsell #2: Booster +3 Músicas/Dia ($16.97)',
    shortBadge: 'Booster +3 ($16.97)',
    price: 16.97,
    type: 'UPSELL #2',
    description: 'Aumenta o limite diário de 3 para 6 músicas/dia (ao concluir 3/3 músicas)',
  },
  {
    id: 'downsell_booster2_9_12',
    name: 'Downsell #2: Booster +2 Músicas/Dia ($9.12)',
    shortBadge: 'Booster +2 ($9.12)',
    price: 9.12,
    type: 'DOWNSELL #2',
    description: 'Expande o limite diário para 5 músicas/dia para quem recusou o Booster +3',
  },
  {
    id: 'upsell_skip12h_9_65',
    name: 'Upsell #3: Pular Timer de 12h ($9.65)',
    shortBadge: 'Pulou 12h ($9.65)',
    price: 9.65,
    type: 'UPSELL #3',
    description: 'Destrava imediatamente o próximo dia sem aguardar as 12 horas',
  },
  {
    id: 'upsell_antifraud_9_97',
    name: 'Upsell #4: Taxa Anti-Fraude Saque ($9.97)',
    shortBadge: 'Anti-Fraude ($9.97)',
    price: 9.97,
    type: 'UPSELL #4',
    description: 'Taxa de liberação bancária após envio de documentos KYC no saque',
  },
];

export default function SpotifyAdminPage() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navigation & Filters State — Default to 'clientes' for immediate clarity
  const [activeTab, setActiveTab] = useState<
    'clientes' | 'funil' | 'transacoes' | 'leads' | 'sql_editor'
  >('clientes');
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'declined'>('all');
  const [leadFilter, setLeadFilter] = useState<'all' | 'abandoned' | 'approved' | 'declined' | 'active'>('all');
  const [customerFilter, setCustomerFilter] = useState<
    'all' | 'buyers' | 'with_account' | 'upsell_buyers' | 'declined_upsell'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [email: string]: boolean }>({});

  // Selected Customer Modal
  const [selectedCustomerModal, setSelectedCustomerModal] = useState<CustomerProfileSummary | null>(null);

  // Raw Data State
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cardTests, setCardTests] = useState<CardTestItem[]>([]);
  const [accounts, setAccounts] = useState<ListenerAccountItem[]>([]);
  const [progressList, setProgressList] = useState<ListenerProgressItem[]>([]);
  const [funnelEvents, setFunnelEvents] = useState<FunnelEventItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('spotify_admin_authed') === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

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
      setLoginError('Usuário ou senha incorretos.');
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
      const [leadsRes, paymentsRes, cardTestsRes] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('security_card_tests').select('*').order('created_at', { ascending: false }),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);

      // Deduplicate raw payments from Supabase (e.g. if an old webhook created customer@verified.com alongside a real email at the same minute)
      if (paymentsRes.data) {
        const rawList: PaymentItem[] = paymentsRes.data;
        const dedupedPayments: PaymentItem[] = [];

        for (const p of rawList) {
          const pEmail = (p.email || '').trim().toLowerCase();
          const pAmt = Number(p.amount || 9.0);
          const pTime = new Date(p.created_at).getTime();

          // Skip synthetic webhook fallback row if there is a real customer payment within 3 minutes for the same amount
          if (p.status === 'succeeded' && pEmail === 'customer@verified.com') {
            const hasRealMatch = rawList.some(
              (other) =>
                other.id !== p.id &&
                other.status === 'succeeded' &&
                (other.email || '').trim().toLowerCase() !== 'customer@verified.com' &&
                Math.abs(Number(other.amount || 9.0) - pAmt) < 0.05 &&
                Math.abs(new Date(other.created_at).getTime() - pTime) < 3 * 60 * 1000
            );
            if (hasRealMatch) continue;
          }

          // Skip duplicate succeeded row for same email + same amount within 10 minutes
          if (p.status === 'succeeded' && pEmail) {
            const alreadyAdded = dedupedPayments.some(
              (added) =>
                added.status === 'succeeded' &&
                (added.email || '').trim().toLowerCase() === pEmail &&
                Math.abs(Number(added.amount || 9.0) - pAmt) < 0.05 &&
                Math.abs(new Date(added.created_at).getTime() - pTime) < 10 * 60 * 1000
            );
            if (alreadyAdded) continue;
          }

          dedupedPayments.push(p);
        }

        setPayments(dedupedPayments);
      }

      if (cardTestsRes.data) setCardTests(cardTestsRes.data);

      // Fetch Listener Accounts
      let loadedAccounts: ListenerAccountItem[] = [];
      try {
        const { data: accountsData } = await supabase
          .from('listener_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        if (accountsData) loadedAccounts = accountsData;
      } catch {}

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
                    balance:
                      Number(localStorage.getItem('spotify_account_balance_' + parsed.email.toLowerCase())) ||
                      parsed.balance ||
                      114.93,
                    current_day:
                      Number(localStorage.getItem('spotify_current_day_' + parsed.email.toLowerCase())) ||
                      parsed.current_day ||
                      1,
                    songs_completed_today:
                      Number(localStorage.getItem('spotify_songs_completed_' + parsed.email.toLowerCase())) ||
                      parsed.songs_completed_today ||
                      0,
                    daily_song_limit:
                      Number(localStorage.getItem('spotify_daily_limit_' + parsed.email.toLowerCase())) ||
                      parsed.daily_song_limit ||
                      3,
                    completed_evaluations:
                      Number(localStorage.getItem('spotify_songs_completed_' + parsed.email.toLowerCase())) ||
                      parsed.completed_evaluations ||
                      0,
                    accepted_terms:
                      localStorage.getItem('spotify_terms_accepted_' + parsed.email.toLowerCase()) === 'true' ||
                      parsed.accepted_terms,
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

      // Fetch Song Progress
      try {
        const { data: progressData } = await supabase
          .from('listener_progress')
          .select('*')
          .order('created_at', { ascending: false });
        if (progressData) setProgressList(progressData);
      } catch {}

      // Fetch Funnel Events
      let combinedFunnelEvents: FunnelEventItem[] = [];
      try {
        const { data: funnelData } = await supabase
          .from('funnel_events')
          .select('*')
          .order('created_at', { ascending: false });
        if (funnelData) combinedFunnelEvents = funnelData;
      } catch {}

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
            if (!alreadyIn) combinedFunnelEvents.push(le);
          }
          combinedFunnelEvents.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } catch {}
      }
      setFunnelEvents(combinedFunnelEvents);
    } catch (err) {
      console.warn('Erro ao carregar dados do admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // CÁLCULO DE MÉTRICAS FINANCEIRAS E DE USO DO APP (SEM DUPLICIDADE)
  // =========================================================================
  const approvedPayments = payments.filter((p) => p.status === 'succeeded');
  const declinedPayments = payments.filter((p) => p.status === 'declined' || p.status === 'failed');

  const acceptedFunnelUpsells = funnelEvents.filter(
    (e) => e.action === 'accepted' && e.offer_id !== 'front_9_00'
  );

  const frontEndPayments = approvedPayments.filter(
    (p) => !p.amount || Math.abs(Number(p.amount) - 9.0) < 0.05
  );
  const upsellPaymentsInTable = approvedPayments.filter(
    (p) => p.amount && Math.abs(Number(p.amount) - 9.0) >= 0.05
  );

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

  const uniqueBuyerEmails = new Set<string>();
  approvedPayments.forEach((p) => {
    if (p.email) uniqueBuyerEmails.add(p.email.trim().toLowerCase());
  });
  acceptedFunnelUpsells.forEach((e) => {
    if (e.email) uniqueBuyerEmails.add(e.email.trim().toLowerCase());
  });

  const uniqueBuyersCount = uniqueBuyerEmails.size;
  const averageOrderValue = uniqueBuyersCount > 0 ? totalGrossRevenue / uniqueBuyersCount : 0;
  const approvalRate =
    payments.length > 0 ? ((approvedPayments.length / payments.length) * 100).toFixed(1) : '0.0';

  const getLeadStatus = (lead: CustomerLead): 'approved' | 'declined' | 'abandoned' | 'active' => {
    const emailClean = lead.email.toLowerCase();
    const hasPaid =
      approvedPayments.some((p) => p.email?.toLowerCase() === emailClean) ||
      acceptedFunnelUpsells.some((e) => e.email?.toLowerCase() === emailClean);
    if (hasPaid) return 'approved';

    const hasDeclined = declinedPayments.some((p) => p.email?.toLowerCase() === emailClean);
    if (hasDeclined) return 'declined';

    const minutesElapsed = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60);
    return minutesElapsed >= 10 ? 'abandoned' : 'active';
  };

  const abandonedLeadsCount = leads.filter((l) => getLeadStatus(l) === 'abandoned').length;

  // =========================================================================
  // RAIO-X POR OFERTA
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
      return { ...offer, views, accepted, declined, cardDeclines, revenue, convRate };
    }

    const evsForOffer = funnelEvents.filter((e) => e.offer_id === offer.id);
    const viewedCount = evsForOffer.filter((e) => e.action === 'viewed').length;
    const acceptedFromEvents = evsForOffer.filter((e) => e.action === 'accepted');
    const declinedCount = evsForOffer.filter((e) => e.action === 'declined').length;
    const cardDeclinedFromEvents = evsForOffer.filter((e) => e.action === 'card_declined').length;

    const paymentsMatchingPrice = approvedPayments.filter(
      (p) => p.amount && Math.abs(Number(p.amount) - offer.price) < 0.03
    );
    const declinedPaymentsMatchingPrice = declinedPayments.filter(
      (p) => p.amount && Math.abs(Number(p.amount) - offer.price) < 0.03
    );

    const acceptedEmailsSet = new Set<string>();
    acceptedFromEvents.forEach((e) => acceptedEmailsSet.add(e.email.toLowerCase()));
    paymentsMatchingPrice.forEach((p) => acceptedEmailsSet.add((p.email || 'anon').toLowerCase()));

    const accepted = Math.max(acceptedFromEvents.length, paymentsMatchingPrice.length, acceptedEmailsSet.size);
    const cardDeclines = Math.max(cardDeclinedFromEvents, declinedPaymentsMatchingPrice.length);
    const views = Math.max(viewedCount, accepted + declinedCount + cardDeclines);
    const revenue = accepted * offer.price;
    const convRate = views > 0 ? ((accepted / views) * 100).toFixed(1) : '0.0';

    return { ...offer, views, accepted, declined: declinedCount, cardDeclines, revenue, convRate };
  });

  // =========================================================================
  // PERFIS UNIFICADOS DE CLIENTES (COMPRAS + SENHA + LOGIN + MÚSICAS + COMISSÃO)
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
        commissionsEarned: 0,
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

  leads.forEach((l) => {
    ensureCustomerProfile(l.email, l.full_name, l.created_at);
  });

  accounts.forEach((acc) => {
    const prof = ensureCustomerProfile(acc.email, acc.full_name, acc.last_login_at || acc.created_at);
    prof.account = acc;
    prof.virtualBalance = Number(acc.balance ?? 114.93);
    prof.commissionsEarned = Math.max(0, +(prof.virtualBalance - 114.93).toFixed(2));
    prof.evaluationsCount = Number(acc.completed_evaluations ?? acc.songs_completed_today ?? 0);
  });

  payments.forEach((p) => {
    if (!p.email) return;
    const prof = ensureCustomerProfile(p.email, p.full_name, p.created_at);
    prof.paymentsHistory.push(p);

    if (new Date(p.created_at) > new Date(prof.lastActivityAt)) {
      prof.lastActivityAt = p.created_at;
    }

    const amt = Number(p.amount || 9.0);
    if (p.status === 'succeeded') {
      const matchedOffer = CATALOG_OFFERS.find((o) => Math.abs(o.price - amt) < 0.05);
      const offerId = matchedOffer ? matchedOffer.id : 'custom_' + p.id;
      const alreadyListed = prof.acceptedOffers.some((ao) => ao.id === offerId);

      if (!alreadyListed) {
        prof.totalSpent = +(prof.totalSpent + amt).toFixed(2);
        prof.approvedPurchasesCount += 1;
        if (Math.abs(amt - 9.0) < 0.05) prof.frontEndPaid = true;

        prof.acceptedOffers.push({
          id: offerId,
          label: matchedOffer ? matchedOffer.shortBadge : `Compra ($${amt.toFixed(2)})`,
          amount: amt,
          isDownsell: offerId.startsWith('downsell_'),
          date: p.created_at,
        });
      }
    } else {
      prof.declinedCardsCount += 1;
    }
  });

  funnelEvents.forEach((ev) => {
    const prof = ensureCustomerProfile(ev.email, ev.full_name, ev.created_at);
    prof.funnelHistory.push(ev);

    if (new Date(ev.created_at) > new Date(prof.lastActivityAt)) {
      prof.lastActivityAt = ev.created_at;
    }

    const matchedOffer = CATALOG_OFFERS.find((o) => o.id === ev.offer_id);
    const badgeLabel = matchedOffer
      ? matchedOffer.shortBadge
      : `${ev.offer_name} ($${Number(ev.amount).toFixed(2)})`;

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

  progressList.forEach((pr) => {
    const prof = ensureCustomerProfile(pr.listener_email, undefined, pr.created_at);
    prof.songsHistory.push(pr);
    if (prof.songsHistory.length > prof.evaluationsCount) {
      prof.evaluationsCount = prof.songsHistory.length;
    }
    const sumFromHistory = prof.songsHistory.reduce((acc, s) => acc + Number(s.reward_amount || 0), 0);
    if (sumFromHistory > prof.commissionsEarned) {
      prof.commissionsEarned = +sumFromHistory.toFixed(2);
      if (prof.virtualBalance <= 114.93) {
        prof.virtualBalance = +(114.93 + sumFromHistory).toFixed(2);
      }
    }
  });

  const allCustomerProfiles = Array.from(customerProfilesMap.values())
    .filter(
      (c) =>
        !c.email.includes('@spotify.lead') ||
        c.totalSpent > 0 ||
        c.declinedCardsCount > 0 ||
        Boolean(c.account)
    )
    .sort((a, b) => {
      if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
      if (Boolean(b.account) !== Boolean(a.account)) return b.account ? 1 : -1;
      if (b.evaluationsCount !== a.evaluationsCount) return b.evaluationsCount - a.evaluationsCount;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

  const totalAccountsCreated = allCustomerProfiles.filter((c) => Boolean(c.account?.password)).length;
  const totalSongsEvaluatedAllUsers = allCustomerProfiles.reduce(
    (acc, c) => acc + c.evaluationsCount,
    0
  );

  const filteredCustomerProfiles = allCustomerProfiles.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.email.toLowerCase().includes(q) ||
      c.full_name.toLowerCase().includes(q);

    const hasUpsellBought = c.acceptedOffers.some((o) => o.id !== 'front_9_00');
    const matchesFilter =
      customerFilter === 'all' ||
      (customerFilter === 'buyers' && c.totalSpent > 0) ||
      (customerFilter === 'with_account' && Boolean(c.account)) ||
      (customerFilter === 'upsell_buyers' && hasUpsellBought) ||
      (customerFilter === 'declined_upsell' && c.declinedOffers.length > 0);

    return matchesSearch && matchesFilter;
  });

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

  const filteredCardTests = cardTests.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      item.card_number.includes(q) ||
      (item.country && item.country.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'clientes') {
      csvContent +=
        'Nome,Email,Total Gasto LTV ($),Criou Senha,Senha,Assinou Contrato,Dia Atual,Musicas Avaliadas,Comissao Ganha ($),Saldo Total ($),Ofertas Compradas\n';
      filteredCustomerProfiles.forEach((c) => {
        const bought = c.acceptedOffers.map((o) => o.label).join(' | ') || 'Nenhuma';
        csvContent += `"${c.full_name}","${c.email}","${c.totalSpent.toFixed(2)}","${
          c.account?.password ? 'Sim' : 'Nao'
        }","${c.account?.password || ''}","${c.account?.accepted_terms ? 'Sim' : 'Nao'}","Dia ${
          c.account?.current_day || 1
        }","${c.evaluationsCount}","${c.commissionsEarned.toFixed(2)}","${c.virtualBalance.toFixed(
          2
        )}","${bought}"\n`;
      });
    } else {
      csvContent +=
        'Oferta,Preco ($),Visualizacoes,Compras Aprovadas,Recusas,Cartoes Recusados,Conversao (%),Receita ($)\n';
      offerPerformanceStats.forEach((o) => {
        csvContent += `"${o.name}","${o.price.toFixed(2)}","${o.views}","${o.accepted}","${o.declined}","${o.cardDeclines}","${o.convRate}%","${o.revenue.toFixed(2)}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spotify_admin_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090b0a] text-white font-sans antialiased flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111513] border border-[#222b26] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#1db954] text-black flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Spotify Rewards • Admin
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Painel Executivo de Clientes, Senhas, Músicas &amp; Faturamento
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#161c19] border border-[#28332c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1db954] pl-10"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161c19] border border-[#28332c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1db954] pl-10"
                  required
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              className="w-full py-3.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Acessar Painel Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b0a] text-[#e5e7eb] font-sans antialiased pb-16">
      {/* ========================================================================= */}
      {/* MODAL DE RAIO-X COMPLETO DO CLIENTE                                       */}
      {/* ========================================================================= */}
      {selectedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] bg-[#111513] border border-[#26312b] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#151a17] border-b border-[#222b26] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white">
                    {selectedCustomerModal.full_name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 font-bold text-xs tabular-nums">
                    Gasto Total: ${selectedCustomerModal.totalSpent.toFixed(2)} USD
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {selectedCustomerModal.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="p-2 rounded-lg bg-[#1c2420] hover:bg-[#26312b] text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* 4 Mini Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#151a17] border border-[#222b26]">
                  <span className="text-[11px] text-gray-400 block">Total Gasto (LTV)</span>
                  <span className="text-lg font-bold text-[#1db954] tabular-nums mt-0.5 block">
                    ${selectedCustomerModal.totalSpent.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {selectedCustomerModal.approvedPurchasesCount} compra(s)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151a17] border border-[#222b26]">
                  <span className="text-[11px] text-gray-400 block">Músicas Ouvidas</span>
                  <span className="text-lg font-bold text-white tabular-nums mt-0.5 block">
                    {selectedCustomerModal.evaluationsCount} / 20
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Dia {selectedCustomerModal.account?.current_day || 1} no App
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151a17] border border-[#222b26]">
                  <span className="text-[11px] text-gray-400 block">Comissão Ganha</span>
                  <span className="text-lg font-bold text-[#1db954] tabular-nums mt-0.5 block">
                    +${selectedCustomerModal.commissionsEarned.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-500">Em músicas no dashboard</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151a17] border border-[#222b26]">
                  <span className="text-[11px] text-gray-400 block">Saldo Total no App</span>
                  <span className="text-lg font-bold text-amber-400 tabular-nums mt-0.5 block">
                    ${selectedCustomerModal.virtualBalance.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-gray-500">Inicial $114.93 + Músicas</span>
                </div>
              </div>

              {/* Dados de Acesso no App (Senha, Login, Diretrizes, Saque) */}
              <div className="p-4 rounded-xl bg-[#151a17] border border-[#222b26] space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#1db954]" />
                  <span>Acesso ao App, Senha &amp; Progresso Diário</span>
                </h4>

                {selectedCustomerModal.account ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0e1210] p-3 rounded-lg border border-[#1f2723] space-y-1">
                      <span className="text-gray-400 block text-[11px]">Senha &amp; Diretrizes</span>
                      <div className="font-mono text-white font-bold">
                        Senha:{' '}
                        <span className="text-[#1db954]">
                          {selectedCustomerModal.account.password || 'Não criada'}
                        </span>
                      </div>
                      <div className="text-[11px]">
                        {selectedCustomerModal.account.accepted_terms ? (
                          <span className="text-[#1db954] font-semibold">
                            ✓ Assinou as Diretrizes
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">
                            ⏳ Diretrizes Pendentes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0e1210] p-3 rounded-lg border border-[#1f2723] space-y-1">
                      <span className="text-gray-400 block text-[11px]">Status de Login</span>
                      <div className="text-white font-semibold">
                        {selectedCustomerModal.account.last_login_at
                          ? 'Acessou o Dashboard'
                          : 'Conta Registrada'}
                      </div>
                      <div className="text-gray-400 font-mono text-[11px]">
                        Último acesso:{' '}
                        {new Date(
                          selectedCustomerModal.account.last_login_at ||
                            selectedCustomerModal.account.created_at
                        ).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    <div className="bg-[#0e1210] p-3 rounded-lg border border-[#1f2723] space-y-1">
                      <span className="text-gray-400 block text-[11px]">Rotina &amp; Saque</span>
                      <div className="text-white font-semibold">
                        Dia {selectedCustomerModal.account.current_day || 1} • Hoje:{' '}
                        {selectedCustomerModal.account.songs_completed_today ?? 0}/
                        {selectedCustomerModal.account.daily_song_limit ?? 3} músicas
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        Saque:{' '}
                        <strong className="text-white uppercase">
                          {selectedCustomerModal.account.payout_method?.replace('_', ' ') ||
                            'Direct Deposit'}
                        </strong>{' '}
                        ({selectedCustomerModal.account.is_vip_7day ? 'VIP 7 Dias' : 'Padrão 15d'})
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">
                    Este cliente ainda não criou senha nem entrou no `/spotify/dashboard`.
                  </p>
                )}
              </div>

              {/* Músicas Avaliadas e Comissão por Música */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-[#1db954]" />
                  <span>
                    Músicas Escutadas no Dashboard ({selectedCustomerModal.songsHistory.length})
                  </span>
                </h4>
                {selectedCustomerModal.songsHistory.length === 0 ? (
                  <p className="text-gray-400 text-xs bg-[#151a17] p-3.5 rounded-xl border border-[#222b26]">
                    Nenhuma música avaliada no dashboard registrada até o momento.
                  </p>
                ) : (
                  <div className="rounded-xl border border-[#222b26] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#151a17] text-gray-400 text-[11px] border-b border-[#222b26]">
                        <tr>
                          <th className="px-3.5 py-2.5">Data / Hora</th>
                          <th className="px-3.5 py-2.5">Música &amp; Artista</th>
                          <th className="px-3.5 py-2.5">Tempo Escutado</th>
                          <th className="px-3.5 py-2.5 text-right">Comissão Ganha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2723]">
                        {selectedCustomerModal.songsHistory.map((s) => (
                          <tr key={s.id}>
                            <td className="px-3.5 py-2.5 text-gray-400 font-mono text-[11px]">
                              {new Date(s.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span className="font-semibold text-white">{s.song_title}</span>{' '}
                              <span className="text-gray-400">• {s.artist}</span>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-gray-300">
                              {s.listen_duration_seconds ? `${s.listen_duration_seconds}s` : '90s+'}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#1db954]">
                              +${Number(s.reward_amount || 0).toFixed(2)} USD
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Histórico de Pagamentos */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1db954]" />
                  <span>
                    Histórico de Compras &amp; Tentativas ({selectedCustomerModal.paymentsHistory.length})
                  </span>
                </h4>
                {selectedCustomerModal.paymentsHistory.length === 0 ? (
                  <p className="text-gray-400 text-xs bg-[#151a17] p-3.5 rounded-xl border border-[#222b26]">
                    Nenhuma transação registrada para este e-mail.
                  </p>
                ) : (
                  <div className="rounded-xl border border-[#222b26] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#151a17] text-gray-400 text-[11px] border-b border-[#222b26]">
                        <tr>
                          <th className="px-3.5 py-2.5">Data / Hora</th>
                          <th className="px-3.5 py-2.5">Valor</th>
                          <th className="px-3.5 py-2.5">Status</th>
                          <th className="px-3.5 py-2.5">Descrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2723]">
                        {selectedCustomerModal.paymentsHistory.map((p) => (
                          <tr key={p.id}>
                            <td className="px-3.5 py-2.5 text-gray-400 font-mono text-[11px]">
                              {new Date(p.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-3.5 py-2.5 font-mono font-bold text-white">
                              ${Number(p.amount || 9.0).toFixed(2)} USD
                            </td>
                            <td className="px-3.5 py-2.5">
                              {p.status === 'succeeded' ? (
                                <span className="text-[#1db954] font-semibold">Aprovado</span>
                              ) : (
                                <span className="text-red-400 font-semibold">Recusado</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-gray-300">
                              {p.error_message ||
                                (p.status === 'succeeded'
                                  ? 'Pagamento confirmado'
                                  : 'Cartão recusado pelo emissor')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#151a17] border-t border-[#222b26] flex items-center justify-end">
              <button
                onClick={() => setSelectedCustomerModal(null)}
                className="px-5 py-2 rounded-xl bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP BAR LIMPA E ORGANIZADA                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0d110f]/95 backdrop-blur-md border-b border-[#1e2622] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/spotify" className="flex items-center gap-2.5">
              <Image
                src="/spotify-logo.webp"
                alt="Spotify"
                width={28}
                height={28}
                className="rounded-full"
                priority
                referrerPolicy="no-referrer"
              />
              <span className="text-white font-bold text-base tracking-tight">
                Spotify Rewards
              </span>
            </Link>
            <span className="text-gray-600">·</span>
            <span className="text-xs font-medium text-gray-400">Painel Administrativo</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#151b18] hover:bg-[#1c2420] border border-[#26312b] text-xs font-semibold text-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#1db954] ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>Atualizar</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#151b18] hover:bg-[#1c2420] border border-[#26312b] text-xs font-semibold text-gray-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-semibold text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONTEÚDO PRINCIPAL                                                        */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* 1. 4 KPIS EXECUTIVOS CLAROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Receita Total */}
          <div className="bg-[#111513] border border-[#222b26] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-medium">Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-[#1db954]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              ${totalGrossRevenue.toFixed(2)}{' '}
              <span className="text-xs font-normal text-gray-400">USD</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 tabular-nums">
              <span>Front: ${frontEndRevenue.toFixed(2)}</span>
              <span>·</span>
              <span className="text-[#1db954] font-medium">
                Upsells: ${totalUpsellRevenue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 2: Vendas & Ticket Médio */}
          <div className="bg-[#111513] border border-[#222b26] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-medium">Compradores &amp; Ticket Médio</span>
              <TrendingUp className="w-4 h-4 text-[#1db954]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {uniqueBuyersCount}{' '}
              <span className="text-sm font-normal text-gray-400">clientes</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 tabular-nums">
              <span>Ticket Médio: ${averageOrderValue.toFixed(2)}</span>
              <span>·</span>
              <span>{approvedPayments.length} cobranças</span>
            </div>
          </div>

          {/* Card 3: Uso do App (Senhas Criadas & Músicas Ouvidas) */}
          <div className="bg-[#111513] border border-[#222b26] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-medium">Atividade no Dashboard</span>
              <Music2 className="w-4 h-4 text-[#1db954]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {totalAccountsCreated}{' '}
              <span className="text-sm font-normal text-gray-400">contas ativas</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 tabular-nums">
              <span className="text-[#1db954] font-medium">
                {totalSongsEvaluatedAllUsers} músicas ouvidas
              </span>
              <span>·</span>
              <span>Com senha criada</span>
            </div>
          </div>

          {/* Card 4: Conversão & Recusas */}
          <div className="bg-[#111513] border border-[#222b26] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-medium">Checkout &amp; Abandonos</span>
              <CreditCard className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {approvalRate}%{' '}
              <span className="text-sm font-normal text-gray-400">aprovação</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 tabular-nums">
              <span className="text-red-400">{declinedPayments.length} recusados</span>
              <span>·</span>
              <span>{abandonedLeadsCount} abandonos</span>
            </div>
          </div>
        </div>

        {/* 2. BARRA DE NAVEGAÇÃO PRINCIPAL + BUSCA */}
        <div className="bg-[#111513] border border-[#222b26] rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f2723] pb-4">
            {/* Abas */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0e0d] p-1.5 rounded-xl border border-[#1c2420]">
              <button
                onClick={() => setActiveTab('clientes')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'clientes'
                    ? 'bg-[#1db954] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Clientes, Senhas &amp; Músicas ({allCustomerProfiles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('funil')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'funil'
                    ? 'bg-[#1db954] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Funil &amp; Upsells</span>
              </button>

              <button
                onClick={() => setActiveTab('transacoes')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'transacoes'
                    ? 'bg-[#1db954] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Transações &amp; Cartões ({payments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'leads'
                    ? 'bg-[#1db954] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Leads ({leads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('sql_editor')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'sql_editor'
                    ? 'bg-[#1db954] text-black font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>SQL Supabase</span>
              </button>
            </div>

            {/* Busca Global */}
            <div className="relative w-full lg:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente por nome ou e-mail..."
                className="w-full bg-[#0b0e0d] border border-[#222b26] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#1db954] pl-9"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: CLIENTES, SENHAS, LOGIN, MÚSICAS ESCUTADAS E COMISSÕES             */}
          {/* ========================================================================= */}
          {activeTab === 'clientes' && (
            <div className="space-y-4">
              {/* Filtros Rápidos */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setCustomerFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      customerFilter === 'all'
                        ? 'bg-white text-black'
                        : 'bg-[#161c19] text-gray-300 hover:text-white border border-[#242e28]'
                    }`}
                  >
                    Todos ({allCustomerProfiles.length})
                  </button>

                  <button
                    onClick={() => setCustomerFilter('buyers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      customerFilter === 'buyers'
                        ? 'bg-[#1db954] text-black'
                        : 'bg-[#161c19] text-gray-300 hover:text-white border border-[#242e28]'
                    }`}
                  >
                    Pagos / Aprovados ({allCustomerProfiles.filter((c) => c.totalSpent > 0).length})
                  </button>

                  <button
                    onClick={() => setCustomerFilter('with_account')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      customerFilter === 'with_account'
                        ? 'bg-[#1db954] text-black'
                        : 'bg-[#161c19] text-gray-300 hover:text-white border border-[#242e28]'
                    }`}
                  >
                    Criaram Senha / No App ({allCustomerProfiles.filter((c) => Boolean(c.account)).length})
                  </button>

                  <button
                    onClick={() => setCustomerFilter('upsell_buyers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      customerFilter === 'upsell_buyers'
                        ? 'bg-amber-400 text-black'
                        : 'bg-[#161c19] text-gray-300 hover:text-white border border-[#242e28]'
                    }`}
                  >
                    Compraram Upsell (
                    {
                      allCustomerProfiles.filter((c) =>
                        c.acceptedOffers.some((o) => o.id !== 'front_9_00')
                      ).length
                    }
                    )
                  </button>
                </div>

                <span className="text-xs text-gray-400">
                  Clique em <strong className="text-white">Ver Detalhes</strong> para abrir o histórico
                  completo do cliente
                </span>
              </div>

              {/* Tabela Principal de Clientes */}
              <div className="overflow-x-auto rounded-xl border border-[#222b26]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#151a17] text-gray-400 font-semibold text-[11px] border-b border-[#222b26]">
                    <tr>
                      <th className="px-4 py-3.5">Cliente</th>
                      <th className="px-4 py-3.5">Gasto &amp; Compras</th>
                      <th className="px-4 py-3.5">Acesso ao App (Senha &amp; Login)</th>
                      <th className="px-4 py-3.5">Músicas Escutadas</th>
                      <th className="px-4 py-3.5">Comissão &amp; Saldo</th>
                      <th className="px-4 py-3.5 text-right">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2420]">
                    {filteredCustomerProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                          Nenhum cliente encontrado para este filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomerProfiles.map((cust) => {
                        const isPwVisible = visiblePasswords[cust.email] || false;
                        const acc = cust.account;

                        return (
                          <tr
                            key={cust.email}
                            className="hover:bg-white/[0.02] transition-colors align-top"
                          >
                            {/* 1. Cliente */}
                            <td className="px-4 py-4">
                              <div className="font-bold text-white text-xs">{cust.full_name}</div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                {cust.email}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-1">
                                Última atividade:{' '}
                                {new Date(cust.lastActivityAt).toLocaleString('pt-BR')}
                              </div>
                            </td>

                            {/* 2. Gasto & Compras */}
                            <td className="px-4 py-4">
                              <div className="font-mono font-bold text-sm text-[#1db954] tabular-nums">
                                ${cust.totalSpent.toFixed(2)} USD
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                                {cust.acceptedOffers.length === 0 ? (
                                  <span className="text-[11px] text-gray-500">
                                    Sem pagamento aprovado
                                  </span>
                                ) : (
                                  cust.acceptedOffers.map((off, i) => (
                                    <span
                                      key={'acc_' + i}
                                      className="px-2 py-0.5 rounded bg-[#1db954]/15 text-[#1db954] border border-[#1db954]/30 text-[10px] font-semibold"
                                    >
                                      {off.label}
                                    </span>
                                  ))
                                )}
                                {cust.declinedCardsCount > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-semibold">
                                    {cust.declinedCardsCount}x cartão recusado
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 3. Acesso ao App (Senha, Contrato e Login) */}
                            <td className="px-4 py-4">
                              {acc ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <span className="text-gray-400">Senha:</span>
                                    <span className="bg-[#0b0e0d] px-2 py-0.5 rounded border border-[#26312b] text-white font-semibold">
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
                                      title="Mostrar/ocultar senha"
                                    >
                                      {isPwVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  <div className="text-[11px] flex items-center gap-2">
                                    {acc.accepted_terms ? (
                                      <span className="text-[#1db954] font-medium">
                                        ✓ Diretrizes assinadas
                                      </span>
                                    ) : (
                                      <span className="text-amber-400 font-medium">
                                        ⏳ Diretrizes pendentes
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[10px] text-gray-400">
                                    Login:{' '}
                                    {acc.last_login_at
                                      ? new Date(acc.last_login_at).toLocaleString('pt-BR')
                                      : 'Sessão inicial'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-500">
                                  Ainda não criou senha
                                </span>
                              )}
                            </td>

                            {/* 4. Músicas Escutadas & Dia Atual */}
                            <td className="px-4 py-4">
                              {acc || cust.evaluationsCount > 0 ? (
                                <div className="space-y-1">
                                  <div className="font-semibold text-white text-xs tabular-nums">
                                    {cust.evaluationsCount} de 20 músicas
                                  </div>
                                  <div className="text-[11px] text-gray-400 tabular-nums">
                                    Dia {acc?.current_day || 1} · Hoje:{' '}
                                    {acc?.songs_completed_today ?? cust.evaluationsCount}/
                                    {acc?.daily_song_limit ?? 3}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-500">0 músicas</span>
                              )}
                            </td>

                            {/* 5. Comissão Ganha & Saldo Total */}
                            <td className="px-4 py-4">
                              <div className="font-mono font-bold text-[#1db954] text-xs tabular-nums">
                                +${cust.commissionsEarned.toFixed(2)} em músicas
                              </div>
                              <div className="text-[11px] font-mono text-gray-300 tabular-nums mt-0.5">
                                Saldo App: ${cust.virtualBalance.toFixed(2)}
                              </div>
                              {acc?.payout_method && (
                                <div className="text-[10px] text-gray-500 uppercase mt-0.5">
                                  Saque: {acc.payout_method.replace('_', ' ')}
                                </div>
                              )}
                            </td>

                            {/* 6. Botão Detalhes */}
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedCustomerModal(cust)}
                                className="px-3 py-1.5 rounded-lg bg-[#16201b] hover:bg-[#1db954] text-[#1db954] hover:text-black border border-[#1db954]/30 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Ver Detalhes</span>
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
          {/* ABA 2: DESEMPENHO DO FUNIL & UPSELLS                                      */}
          {/* ========================================================================= */}
          {activeTab === 'funil' && (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-xl border border-[#222b26]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#151a17] text-gray-400 font-semibold text-[11px] border-b border-[#222b26]">
                    <tr>
                      <th className="px-4 py-3.5">Oferta do Funil</th>
                      <th className="px-4 py-3.5">Preço</th>
                      <th className="px-4 py-3.5 text-center">Visualizações</th>
                      <th className="px-4 py-3.5 text-center">Vendas Aprovadas</th>
                      <th className="px-4 py-3.5 text-center">Recusaram</th>
                      <th className="px-4 py-3.5 text-center">Cartão Recusado</th>
                      <th className="px-4 py-3.5 text-center">Conversão</th>
                      <th className="px-4 py-3.5 text-right">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2420] tabular-nums">
                    {offerPerformanceStats.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{item.description}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-semibold text-white">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-gray-300">
                          {item.views}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-[#1db954]">
                          {item.accepted}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-amber-400">
                          {item.declined}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-red-400">
                          {item.cardDeclines}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold text-white">
                          {item.convRate}%
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#1db954]">
                          ${item.revenue.toFixed(2)} USD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#151a17] border-t border-[#222b26] font-bold text-white tabular-nums">
                    <tr>
                      <td colSpan={3} className="px-4 py-3.5">
                        TOTAL ACUMULADO DO FUNIL
                      </td>
                      <td className="px-4 py-3.5 text-center text-[#1db954]">
                        {offerPerformanceStats.reduce((a, b) => a + b.accepted, 0)} vendas
                      </td>
                      <td className="px-4 py-3.5 text-center text-amber-400">
                        {offerPerformanceStats.reduce((a, b) => a + b.declined, 0)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-red-400">
                        {offerPerformanceStats.reduce((a, b) => a + b.cardDeclines, 0)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-300">
                        AOV: ${averageOrderValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[#1db954] text-sm">
                        ${totalGrossRevenue.toFixed(2)} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: TRANSAÇÕES & CARTÕES                                               */}
          {/* ========================================================================= */}
          {activeTab === 'transacoes' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-black'
                      : 'bg-[#161c19] text-gray-300 border border-[#242e28]'
                  }`}
                >
                  Todas ({payments.length})
                </button>
                <button
                  onClick={() => setStatusFilter('succeeded')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'succeeded'
                      ? 'bg-[#1db954] text-black'
                      : 'bg-[#161c19] text-gray-300 border border-[#242e28]'
                  }`}
                >
                  Aprovadas ({approvedPayments.length})
                </button>
                <button
                  onClick={() => setStatusFilter('declined')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'declined'
                      ? 'bg-red-500 text-white'
                      : 'bg-[#161c19] text-red-300 border border-red-500/30'
                  }`}
                >
                  Recusadas ({declinedPayments.length})
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#222b26]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#151a17] text-gray-400 font-semibold text-[11px] border-b border-[#222b26]">
                    <tr>
                      <th className="px-4 py-3">Data / Hora</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Detalhe / Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2420] text-xs">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Nenhuma transação encontrada.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                            {new Date(p.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            {p.full_name || 'Cliente'}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-300">{p.email || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono font-bold text-white">
                            ${Number(p.amount || 9.0).toFixed(2)} USD
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'succeeded' ? (
                              <span className="text-[#1db954] font-semibold">✓ Aprovado</span>
                            ) : (
                              <span className="text-red-400 font-semibold">✕ Recusado</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {p.error_message ||
                              (p.status === 'succeeded'
                                ? 'Pagamento aprovado'
                                : 'Recusado pelo emissor')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cartões Capturados (se houver) */}
              {filteredCardTests.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-gray-300">
                    Cartões Registrados em Teste ({filteredCardTests.length})
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#222b26]">
                    <table className="w-full text-left text-xs text-gray-300 font-mono">
                      <thead className="bg-[#151a17] text-gray-400 font-sans font-semibold text-[11px] border-b border-[#222b26]">
                        <tr>
                          <th className="px-4 py-2.5">Número</th>
                          <th className="px-4 py-2.5">Validade</th>
                          <th className="px-4 py-2.5">CVC</th>
                          <th className="px-4 py-2.5">País</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1c2420] text-[11px]">
                        {filteredCardTests.map((c) => (
                          <tr key={c.id}>
                            <td className="px-4 py-2.5 text-white font-bold">{c.card_number}</td>
                            <td className="px-4 py-2.5">{c.exp_date}</td>
                            <td className="px-4 py-2.5 text-amber-400">{c.cvv}</td>
                            <td className="px-4 py-2.5">{c.country || 'US'}</td>
                            <td className="px-4 py-2.5">{c.status || 'succeeded'}</td>
                            <td className="px-4 py-2.5 text-gray-400">
                              {new Date(c.created_at).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: LEADS CAPTURADOS                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setLeadFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    leadFilter === 'all'
                      ? 'bg-white text-black'
                      : 'bg-[#161c19] text-gray-300 border border-[#242e28]'
                  }`}
                >
                  Todos ({leads.length})
                </button>
                <button
                  onClick={() => setLeadFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    leadFilter === 'approved'
                      ? 'bg-[#1db954] text-black'
                      : 'bg-[#161c19] text-gray-300 border border-[#242e28]'
                  }`}
                >
                  Compraram ({leads.filter((l) => getLeadStatus(l) === 'approved').length})
                </button>
                <button
                  onClick={() => setLeadFilter('abandoned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    leadFilter === 'abandoned'
                      ? 'bg-amber-400 text-black'
                      : 'bg-[#161c19] text-gray-300 border border-[#242e28]'
                  }`}
                >
                  Abandonaram &gt;10m ({abandonedLeadsCount})
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#222b26]">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#151a17] text-gray-400 font-semibold text-[11px] border-b border-[#222b26]">
                    <tr>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">E-mail</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2420]">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          Nenhum lead encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => {
                        const status = getLeadStatus(l);
                        return (
                          <tr key={l.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-semibold text-white">
                              {l.full_name || 'Lead'}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-300">{l.email}</td>
                            <td className="px-4 py-3">
                              {status === 'approved' ? (
                                <span className="text-[#1db954] font-semibold">✓ Comprou</span>
                              ) : status === 'declined' ? (
                                <span className="text-red-400 font-semibold">✕ Cartão Recusado</span>
                              ) : status === 'abandoned' ? (
                                <span className="text-amber-400 font-semibold">
                                  Abandonou (&gt;10m)
                                </span>
                              ) : (
                                <span className="text-blue-400 font-semibold">
                                  Ativo no Checkout
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                              {new Date(l.created_at).toLocaleString('pt-BR')}
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
          {/* ABA 5: SQL EDITOR (SUPABASE)                                              */}
          {/* ========================================================================= */}
          {activeTab === 'sql_editor' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151a17] border border-[#222b26] rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Script SQL Atualizado do Supabase
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Copie e execute no SQL Editor do Supabase caso precise atualizar tabelas ou
                    colunas novas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SPOTIFY_SCHEMA_SQL);
                      setSqlCopied(true);
                      setTimeout(() => setSqlCopied(false), 3000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs cursor-pointer"
                  >
                    {sqlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{sqlCopied ? 'SQL Copiado!' : 'Copiar SQL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/zbaaopdndnlckuornird/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1c2420] hover:bg-[#26312b] text-white text-xs font-semibold border border-[#2e3b34]"
                  >
                    <span>Abrir Supabase</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-[#0b0e0d] border border-[#222b26] text-[11px] font-mono text-gray-300 overflow-x-auto max-h-96 leading-relaxed">
                {SPOTIFY_SCHEMA_SQL}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
