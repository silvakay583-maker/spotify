import { NextRequest, NextResponse } from 'next/server';
import { sendPushcutNotification } from '@/lib/pushcut';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, name, email } = body;

    if (type !== 'approved' && type !== 'pending') {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    await sendPushcutNotification(type, { name, email });
    return NextResponse.json({ success: true, type });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch Pushcut notification' },
      { status: 500 }
    );
  }
}
