'use client';

import { useEffect, useRef } from 'react';

const PIXEL_ID = '1130433272724731';

interface MetaPixelTrackerProps {
  eventName?: string;
  customData?: Record<string, any>;
  userData?: {
    email?: string;
    full_name?: string;
    [key: string]: any;
  };
}

export default function MetaPixelTracker({
  eventName = 'PageView',
  customData,
  userData,
}: MetaPixelTrackerProps) {
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;

      // Extract resolved user data (props or sessionStorage fallback)
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

      const resolvedUserData = {
        ...(userData || {}),
        ...(resolvedEmail ? { email: resolvedEmail } : {}),
        ...(resolvedName ? { full_name: resolvedName } : {}),
      };

      // 1. Initialize client-side Meta Pixel script if not already present
      if (!win.fbq) {
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
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
        })(
          window,
          document,
          'script',
          'https://connect.facebook.net/en_US/fbevents.js'
        );

        // Advanced Matching on client if email / name present
        const initData: Record<string, any> = {};
        if (resolvedEmail) initData.em = resolvedEmail.toLowerCase().trim();
        if (resolvedName) initData.fn = resolvedName.trim().split(' ')[0].toLowerCase();

        win.fbq('init', PIXEL_ID, Object.keys(initData).length > 0 ? initData : undefined);
      }

      // Always track standard PageView
      win.fbq('track', 'PageView');

      // Shared event ID for deduplication between Pixel & Conversions API
      let eventId = 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      let isAlreadyFired = false;

      if (eventName === 'Purchase') {
        const storedEventId = sessionStorage.getItem('meta_purchase_event_id');
        const alreadyFired = sessionStorage.getItem('meta_purchase_fired');
        if (storedEventId) {
          eventId = storedEventId;
        } else {
          sessionStorage.setItem('meta_purchase_event_id', eventId);
        }
        if (alreadyFired === 'true') {
          isAlreadyFired = true;
        } else {
          sessionStorage.setItem('meta_purchase_fired', 'true');
        }
      } else if (eventName === 'InitiateCheckout') {
        const storedEventId = sessionStorage.getItem('meta_checkout_event_id');
        const alreadyFired = sessionStorage.getItem('meta_checkout_fired');
        if (storedEventId) {
          eventId = storedEventId;
        } else {
          sessionStorage.setItem('meta_checkout_event_id', eventId);
        }
        if (alreadyFired === 'true') {
          isAlreadyFired = true;
        } else {
          sessionStorage.setItem('meta_checkout_fired', 'true');
        }
      }

      // Fire specific custom event (e.g. Purchase, AddPaymentInfo, Lead) if not PageView
      if (eventName && eventName !== 'PageView' && !isAlreadyFired) {
        win.fbq('track', eventName, customData || {}, { eventID: eventId });
      }

      // 2. Fire Server-Side Conversions API (CAPI) deduplicated via eventId
      if (!hasSentRef.current && !isAlreadyFired) {
        hasSentRef.current = true;
        try {
          fetch('/api/capi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_name: eventName,
              event_source_url: window.location.href,
              event_id: eventId,
              custom_data: customData,
              user_data: resolvedUserData,
            }),
          }).catch(() => {});
        } catch {}
      }
    }
  }, [eventName, customData, userData]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=${eventName}&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
