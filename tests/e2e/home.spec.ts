import { test, expect } from "@playwright/test";

test("home shell renders logo, hero, and footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("BatchKart").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Discover the right batch/i })).toBeVisible();
  await expect(page.getByText(/© 2026 BatchKart/i)).toBeVisible();
});

test("home response carries a Content-Security-Policy", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
});
