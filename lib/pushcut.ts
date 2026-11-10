// Helper to dispatch Pushcut notifications to iPhone

export const PUSHCUT_APPROVED_URL =
  'https://api.pushcut.io/KFYOIy_Ie4vPlowVi1jh2/notifications/Venda%20Aprovada%20-%20$9,00';

export const PUSHCUT_PENDING_URL =
  'https://api.pushcut.io/KFYOIy_Ie4vPlowVi1jh2/notifications/Venda%20Pendente%20-%20$9,00%20%F0%9F%91%80';

export async function sendPushcutNotification(
  type: 'approved' | 'pending',
  details?: { name?: string; email?: string }
) {
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
