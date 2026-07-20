import { test, expect } from "@playwright/test";

test("home shell renders logo, hero, and footer without CSP violations", async ({ page }) => {
  const cspErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().toLowerCase().includes("content security policy")) {
      cspErrors.push(msg.text());
    }
  });

  await page.goto("/");
  await expect(page.getByLabel("BatchKart").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Discover the right batch/i })).toBeVisible();
  await expect(page.getByText(/© 2026 BatchKart/i)).toBeVisible();
  expect(cspErrors, `CSP violations detected:\n${cspErrors.join("\n")}`).toHaveLength(0);
});

test("home response carries a Content-Security-Policy", async ({ request }) => {
  const res = await request.get("/");
  const csp = res.headers()["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
});
