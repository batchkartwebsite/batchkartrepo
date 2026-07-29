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
    // script-src must be same-origin only (+ unsafe-inline for hydration); a bare
    // `https:` source would let any HTTPS host inject a script.
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toMatch(/script-src[^;]*\bhttps:/);
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
