// Helper to dispatch Pushcut notifications to iPhone with strict anti-duplicate lock

export const PUSHCUT_APPROVED_URL =
  'https://api.pushcut.io/KFYOIy_Ie4vPlowVi1jh2/notifications/Venda%20Aprovada%20-%20$9,00';

export const PUSHCUT_PENDING_URL =
  'https://api.pushcut.io/KFYOIy_Ie4vPlowVi1jh2/notifications/Venda%20Pendente';

// Global server-side deduplication cache (prevents Browser + Webhook from firing twice)
const globalForPushcut = globalThis as unknown as {
  __pushcutRecentLock?: Map<string, number>;
};

if (!globalForPushcut.__pushcutRecentLock) {
  globalForPushcut.__pushcutRecentLock = new Map<string, number>();
}

const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function sendPushcutNotification(
  type: 'approved' | 'pending',
  details?: { name?: string; email?: string; offerId?: string; paymentIntentId?: string }
) {
  const lockMap = globalForPushcut.__pushcutRecentLock!;
  const now = Date.now();

  // Clean expired locks
  for (const [key, ts] of lockMap.entries()) {
    if (now - ts > DEDUP_WINDOW_MS) {
      lockMap.delete(key);
    }
  }

  const cleanEmail = (details?.email || '').trim().toLowerCase();
  const cleanOffer = (details?.offerId || 'default').trim().toLowerCase();
  const cleanPi = (details?.paymentIntentId || '').trim();

  // Ignore generic placeholder email from webhook if no real email was resolved
  if (type === 'approved' && cleanEmail === 'customer@verified.com') {
    return;
  }

  // Build deduplication keys (by email+type+offer AND by paymentIntentId)
  const emailKey = cleanEmail ? `${type}:email:${cleanEmail}:${cleanOffer}` : '';
  const piKey = cleanPi ? `${type}:pi:${cleanPi}` : '';
  // Global short-window burst lock for approved sales (prevents two simultaneous requests within 8s for same sale)
  const burstKey = `${type}:burst:${cleanEmail || cleanOffer}`;

  if (
    (emailKey && lockMap.has(emailKey)) ||
    (piKey && lockMap.has(piKey)) ||
    (lockMap.has(burstKey) && now - (lockMap.get(burstKey) || 0) < 15000)
  ) {
    return;
  }

  if (emailKey) lockMap.set(emailKey, now);
  if (piKey) lockMap.set(piKey, now);
  lockMap.set(burstKey, now);

  const targetUrl = type === 'approved' ? PUSHCUT_APPROVED_URL : PUSHCUT_PENDING_URL;

  try {
    const payload: Record<string, any> = {};
    if (details?.name || details?.email) {
      payload.text = `${details.name || 'Cliente'} (${details.email || 'Sem e-mail'})`;
    }

    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined,
    });
  } catch (error) {
    console.warn(`[Pushcut] Failed to dispatch ${type} notification:`, error);
  }
}
