export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

// Static CSP: nonce-based strict-dynamic doesn't work with static/ISR pages because
// the nonce baked into HTML at build time can't match the per-request header nonce.
// Next.js App Router injects inline bootstrap/hydration scripts (self.__next_f, the
// request id, etc.) plus next-themes' anti-flicker script, so 'unsafe-inline' is
// required for scripts or the app never hydrates and every form falls back to a
// native submit. Scripts are otherwise same-origin; the only external origin we
// allow is Google Tag Manager (Google Analytics loader). We deliberately do NOT add
// a bare `https:` source — that would let *any* HTTPS host inject a script — so the
// allow-list stays to specific, named origins. Dev additionally needs 'unsafe-eval'
// for React/Turbopack's refresh + error overlay.
//
// Vercel Web Analytics + Speed Insights load from same-origin (`/_vercel/*`), so
// they need no script-src entry.
const GA_SCRIPT = "https://www.googletagmanager.com";

export function buildCspHeader(isDev = false): string {
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${GA_SCRIPT}`
    : `script-src 'self' 'unsafe-inline' ${GA_SCRIPT}`;
  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join("; ");
}
