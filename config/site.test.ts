import { describe, it, expect } from "vitest";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("exposes the product name and domain", () => {
    expect(siteConfig.name).toBe("BatchKart");
    expect(siteConfig.url).toContain("batchkart.com");
  });

  it("defines primary nav links", () => {
    const labels = siteConfig.mainNav.map((l) => l.label);
    expect(labels).toEqual(["Batches", "Exams", "How it works", "Reviews", "FAQ"]);
  });

  it("defines footer explore and company links", () => {
    expect(siteConfig.footer.explore.map((l) => l.label)).toContain("Browse batches");
    expect(siteConfig.footer.company.map((l) => l.label)).toContain("FAQ");
  });

  it("only links to targets that resolve (page routes or on-page anchors)", () => {
    const all = [
      ...siteConfig.mainNav,
      ...siteConfig.footer.explore,
      ...siteConfig.footer.company,
    ];
    for (const link of all) {
      expect(link.href === "/batches" || link.href.startsWith("/#") || link.href.startsWith("/batches")).toBe(
        true,
      );
    }
  });
});
