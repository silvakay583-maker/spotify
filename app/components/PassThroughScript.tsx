'use client';

import Script from 'next/script';

export default function PassThroughScript() {
  return (
    <Script
      id="param-passthrough"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  var OPEN = '{' + '{';
  var KEYS = ['fbclid','ad_id','adset_id','campaign_id','campaign_name','placement','source'];
  function isMacro(v){ return !v || v.indexOf(OPEN) !== -1 || v.indexOf('%7B%7B') !== -1; }
  function grab(){
    var s = {}, qs = new URLSearchParams(location.search);
    KEYS.forEach(function (k) {
      var v = qs.get(k);
      if (v && !isMacro(v)) sessionStorage.setItem('q_' + k, v);
      var saved = sessionStorage.getItem('q_' + k);
      if (saved && !isMacro(saved)) s[k] = saved;
    });
    return s;
  }
  grab();
  document.addEventListener('click', function (e) {
    var a = e.target.closest && (e.target.closest('a[href*="aff_c"]') || e.target.closest('a[href*="giftclick.org"]') || e.target.closest('a[href*="offer_id"]'));
    if (!a) return;
    var s = grab();
    try {
      var u = new URL(a.href, location.href);
      Object.keys(s).forEach(function (k) { u.searchParams.set(k, s[k]); });
      a.href = u.toString();
    } catch (err) {}
  }, true);
})();
`,
      }}
    />
  );
}
