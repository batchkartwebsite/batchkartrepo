import { siteConfig } from "@/config/site";

/**
 * Shared 1200×630 social card, rendered to PNG by `next/og` (satori) at build
 * time. Satori only supports flexbox + a subset of CSS — no grid, and every
 * element with more than one child must set `display: flex`.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

// The BatchKart mark (graduation cap) as an inline SVG, embedded as a data URI
// and drawn via <img> — the most reliable way to place vector art in satori.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="120" height="120"><rect width="48" height="48" rx="13" fill="#059669"/><path d="M24 14 L37 20 L24 26 L11 20 Z" fill="#fff"/><path d="M17 22.5 V29 c0 2.2 3.1 4 7 4 s7 -1.8 7 -4 v-6.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M37 20 v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="37" cy="27.5" r="1.8" fill="#fff"/></svg>`;
const LOGO_URI = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

export function OgCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        padding: 80,
        backgroundColor: "#0b1220",
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Brand glows */}
      <div
        style={{
          position: "absolute",
          top: -180,
          left: -140,
          width: 640,
          height: 640,
          backgroundImage:
            "radial-gradient(circle at center, rgba(16,185,129,0.40), rgba(16,185,129,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          right: -160,
          width: 620,
          height: 620,
          backgroundImage:
            "radial-gradient(circle at center, rgba(245,158,11,0.24), rgba(245,158,11,0) 62%)",
        }}
      />

      {/* Top: logo + wordmark */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URI} width={100} height={100} alt="" />
        <div style={{ display: "flex", marginLeft: 22, fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
          Batch<span style={{ color: "#34d399" }}>Kart</span>
        </div>
      </div>

      {/* Middle: headline */}
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2.5,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "#94a3b8" }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom: url + trust pill */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: "#cbd5e1" }}>
          {siteConfig.url.replace("https://", "")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 22px",
            borderRadius: 9999,
            border: "1px solid rgba(148,163,184,0.35)",
            fontSize: 22,
            color: "#e2e8f0",
          }}
        >
          Verified institutes · Honest fees
        </div>
      </div>
    </div>
  );
}
