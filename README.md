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
