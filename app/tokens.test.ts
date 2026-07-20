import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

describe("design tokens", () => {
  it("declares the emerald primary in light mode", () => {
    expect(css).toMatch(/--primary:\s*#059669/);
  });
  it("declares a dark-mode block with a brightened primary", () => {
    expect(css).toMatch(/\.dark\s*\{[\s\S]*--primary:\s*#10b981/);
  });
  it("maps tokens into the Tailwind theme", () => {
    expect(css).toContain("@theme inline");
    expect(css).toContain("--color-primary: var(--primary)");
  });
});
