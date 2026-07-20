import { describe, it, expect } from "vitest";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("exposes the product name and domain", () => {
    expect(siteConfig.name).toBe("BatchKart");
    expect(siteConfig.url).toContain("batchkart.com");
  });

  it("defines primary nav links", () => {
    const labels = siteConfig.mainNav.map((l) => l.label);
    expect(labels).toEqual(["Explore Batches", "Coaching", "Exams", "Discounts", "Blog"]);
  });

  it("defines footer quick links and legal links", () => {
    expect(siteConfig.footer.quickLinks.map((l) => l.label)).toContain("All Batches");
    expect(siteConfig.footer.legal.map((l) => l.label)).toContain("Privacy Policy");
  });
});
