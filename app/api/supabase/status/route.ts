import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  try {
    // Ping Supabase to verify connectivity
    const { data, error } = await supabase.from('payments').select('count', { count: 'exact', head: true });

    return NextResponse.json({
      connected: true,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbaaopdndnlckuornird.supabase.co',
      tableStatus: error ? `Notice: Table 'payments' may need creation (${error.message})` : 'Ready',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      error: err.message,
    }, { status: 500 });
  }
}
