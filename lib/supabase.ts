import { createClient } from '@supabase/supabase-js';

// Base Supabase URL and anon/publishable key provided by user
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbaaopdndnlckuornird.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SRRnHsdPThAGzWWQgQNkhQ_e-3v6l_v';

// Create Supabase client singleton
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface PaymentRecord {
  id?: string;
  email: string;
  full_name?: string;
  amount: number;
  currency: string;
  stripe_payment_id?: string;
  status: string;
  accumulated_balance?: number;
  country?: string;
  created_at?: string;
}

// Safely records payment data into Supabase (table: 'payments' or fallback logging)
export async function recordPaymentInSupabase(payment: PaymentRecord) {
  try {
    const { data, error } = await supabase.from('payments').insert([
      {
        email: payment.email,
        full_name: payment.full_name || 'Anonymous',
        amount: payment.amount,
        currency: payment.currency,
        stripe_payment_id: payment.stripe_payment_id,
        status: payment.status,
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
    console.warn('Supabase logging fallback:', err.message);
    return { success: false, error: err.message };
  }
}
