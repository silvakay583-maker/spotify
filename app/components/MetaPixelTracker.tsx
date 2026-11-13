'use client';

import { useEffect, useRef } from 'react';

const META_PIXEL_ID = '1130433272724731';
const TIKTOK_PIXEL_ID = 'DBRAD8BC77U7CBT5UTL0';

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
 * Ensures both Meta Pixel and TikTok Pixel (DBRAD8BC77U7CBT5UTL0) are initialized on window.
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

  // 2. Initialize TikTok Pixel (DBRAD8BC77U7CBT5UTL0) if not already present
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

      ttq.load(TIKTOK_PIXEL_ID);
      ttq.page();
    })(window, document, 'ttq');
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
 * Fires an event on TikTok Pixel + Meta Pixel + Server-Side CAPI.
 * Can be called imperatively on button clicks, form submissions, and approved purchases.
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

  const eventId = 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  const valueNum =
    typeof customData?.value === 'number'
      ? customData.value
      : parseFloat(String(customData?.value || '0')) || 0;
  const currency = (customData?.currency || 'USD').toUpperCase();
  const contentId = customData?.content_id || customData?.offer_id || 'spotify_rewards_pass';
  const contentName = customData?.content_name || 'Spotify Evaluator Pass';

  // 1. Fire Meta Pixel
  if (win.fbq) {
    if (eventName === 'PageView') {
      win.fbq('track', 'PageView');
    } else {
      win.fbq('track', eventName, customData || {}, { eventID: eventId });
    }
  }

  // 2. Fire TikTok Pixel (DBRAD8BC77U7CBT5UTL0)
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
      win.ttq.track('ViewContent', ttPayload);
    } else if (eventName === 'ViewContent') {
      win.ttq.track('ViewContent', ttPayload);
    } else if (eventName === 'Lead' || eventName === 'CompleteRegistration') {
      win.ttq.track('CompleteRegistration', ttPayload);
      win.ttq.track('SubmitForm', ttPayload);
      win.ttq.track('Lead', ttPayload);
    } else if (eventName === 'AddToCart') {
      win.ttq.track('AddToCart', ttPayload);
    } else if (eventName === 'InitiateCheckout') {
      win.ttq.track('InitiateCheckout', ttPayload);
    } else if (eventName === 'AddPaymentInfo') {
      win.ttq.track('AddPaymentInfo', ttPayload);
    } else if (eventName === 'Purchase' || eventName === 'CompletePayment') {
      // Fire standard TikTok CompletePayment, Purchase, and PlaceAnOrder so all campaign objectives track the sale
      win.ttq.track('CompletePayment', ttPayload);
      win.ttq.track('Purchase', ttPayload);
      win.ttq.track('PlaceAnOrder', ttPayload);
    } else {
      win.ttq.track(eventName, ttPayload);
    }
  }

  // 3. Fire Server-Side Conversions API (CAPI)
  try {
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_source_url: window.location.href,
        event_id: eventId,
        custom_data: customData,
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

      const win = window as any;

      // Always track standard PageView on both Meta and TikTok
      if (win.fbq) {
        win.fbq('track', 'PageView');
      }
      if (win.ttq) {
        win.ttq.page();
      }

      if (hasSentRef.current) return;
      hasSentRef.current = true;

      const offerKey = customData?.content_id || customData?.content_name || 'default';
      let isAlreadyFired = false;

      if (eventName === 'Purchase') {
        const storageKey = `pixel_purchase_fired_${offerKey}`;
        if (sessionStorage.getItem(storageKey) === 'true') {
          isAlreadyFired = true;
        } else {
          sessionStorage.setItem(storageKey, 'true');
        }
      } else if (eventName === 'InitiateCheckout') {
        const storageKey = `pixel_checkout_fired_${offerKey}`;
        if (sessionStorage.getItem(storageKey) === 'true') {
          isAlreadyFired = true;
        } else {
          sessionStorage.setItem(storageKey, 'true');
        }
      }

      if (!isAlreadyFired) {
        if (eventName && eventName !== 'PageView') {
          trackFunnelPixelEvent(eventName, customData, userData);
        } else {
          // For PageView, still fire ViewContent on TikTok and CAPI PageView
          if (win.ttq) {
            win.ttq.track('ViewContent', {
              content_id: customData?.content_id || 'spotify_landing',
              content_type: 'product',
              content_name: customData?.content_name || 'Spotify Evaluator Program',
              value: customData?.value || 9.0,
              currency: customData?.currency || 'USD',
            });
          }
          try {
            fetch('/api/capi', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_name: 'PageView',
                event_source_url: window.location.href,
                event_id: 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
                custom_data: customData,
                user_data: {
                  ...(userData || {}),
                  ...(resolvedEmail ? { email: resolvedEmail } : {}),
                  ...(resolvedName ? { full_name: resolvedName } : {}),
                },
              }),
            }).catch(() => {});
          } catch {}
        }
      }
    }
  }, [eventName, customData, userData]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=${eventName}&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
