import { NextRequest, NextResponse } from 'next/server';

const PIXEL_ID = process.env.FB_PIXEL_ID || '1130433272724731';
const ACCESS_TOKEN =
  process.env.FB_ACCESS_TOKEN ||
  'EAFtzlL3kRtwBS6iKee6lBshC2v8VDcKe7jvU2N5sJJ8bzoqM5hcZApptlUkOY633AmE3KZAdVdf0Ag6I6aZBzkDYflTdJ9shzEqKNGW5a6KPoiHVCfmqgyWuW5vHZALUsfy9RcBgtPsQxuLD6vdgisuRZAeeGdhODN4BFJZA3gpWwJUvkcgFoTcDKTuKO4wwZDZD';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_source_url, event_id, custom_data } = body;

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const payload = {
      data: [
        {
          event_name: event_name || 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: event_source_url || 'https://nextofferspot.com/spotify',
          event_id: event_id || undefined,
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: custom_data || undefined,
        },
      ],
    };

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const fbRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await fbRes.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch CAPI event' },
      { status: 500 }
    );
  }
}
