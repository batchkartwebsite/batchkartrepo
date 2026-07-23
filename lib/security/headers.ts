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
// request id, etc.), so 'unsafe-inline' is required for scripts or the app never
// hydrates and every form falls back to a native submit. Dev additionally needs
// 'unsafe-eval' for React/Turbopack's refresh + error overlay.
export function buildCspHeader(isDev = false): string {
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' https:`
    : `script-src 'self' 'unsafe-inline' https:`;
  return [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://*.vercel-insights.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join("; ");
}
