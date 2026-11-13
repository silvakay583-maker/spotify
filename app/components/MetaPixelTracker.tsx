'use client';

import { useEffect, useRef } from 'react';

const META_PIXEL_ID = '1130433272724731';
const TIKTOK_PIXEL_IDS = ['DBRAD8BC77U7CBT5UTL0', 'DBRLF1RC77U859QPQE0G'];

export interface PixelEventCustomData {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  [key: string]: any;
}

export interface PixelEventUserData {
  email?: string;
  full_name?: string;
  [key: string]: any;
}

interface MetaPixelTrackerProps {
  eventName?: string;
  customData?: PixelEventCustomData;
  userData?: PixelEventUserData;
}

/**
 * Ensures Meta Pixel and both TikTok Pixels (DBRAD8BC77U7CBT5UTL0 & DBRLF1RC77U859QPQE0G) are initialized on window.
 */
export function ensurePixelsInitialized(resolvedEmail?: string, resolvedName?: string) {
  if (typeof window === 'undefined') return;
  const win = window as any;

  // 1. Initialize Meta Pixel if not already present
  if (!win.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    const initData: Record<string, any> = {};
    if (resolvedEmail) initData.em = resolvedEmail.toLowerCase().trim();
    if (resolvedName) initData.fn = resolvedName.trim().split(' ')[0].toLowerCase();

    win.fbq('init', META_PIXEL_ID, Object.keys(initData).length > 0 ? initData : undefined);
  }

  // 2. Initialize TikTok Pixels (DBRAD8BC77U7CBT5UTL0 & DBRLF1RC77U859QPQE0G) if not already present
  if (!win.ttq) {
    (function (w: any, d: any, t: string) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
        'holdConsent',
        'revokeConsent',
        'grantConsent',
      ];
      ttq.setAndDefer = function (tObj: any, eMethod: string) {
        tObj[eMethod] = function () {
          tObj.push([eMethod].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (tId: string) {
        const eArr = ttq._i[tId] || [];
        for (let n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(eArr, ttq.methods[n]);
        }
        return eArr;
      };
      ttq.load = function (eId: string, nOpts?: any) {
        const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[eId] = [];
        ttq._i[eId]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[eId] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[eId] = nOpts || {};
        const nScript = d.createElement('script');
        nScript.type = 'text/javascript';
        nScript.async = !0;
        nScript.src = r + '?sdkid=' + eId + '&lib=' + t;
        const firstScript = d.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(nScript, firstScript);
        } else {
          d.head.appendChild(nScript);
        }
      };

      TIKTOK_PIXEL_IDS.forEach((pixelId) => {
        ttq.load(pixelId);
      });
      ttq.page();
    })(window, document, 'ttq');
  } else if (win.ttq && win.ttq.load) {
    // Ensure both pixels are registered even if window.ttq was initialized earlier
    TIKTOK_PIXEL_IDS.forEach((pixelId) => {
      if (!win.ttq._i || !win.ttq._i[pixelId]) {
        try {
          win.ttq.load(pixelId);
        } catch {}
      }
    });
  }

  // Advanced Matching on TikTok Pixel when user email is available
  if (win.ttq && resolvedEmail && resolvedEmail.includes('@') && !resolvedEmail.endsWith('@spotify.lead')) {
    try {
      win.ttq.identify({
        email: resolvedEmail.toLowerCase().trim(),
      });
    } catch {}
  }
}

/**
 * Fires an event on TikTok Pixel + Meta Pixel + Server-Side CAPI with strict anti-duplicate protection.
 */
export function trackFunnelPixelEvent(
  eventName: string,
  customData?: PixelEventCustomData,
  userData?: PixelEventUserData
) {
  if (typeof window === 'undefined') return;
  const win = window as any;

  const resolvedEmail =
    userData?.email ||
    userData?.em ||
    sessionStorage.getItem('spotify_listener_email') ||
    localStorage.getItem('spotify_listener_email') ||
    undefined;

  const resolvedName =
    userData?.full_name ||
    userData?.name ||
    sessionStorage.getItem('spotify_listener_name') ||
    localStorage.getItem('spotify_listener_name') ||
    undefined;

  ensurePixelsInitialized(resolvedEmail, resolvedName);

  const valueNum =
    typeof customData?.value === 'number'
      ? customData.value
      : parseFloat(String(customData?.value || '0')) || 0;
  const currency = (customData?.currency || 'USD').toUpperCase();
  const contentId = customData?.content_id || customData?.offer_id || 'front_9_00';
  const contentName = customData?.content_name || 'Anti-Spam Security Pass';
  const cleanEmailKey = (resolvedEmail || 'guest').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const isPurchaseEvent = eventName === 'Purchase' || eventName === 'CompletePayment';

  // STRICT ANTI-DUPLICATE LOCK FOR PURCHASES & CHECKOUTS
  if (isPurchaseEvent) {
    const lockKeyId = `pixel_purchase_fired_${contentId}`;
    const lockKeyName = `pixel_purchase_fired_${contentName}`;
    const lockKeyTimestamp = `pixel_purchase_ts_${contentId}_${cleanEmailKey}`;
    const lastFiredTs = Number(localStorage.getItem(lockKeyTimestamp) || '0');
    const now = Date.now();

    if (
      sessionStorage.getItem(lockKeyId) === 'true' ||
      sessionStorage.getItem(lockKeyName) === 'true' ||
      (lastFiredTs > 0 && now - lastFiredTs < 10 * 60 * 1000)
    ) {
      return; // Already tracked this purchase — never fire a duplicate!
    }

    sessionStorage.setItem(lockKeyId, 'true');
    sessionStorage.setItem(lockKeyName, 'true');
    localStorage.setItem(lockKeyTimestamp, String(now));
  } else if (eventName === 'InitiateCheckout') {
    const checkoutLockKey = `pixel_checkout_fired_${contentId}`;
    if (sessionStorage.getItem(checkoutLockKey) === 'true') {
      return;
    }
    sessionStorage.setItem(checkoutLockKey, 'true');
  }

  // Deterministic eventId for Purchase so Meta Browser Pixel & Server CAPI deduplicate 100% into 1 single event
  const timeBucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const eventId = isPurchaseEvent
    ? `pur_${contentId}_${cleanEmailKey}_${timeBucket}`
    : `ev_${eventName}_${contentId}_${Date.now()}`;

  const normalizedCustomData = {
    content_ids: [contentId],
    content_id: contentId,
    content_name: contentName,
    content_type: customData?.content_type || 'product',
    value: valueNum,
    currency,
    num_items: customData?.num_items || 1,
  };

  // 1. Fire Meta Pixel (Browser) with exact eventID for CAPI deduplication
  if (win.fbq) {
    if (eventName === 'PageView') {
      win.fbq('track', 'PageView', {}, { eventID: eventId });
    } else {
      const fbEventName = isPurchaseEvent ? 'Purchase' : eventName;
      win.fbq('track', fbEventName, normalizedCustomData, { eventID: eventId });
    }
  }

  // 2. Fire TikTok Pixel (DBRAD8BC77U7CBT5UTL0) — Single canonical event per action
  if (win.ttq) {
    const ttPayload: Record<string, any> = {
      content_id: contentId,
      content_type: customData?.content_type || 'product',
      content_name: contentName,
      currency,
      ...(valueNum > 0 ? { value: valueNum, price: valueNum, quantity: 1 } : {}),
      contents: [
        {
          content_id: contentId,
          content_type: customData?.content_type || 'product',
          content_name: contentName,
          quantity: 1,
          ...(valueNum > 0 ? { price: valueNum } : {}),
        },
      ],
    };

    if (eventName === 'PageView') {
      win.ttq.page();
    } else if (eventName === 'ViewContent') {
      win.ttq.track('ViewContent', ttPayload);
    } else if (eventName === 'Lead' || eventName === 'CompleteRegistration') {
      win.ttq.track('CompleteRegistration', ttPayload);
    } else if (eventName === 'AddToCart') {
      win.ttq.track('AddToCart', ttPayload);
    } else if (eventName === 'InitiateCheckout') {
      win.ttq.track('InitiateCheckout', ttPayload);
    } else if (eventName === 'AddPaymentInfo') {
      win.ttq.track('AddPaymentInfo', ttPayload);
    } else if (isPurchaseEvent) {
      // Fire ONLY CompletePayment (TikTok's official purchase event) so TikTok never double-counts
      win.ttq.track('CompletePayment', ttPayload, { event_id: eventId });
    } else {
      win.ttq.track(eventName, ttPayload);
    }
  }

  // 3. Fire Server-Side Conversions API (CAPI) with the EXACT SAME event_id and custom_data
  try {
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: isPurchaseEvent ? 'Purchase' : eventName,
        event_source_url: window.location.href,
        event_id: eventId,
        custom_data: normalizedCustomData,
        user_data: {
          ...(userData || {}),
          ...(resolvedEmail ? { email: resolvedEmail } : {}),
          ...(resolvedName ? { full_name: resolvedName } : {}),
        },
      }),
    }).catch(() => {});
  } catch {}
}

export default function MetaPixelTracker({
  eventName = 'PageView',
  customData,
  userData,
}: MetaPixelTrackerProps) {
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (hasSentRef.current) return;
      hasSentRef.current = true;

      const resolvedEmail =
        userData?.email ||
        userData?.em ||
        (typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('spotify_listener_email')
          : null) ||
        undefined;

      const resolvedName =
        userData?.full_name ||
        userData?.name ||
        (typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('spotify_listener_name')
          : null) ||
        undefined;

      ensurePixelsInitialized(resolvedEmail, resolvedName);

      if (eventName && eventName !== 'PageView') {
        // Also track PageView first, then the specific event via unified deduplicated helper
        const win = window as any;
        if (win.fbq) win.fbq('track', 'PageView');
        if (win.ttq) win.ttq.page();
        trackFunnelPixelEvent(eventName, customData, userData);
      } else {
        trackFunnelPixelEvent('PageView', customData, userData);
      }
    }
  }, [eventName, customData, userData]);

  return null;
}
