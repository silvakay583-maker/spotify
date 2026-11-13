import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PIXEL_ID = process.env.FB_PIXEL_ID || '1130433272724731';
const ACCESS_TOKEN =
  process.env.FB_ACCESS_TOKEN ||
  'EAFtzlL3kRtwBS6iKee6lBshC2v8VDcKe7jvU2N5sJJ8bzoqM5hcZApptlUkOY633AmE3KZAdVdf0Ag6I6aZBzkDYflTdJ9shzEqKNGW5a6KPoiHVCfmqgyWuW5vHZALUsfy9RcBgtPsQxuLD6vdgisuRZAeeGdhODN4BFJZA3gpWwJUvkcgFoTcDKTuKO4wwZDZD';

// Server-side deduplication cache for CAPI event_ids
const globalForCapi = globalThis as unknown as {
  __capiEventLock?: Map<string, number>;
};

if (!globalForCapi.__capiEventLock) {
  globalForCapi.__capiEventLock = new Map<string, number>();
}

function hashData(val: string | undefined): string | undefined {
  if (!val || typeof val !== 'string' || !val.trim()) return undefined;
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_source_url, event_id, custom_data, user_data } = body;

    const lockMap = globalForCapi.__capiEventLock!;
    const now = Date.now();
    for (const [k, ts] of lockMap.entries()) {
      if (now - ts > 15 * 60 * 1000) lockMap.delete(k);
    }

    if (event_id && lockMap.has(event_id)) {
      return NextResponse.json({ success: true, deduplicated: true });
    }
    if (event_id) {
      lockMap.set(event_id, now);
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Extract Meta Click ID (_fbc) and Browser ID (_fbp) from cookies if present
    const cookieHeader = req.headers.get('cookie') || '';
    const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/);
    const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/);
    const fbp = fbpMatch ? fbpMatch[1] : undefined;
    const fbc = fbcMatch ? fbcMatch[1] : undefined;

    // Advanced Matching: hash email and first name per Meta specification
    const rawEmail = user_data?.email || user_data?.em;
    const rawName = user_data?.full_name || user_data?.name;
    const firstName = rawName ? rawName.trim().split(' ')[0] : undefined;

    const hashedEmail = hashData(rawEmail);
    const hashedFirstName = hashData(firstName);

    const payload = {
      data: [
        {
          event_name: event_name || 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: event_source_url || 'https://nextofferspot.com/payment',
          event_id: event_id || undefined,
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            em: hashedEmail ? [hashedEmail] : undefined,
            fn: hashedFirstName ? [hashedFirstName] : undefined,
            fbp: fbp || undefined,
            fbc: fbc || undefined,
          },
          custom_data: custom_data || {
            value: 9.0,
            currency: 'USD',
            content_name: 'Anti-Spam Security Pass',
            content_type: 'product',
          },
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
