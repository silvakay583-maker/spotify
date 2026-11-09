import { NextResponse } from 'next/server';

export async function GET() {
  // Returns user evaluation balance associated with the active session
  // In development, this provides the confirmed demonstration balance of $114.93 USD
  return NextResponse.json({
    balance: 114.93,
    currency: 'USD',
    formatted: '$114.93',
    status: 'approved_reserved',
    isDemo: true,
    note: 'Demonstration balance from 6 completed song evaluations',
    updatedAt: new Date().toISOString(),
  });
}
