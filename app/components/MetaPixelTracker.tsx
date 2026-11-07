'use client';

import { useEffect, useRef } from 'react';

const PIXEL_ID = '1130433272724731';

interface MetaPixelTrackerProps {
  eventName?: string;
  customData?: Record<string, any>;
}

export default function MetaPixelTracker({
  eventName = 'PageView',
  customData,
}: MetaPixelTrackerProps) {
  const hasSentRef = useRef(false);

  useEffect(() => {
    // 1. Initialize client-side Meta Pixel script if not already present
    if (typeof window !== 'undefined') {
      const win = window as any;
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

        win.fbq('init', PIXEL_ID);
      }

      // Fire browser event
      const eventId = 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      if (customData) {
        win.fbq('track', eventName, customData, { eventID: eventId });
      } else {
        win.fbq('track', eventName, {}, { eventID: eventId });
      }

      // 2. Fire Server-Side Conversions API (CAPI) deduplicated via eventId
      if (!hasSentRef.current) {
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
            }),
          }).catch(() => {});
        } catch {}
      }
    }
  }, [eventName, customData]);

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
