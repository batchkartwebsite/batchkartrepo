# BatchKart Phase 0 — Foundation & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable, tested Next.js 16 app with the "Growth Emerald" design system, BatchKart logo, marketing nav/footer, Supabase client wiring, validated env, security headers, dark mode, and CI — the foundation every later phase builds on.

**Architecture:** Next.js 16 App Router + TypeScript with a feature-based, **root-level** layout (no `src/` directory — `app/`, `components/`, `lib/`, `config/` live at the project root; the `@/*` alias maps to `./*`). Tailwind CSS v4 (CSS-first tokens) drives the design system via CSS variables + shadcn/ui primitives. Pure logic (env parsing, security headers) lives in small, unit-tested modules; UI is component-tested with Vitest + React Testing Library; a Playwright smoke test covers the rendered shell. Supabase is wired via `@supabase/ssr` but not yet used for data.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, next-themes, Zod, @supabase/ssr, Vitest, React Testing Library, Playwright, GitHub Actions.

**Conventions for every task:** exact paths shown; run commands from the project root (`C:\Users\sagar\OneDrive\Desktop\Websites\BatchKart`) in PowerShell; commit at the end of each task. Follow TDD where behavior exists (write failing test → see it fail → implement → see it pass); use verify-by-running for pure scaffolding/config.

---

## File Structure (created in this phase)

```
BatchKart/                        # root-level App Router (NO src/ directory)
├─ app/
│  ├─ layout.tsx                 # root layout: Inter font, ThemeProvider, header/footer
│  ├─ page.tsx                   # home shell (design-system showcase)
│  └─ globals.css                # Tailwind v4 import + Growth Emerald tokens (light/dark)
├─ components/
│  ├─ ui/                        # shadcn primitives (button, …)
│  ├─ brand/logo.tsx             # Grad Cap logo + wordmark
│  ├─ layout/site-header.tsx     # marketing navbar
│  ├─ layout/site-footer.tsx     # marketing footer
│  └─ theme/
│     ├─ theme-provider.tsx      # next-themes provider
│     └─ theme-toggle.tsx        # light/dark toggle
├─ config/
│  ├─ env.ts                     # Zod-validated environment
│  └─ site.ts                    # nav/footer links, site metadata
├─ lib/
│  ├─ utils.ts                   # cn() (shadcn)
│  ├─ security/headers.ts        # CSP + security header builders
│  └─ supabase/
│     ├─ client.ts               # browser client
│     └─ server.ts               # server client
├─ middleware.ts                 # applies security headers (project root)
├─ tests/e2e/home.spec.ts        # Playwright smoke test
├─ .github/workflows/ci.yml      # lint + typecheck + test + build
├─ vitest.config.ts
├─ vitest.setup.ts
├─ playwright.config.ts
├─ next.config.ts
├─ .env.example
└─ README.md
```

---

## Task 1: Scaffold the Next.js app and initialize git

**Files:**
- Create: entire Next.js scaffold, `.gitignore` (edit)

- [ ] **Step 1: Create the app in the current (non-empty) directory**

The project root already contains `doc.txt` and `docs/`. Scaffold into it with **no `src/` directory** (root-level `app/`):

Run:
```powershell
npx create-next-app@latest . --ts --tailwind --app --no-src-dir --eslint --import-alias "@/*" --use-npm --no-turbopack --yes
```
Notes for this environment:
- `create-next-app` rejects a capitalized folder name (`BatchKart`) as an npm package name. If it errors, scaffold into a temp subdir (e.g. `batchkart-temp` with `--use-npm`), move all files up to the project root, then set `"name": "batchkart"` in `package.json`.
- Preserve `doc.txt`, `docs/`, and `.superpowers/`. If prompted about a non-empty directory, proceed (they are non-conflicting).
Expected: `create-next-app` completes; `package.json`, root-level `app/`, `next.config.ts`, and `tsconfig.json` exist; `tsconfig.json` maps `"@/*": ["./*"]`.

- [ ] **Step 2: Verify the dev server boots**

Run:
```powershell
npm run dev
```
Expected: "Ready in … Local: http://localhost:3000". Open it, confirm the Next.js starter renders, then stop the server (Ctrl+C).

- [ ] **Step 3: Verify a production build passes**

Run:
```powershell
npm run build
```
Expected: "Compiled successfully" with a route table; exit code 0.

- [ ] **Step 4: Initialize git and ignore the brainstorm folder**

Add this line to the end of `.gitignore`:
```
# Superpowers brainstorm mockups
.superpowers/
```

Run:
```powershell
git init
git add -A
git commit -m "chore: scaffold Next.js 16 app with TypeScript and Tailwind"
```
Expected: an initial commit is created.

---

## Task 2: Install project dependencies

**Files:**
- Modify: `package.json` (via installs)

- [ ] **Step 1: Install runtime dependencies**

Run:
```powershell
npm install framer-motion next-themes zod @supabase/supabase-js @supabase/ssr react-hook-form @hookform/resolvers lucide-react class-variance-authority clsx tailwind-merge
```
Expected: packages added to `dependencies`, exit code 0.

- [ ] **Step 2: Install test/dev dependencies**

Run:
```powershell
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test
```
Expected: packages added to `devDependencies`, exit code 0.

- [ ] **Step 3: Commit**

Run:
```powershell
git add package.json package-lock.json
git commit -m "chore: add core, ui, and testing dependencies"
```

---

## Task 3: Configure Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `lib/smoke.test.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Write the Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["{app,components,config,lib}/**/*.test.{ts,tsx}"],
  },
});
```

Create `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Add test scripts**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit",
"test:e2e": "playwright test"
```

- [ ] **Step 3: Write a failing smoke test**

Create `lib/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sum } from "./smoke";

describe("test harness", () => {
  it("runs and imports app modules", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run:
```powershell
npm test
```
Expected: FAIL — cannot find module `./smoke` (or `sum` is not exported).

- [ ] **Step 5: Create the module to make it pass**

Create `lib/smoke.ts`:
```ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

- [ ] **Step 6: Run it to verify it passes**

Run:
```powershell
npm test
```
Expected: PASS — 1 passed.

- [ ] **Step 7: Commit**

Run:
```powershell
git add vitest.config.ts vitest.setup.ts lib/smoke.ts lib/smoke.test.ts package.json
git commit -m "test: configure Vitest with React Testing Library"
```

---

## Task 4: Growth Emerald design tokens (Tailwind v4, light + dark)

**Files:**
- Modify: `app/globals.css`
- Test: `app/tokens.test.ts`

- [ ] **Step 1: Write a failing test asserting tokens are declared**

Create `app/tokens.test.ts`:
```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```powershell
npm test app/tokens.test.ts
```
Expected: FAIL — the default scaffold `globals.css` has no `#059669`.

- [ ] **Step 3: Replace globals.css with the Growth Emerald token set**

Replace the entire contents of `app/globals.css`:
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.75rem;

  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;

  --primary: #059669;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f8fafc;
  --muted-foreground: #64748b;
  --accent: #ecfdf5;
  --accent-foreground: #047857;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --warning: #f59e0b;
  --success: #10b981;

  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #10b981;
}

.dark {
  --background: #0b1220;
  --foreground: #f1f5f9;
  --card: #0f172a;
  --card-foreground: #f1f5f9;
  --popover: #0f172a;
  --popover-foreground: #f1f5f9;

  --primary: #10b981;
  --primary-foreground: #052e2b;
  --secondary: #1e293b;
  --secondary-foreground: #f1f5f9;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #064e3b;
  --accent-foreground: #d1fae5;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --warning: #f59e0b;
  --success: #10b981;

  --border: #1e293b;
  --input: #1e293b;
  --ring: #10b981;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: Run the token test to verify it passes**

Run:
```powershell
npm test app/tokens.test.ts
```
Expected: PASS — 3 passed.

- [ ] **Step 5: Verify the build still compiles the CSS**

Run:
```powershell
npm run build
```
Expected: "Compiled successfully".

- [ ] **Step 6: Commit**

Run:
```powershell
git add app/globals.css app/tokens.test.ts
git commit -m "feat: add Growth Emerald design tokens with dark mode"
```

---

## Task 5: Initialize shadcn/ui and add the Button primitive

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`
- Test: `components/ui/button.test.tsx`

- [ ] **Step 1: Initialize shadcn (non-destructive to our tokens)**

Run:
```powershell
npx shadcn@latest init -d
```
Accept defaults. This creates `components.json` and `lib/utils.ts` (exporting `cn`). If it prompts to overwrite `globals.css`, choose **No** — our tokens stay.

- [ ] **Step 2: Add the Button component**

Run:
```powershell
npx shadcn@latest add button
```
Expected: `components/ui/button.tsx` created.

- [ ] **Step 3: Write a failing test for the Button**

Create `components/ui/button.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Request Discount</Button>);
    expect(screen.getByRole("button", { name: "Request Discount" })).toBeInTheDocument();
  });

  it("applies the primary background token by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("bg-primary");
  });
});
```

- [ ] **Step 4: Run it to verify it passes**

The generated Button already uses `bg-primary` for its default variant, so this test documents and locks that behavior.

Run:
```powershell
npm test components/ui/button.test.tsx
```
Expected: PASS — 2 passed. (If the default variant class differs, update the assertion to the actual primary class emitted by the generated component, then re-run.)

- [ ] **Step 5: Commit**

Run:
```powershell
git add components.json lib/utils.ts components/ui/button.tsx components/ui/button.test.tsx
git commit -m "feat: add shadcn/ui and emerald Button primitive"
```

---

## Task 6: BatchKart logo component (Grad Cap)

**Files:**
- Create: `components/brand/logo.tsx`
- Test: `components/brand/logo.test.tsx`

- [ ] **Step 1: Write a failing test**

Create `components/brand/logo.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the BatchKart wordmark as one accessible label", () => {
    render(<Logo />);
    expect(screen.getByLabelText("BatchKart")).toBeInTheDocument();
  });

  it("can hide the wordmark for icon-only use", () => {
    render(<Logo showWordmark={false} />);
    expect(screen.queryByText(/Batch/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```powershell
npm test components/brand/logo.test.tsx
```
Expected: FAIL — cannot find module `./logo`.

- [ ] **Step 3: Implement the Logo**

Create `components/brand/logo.tsx`:
```tsx
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-lg font-extrabold tracking-tight", className)}
      aria-label="BatchKart"
    >
      <svg viewBox="0 0 48 48" className="h-7 w-7 shrink-0" role="img" aria-hidden="true">
        <rect width="48" height="48" rx="13" fill="#059669" />
        <path d="M24 14 L37 20 L24 26 L11 20 Z" fill="#fff" />
        <path
          d="M17 22.5 V29 c0 2.2 3.1 4 7 4 s7 -1.8 7 -4 v-6.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M37 20 v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="37" cy="27.5" r="1.8" fill="#fff" />
      </svg>
      {showWordmark && (
        <span aria-hidden="true">
          Batch<span className="text-primary">Kart</span>
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run:
```powershell
npm test components/brand/logo.test.tsx
```
Expected: PASS — 2 passed.

- [ ] **Step 5: Commit**

Run:
```powershell
git add components/brand/logo.tsx components/brand/logo.test.tsx
git commit -m "feat: add Grad Cap logo component"
```

---

## Task 7: Site config (nav + footer links)

**Files:**
- Create: `config/site.ts`
- Test: `config/site.test.ts`

- [ ] **Step 1: Write a failing test**

Create `config/site.test.ts`:
```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```powershell
npm test config/site.test.ts
```
Expected: FAIL — cannot find module `./site`.

- [ ] **Step 3: Implement the site config**

Create `config/site.ts`:
```ts
export type NavLink = { label: string; href: string };

export const siteConfig = {
  name: "BatchKart",
  url: "https://batchkart.com",
  description:
    "India's most trusted platform for finding and comparing coaching batches. We connect ambitious students with the best educators.",
  mainNav: [
    { label: "Explore Batches", href: "/batches" },
    { label: "Coaching", href: "/coaching" },
    { label: "Exams", href: "/exams" },
    { label: "Discounts", href: "/discounts" },
    { label: "Blog", href: "/blog" },
  ] satisfies NavLink[],
  footer: {
    quickLinks: [
      { label: "All Batches", href: "/batches" },
      { label: "About Us", href: "/about" },
      { label: "Contact Support", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ] satisfies NavLink[],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ] satisfies NavLink[],
  },
} as const;
```

- [ ] **Step 4: Run it to verify it passes**

Run:
```powershell
npm test config/site.test.ts
```
Expected: PASS — 3 passed.

- [ ] **Step 5: Commit**

Run:
```powershell
git add config/site.ts config/site.test.ts
git commit -m "feat: add site config for nav and footer"
```

---

## Task 8: Theme provider + dark-mode toggle

**Files:**
- Create: `components/theme/theme-provider.tsx`, `components/theme/theme-toggle.tsx`
- Test: `components/theme/theme-toggle.test.tsx`

- [ ] **Step 1: Create the theme provider**

Create `components/theme/theme-provider.tsx`:
```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

- [ ] **Step 2: Write a failing test for the toggle**

Create `components/theme/theme-toggle.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  it("renders an accessible toggle button", () => {
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run:
```powershell
npm test components/theme/theme-toggle.test.tsx
```
Expected: FAIL — cannot find module `./theme-toggle`.

- [ ] **Step 4: Implement the toggle**

Create `components/theme/theme-toggle.tsx`:
```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run:
```powershell
npm test components/theme/theme-toggle.test.tsx
```
Expected: PASS — 1 passed.

- [ ] **Step 6: Commit**

Run:
```powershell
git add components/theme
git commit -m "feat: add theme provider and dark-mode toggle"
```

---

## Task 9: Marketing header and footer

**Files:**
- Create: `components/layout/site-header.tsx`, `components/layout/site-footer.tsx`
- Test: `components/layout/site-header.test.tsx`, `components/layout/site-footer.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `components/layout/site-header.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the logo and primary nav", () => {
    render(
      <ThemeProvider attribute="class">
        <SiteHeader />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("BatchKart")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Batches" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });
});
```

Create `components/layout/site-footer.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the brand description and legal links", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/most trusted platform/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/© 2026 BatchKart/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run:
```powershell
npm test components/layout
```
Expected: FAIL — cannot find modules `./site-header`, `./site-footer`.

- [ ] **Step 3: Implement the header**

Create `components/layout/site-header.tsx`:
```tsx
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6 lg:px-[60px]">
        <Link href="/" aria-label="BatchKart home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-secondary-foreground md:flex">
          {siteConfig.mainNav.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/requirements/new">Post a Requirement</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Implement the footer**

Create `components/layout/site-footer.tsx`:
```tsx
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#0b1220] text-slate-400">
      <div className="mx-auto max-w-[1160px] px-6 py-14 lg:px-[60px]">
        <div className="grid gap-10 md:grid-cols-[2.2fr_1fr_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{siteConfig.description}</p>
          </div>
          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Legal</h5>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-slate-800 pt-5 text-xs">
          <span>© 2026 BatchKart. All rights reserved.</span>
          <span>Made in India 🇮🇳 · batchkart.com</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run:
```powershell
npm test components/layout
```
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

Run:
```powershell
git add components/layout
git commit -m "feat: add marketing header and footer"
```

---

## Task 10: Root layout with Inter font, theme provider, header/footer

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the root layout**

Replace the entire contents of `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Discover & compare coaching batches`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

Run:
```powershell
npm run build
```
Expected: "Compiled successfully".

- [ ] **Step 3: Commit**

Run:
```powershell
git add app/layout.tsx
git commit -m "feat: wire root layout with Inter, theming, header and footer"
```

---

## Task 11: Home shell page (design-system showcase)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the home page**

Replace the entire contents of `app/page.tsx`:
```tsx
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#f7fee7] dark:from-background dark:via-background dark:to-background">
      <section className="mx-auto max-w-[1160px] px-6 py-24 text-center lg:px-[60px]">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
          🎓 India&apos;s largest coaching batch marketplace
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Discover the right batch.{" "}
          <span className="text-primary">Pay less, prepare smarter.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Compare coaching institutes across India, unlock exclusive discounts, and get matched to
          batches that fit your exam, city, and budget.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg">Explore batches</Button>
          <Button size="lg" variant="outline">
            Post a requirement
          </Button>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders in the browser**

Run:
```powershell
npm run dev
```
Open http://localhost:3000. Confirm: emerald hero, "BatchKart" wordmark (single word) in the header, footer with the three columns, and the theme toggle switches light/dark. Stop the server.

- [ ] **Step 3: Commit**

Run:
```powershell
git add app/page.tsx
git commit -m "feat: add home shell with design-system hero"
```

---

## Task 12: Environment validation with Zod

**Files:**
- Create: `config/env.ts`, `.env.example`, `.env.local`
- Test: `config/env.test.ts`

- [ ] **Step 1: Write a failing test**

Create `config/env.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts a valid environment", () => {
    const env = parseEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://abc.supabase.co");
  });

  it("throws when the URL is missing or invalid", () => {
    expect(() =>
      parseEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "x" }),
    ).toThrow(/Invalid environment/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```powershell
npm test config/env.test.ts
```
Expected: FAIL — cannot find module `./env`.

- [ ] **Step 3: Implement env parsing**

Create `config/env.ts`:
```ts
import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const env = parseEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

- [ ] **Step 4: Create env files**

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Create `.env.local` (git-ignored by the Next scaffold) with placeholder values so local build/dev works:
```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
```

- [ ] **Step 5: Run the test to verify it passes**

Run:
```powershell
npm test config/env.test.ts
```
Expected: PASS — 2 passed.

- [ ] **Step 6: Commit**

Run:
```powershell
git add config/env.ts config/env.test.ts .env.example
git commit -m "feat: add Zod-validated environment config"
```

---

## Task 13: Supabase client factories

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Create the browser client**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
```

- [ ] **Step 2: Create the server client**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/config/env";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // called from a Server Component — safe to ignore when middleware refreshes sessions
        }
      },
    },
  });
}
```

- [ ] **Step 3: Verify typecheck and build pass**

Run:
```powershell
npm run typecheck
npm run build
```
Expected: both exit 0, "Compiled successfully".

- [ ] **Step 4: Commit**

Run:
```powershell
git add lib/supabase
git commit -m "feat: add Supabase browser and server client factories"
```

---

## Task 14: Security headers + CSP in middleware

**Files:**
- Create: `lib/security/headers.ts`, `middleware.ts`
- Test: `lib/security/headers.test.ts`

- [ ] **Step 1: Write a failing test for the header builders**

Create `lib/security/headers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildCspHeader, securityHeaders } from "./headers";

describe("security headers", () => {
  it("builds a CSP that locks defaults to self and blocks framing", () => {
    const csp = buildCspHeader("test-nonce");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("'nonce-test-nonce'");
  });

  it("exposes the standard hardening headers", () => {
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff");
    expect(securityHeaders["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(securityHeaders["X-Frame-Options"]).toBe("DENY");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```powershell
npm test lib/security/headers.test.ts
```
Expected: FAIL — cannot find module `./headers`.

- [ ] **Step 3: Implement the header builders**

Create `lib/security/headers.ts`:
```ts
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

export function buildCspHeader(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://*.supabase.co https://*.vercel-insights.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join("; ");
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```powershell
npm test lib/security/headers.test.ts
```
Expected: PASS — 2 passed.

- [ ] **Step 5: Create the middleware**

Create `middleware.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { buildCspHeader, securityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", buildCspHeader(nonce));

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // all paths except static assets and image optimization
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 6: Verify headers are served**

Run:
```powershell
npm run dev
```
In a second terminal:
```powershell
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).Headers["Content-Security-Policy"]
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).Headers["X-Frame-Options"]
```
Expected: the CSP string prints (containing `default-src 'self'`) and `DENY` prints. Stop the server.

- [ ] **Step 7: Commit**

Run:
```powershell
git add lib/security/headers.ts lib/security/headers.test.ts middleware.ts
git commit -m "feat: add CSP and security headers via middleware"
```

---

## Task 15: Playwright smoke test for the rendered shell

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/home.spec.ts`

- [ ] **Step 1: Install the Playwright browser**

Run:
```powershell
npx playwright install chromium
```
Expected: Chromium downloaded.

- [ ] **Step 2: Create the Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Write the smoke test**

Create `tests/e2e/home.spec.ts`:
```ts
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
```

- [ ] **Step 4: Run the smoke test**

Run:
```powershell
npm run test:e2e
```
Expected: PASS — 2 passed. (Playwright starts the dev server automatically.)

- [ ] **Step 5: Commit**

Run:
```powershell
git add playwright.config.ts tests/e2e/home.spec.ts
git commit -m "test: add Playwright smoke test for the app shell"
```

---

## Task 16: Continuous integration (GitHub Actions)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Verify the same commands pass locally**

Run:
```powershell
npm run lint
npm run typecheck
npm test
npm run build
```
Expected: all exit 0. Fix any lint/type errors surfaced before proceeding.

- [ ] **Step 3: Commit**

Run:
```powershell
git add .github/workflows/ci.yml
git commit -m "ci: add lint, typecheck, test, and build workflow"
```

---

## Task 17: README and setup docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the README**

Replace the entire contents of `README.md`:
```markdown
# BatchKart

India's coaching batch discovery marketplace. Discover batches, compare institutes, unlock
discounts, and connect with coaching.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase · Vitest · Playwright.

## Getting started
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. `npm run dev` → http://localhost:3000

## Scripts
- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — unit/component tests (Vitest)
- `npm run test:e2e` — end-to-end smoke tests (Playwright)
- `npm run typecheck` — TypeScript, no emit
- `npm run lint` — ESLint

## Structure
See `docs/superpowers/specs/2026-07-20-batchkart-design.md` for the full design and
`docs/superpowers/plans/` for phase plans. Phase 0 (this) is the foundation; Phase 1 adds the
database and super admin dashboard.
```

- [ ] **Step 2: Commit**

Run:
```powershell
git add README.md
git commit -m "docs: add project README and setup guide"
```

---

## Self-Review (completed by plan author)

**Spec coverage (Phase 0 scope):**
- Design system tokens + dark mode → Task 4. Typography (Inter) → Task 10. Radius/shadows/tokens → Task 4. ✓
- Logo (Grad Cap, single-word wordmark) → Task 6. ✓
- Nav + footer with exact copy → Tasks 7, 9. ✓
- Tech stack (Next 16, TS, Tailwind, shadcn, Framer Motion dep, RHF/Zod deps) → Tasks 1, 2, 5. ✓
- Env validation, no client-side secrets, env var validation → Task 12. ✓
- Supabase client wiring → Task 13. ✓
- Security headers + CSP → Task 14. ✓
- Performance/SEO groundwork (metadataBase, font, RSC default) → Task 10; deeper SEO + Lighthouse belong to Phase 2. ✓ (intentionally deferred)
- CI/CD, testing pyramid (unit + component + e2e) → Tasks 3, 15, 16. ✓
- Homepage full build, database, admin dashboard, auth → **out of scope for P0**, covered by later phase plans. ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete, runnable content.

**Type/name consistency:** `parseEnv`/`envSchema`/`Env`/`env` (Task 12) reused in Tasks 13. `buildCspHeader`/`securityHeaders` (Task 14) match the middleware import. `Logo`, `SiteHeader`, `SiteFooter`, `ThemeProvider`, `ThemeToggle`, `siteConfig` names are consistent across tasks. `cn` from `@/lib/utils` (shadcn, Task 5) used by Logo (Task 6).

**Note for executor:** If `create-next-app` scaffolds Tailwind v3 instead of v4 in your environment, the token file in Task 4 uses v4 syntax (`@import "tailwindcss"`, `@theme inline`). In that case, keep the CSS-variable blocks and instead map colors in `tailwind.config.ts` `theme.extend.colors` pointing at the same `var(--…)` values. Everything else is version-agnostic.
