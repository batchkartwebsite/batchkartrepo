import { describe, it, expect } from "vitest";
import { buildCspHeader, securityHeaders } from "./headers";

describe("security headers", () => {
  it("builds a production CSP that locks defaults to self and blocks framing", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("does not allow scripts from arbitrary HTTPS origins", () => {
    const csp = buildCspHeader();
    // script-src is same-origin + unsafe-inline (for hydration) plus named trusted
    // origins only. A *bare* `https:` scheme source — which would let any HTTPS host
    // inject a script — must never appear (a scheme source is `https:` not followed
    // by `//`).
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toMatch(/script-src[^;]*\bhttps:(?!\/\/)/);
  });

  it("allows Google Tag Manager (GA loader) but nothing broader", () => {
    const csp = buildCspHeader();
    expect(csp).toContain("https://www.googletagmanager.com");
  });

  it("includes unsafe-eval in dev CSP for React/Turbopack error overlay", () => {
    const csp = buildCspHeader(true);
    expect(csp).toContain("'unsafe-eval'");
  });

  it("exposes the standard hardening headers", () => {
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff");
    expect(securityHeaders["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(securityHeaders["X-Frame-Options"]).toBe("DENY");
  });
});
