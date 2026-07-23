# Phase 1b — Super Admin Dashboard — Build Progress / Handoff

**Spec:** `docs/superpowers/specs/2026-07-23-phase-1b-super-admin-design.md`
**Plan:** `docs/superpowers/plans/2026-07-23-batchkart-phase-1b-super-admin.md`
**Branch:** `phase-1b-super-admin` (local only — NOT pushed, per standing instruction)
**Started / last worked:** 2026-07-23

## How to resume

```powershell
git checkout phase-1b-super-admin
npm run dev                       # http://localhost:3000
```
Then log in at `/admin/login-portal`.

### Admin login (created on the hosted project)
- Email: `admin.rishikesh@batchkart.com`
- Password: `Rishi3425dgt@@`
- PIN: `80032779`

(To create/reset another admin: load `.env.local` into env, then
`npx tsx scripts/create-admin.ts <email> <password> <8-digit-pin>`.)

### Environment (`.env.local`, gitignored)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — hosted project `xmdugrozuftbtonkqtnn`.
- `SUPABASE_SERVICE_ROLE_KEY` — **must stay uncommented/active** (service-role client + PIN verify + bootstrap need it).
- `ADMIN_SESSION_SECRET` — 64-char random (already set). `serverEnv` is lazy, so `next build` works even without these at build time, but they ARE needed at runtime.

## Working workflow preferences (IMPORTANT)
- **Implementation-first, no TDD.** Write feature code only; verify with `npm run typecheck` + `npm run build`; tests are a deferred later pass. (No test files are being written during development.)
- **Build only necessary admin sections** — do NOT auto-build all 18. **Get the user's review before building each section.**

## Status

### ✅ Wave 0 — Foundation (complete, build-verified)
Auth core, shell, CRUD framework, DAL, KPI dashboard. Login works end-to-end (browser-verified: password → PIN → `/admin` dashboard renders).
- `config/env.server.ts` (lazy server env), `lib/supabase/admin.ts` (service-role client)
- `lib/server/`: `pin.ts` (scrypt), `admin-session.ts` (HMAC unlock token, cookie `bk_admin_unlock`), `require-admin.ts`, `audit.ts`, `admin-action.ts`, `resource.ts` (generic CRUD DAL)
- `proxy.ts` — session refresh + `/admin` gate (Next 16 renamed `middleware.ts` → `proxy.ts`; it also carries the security headers)
- `app/(site)/` — marketing chrome moved here so `/admin` has none
- `app/admin/login-portal/` (password→PIN), `app/admin/(panel)/layout.tsx` (guarded shell), `app/admin/(panel)/page.tsx` (KPI dashboard)
- `components/admin/` — `admin-shell/sidebar/topbar`, `data-table`, `filter-bar`, `pagination`, `form-shell` + `fields/*`, `moderation-pill`, `stat-card`, `bulk-action-bar`, `csv-export-button`, `confirm-dialog`, `empty-state`
- `lib/admin/resource-config.ts` (types + `parseListParams`), `lib/admin/nav.ts`
- `scripts/create-admin.ts` (fetch-based bootstrap, Node-20 safe)

### ✅ Resource sections built
- **Categories** (`/admin/categories`) — commit `80d18df`. The reusable single-table template.
- **Cities & States** (`/admin/cities`, tabbed) — commit `2e9ab3f`. Established the **relation-dropdown** pattern (server fetches options → passed as serializable `relationOptions` prop → form/filter inject into the `relation` field).

### ▶ Next (user-approved scope, build in order, review each first)
1. **Coaching** (`coaching_institutes` + nested branches/faculty) — composite; uses relation dropdowns (city).
2. **Batches** (`batches`) — relation dropdowns (coaching, exam); set `autoPublish: true` (table HAS `moderation_status`/`published_at`).
3. **Discounts** + **Discount Requests** (inline approve/reject → `notifications` row).
4. "Important parts" only (user's picks TBD-confirmed): **Media Library**, **Settings + SEO**, **Users** (manage admins / reset PIN). Skipping Blog, Testimonials, Reports, Moderation queue, Analytics for now.

## Resource template — how to add a section (copy Categories/Cities)
Files per section under `app/admin/(panel)/<route>/`: `actions.ts` (bind `createResource/updateResource/deleteResource`), `<name>-form.tsx` (client, imports config), `list-view.tsx` (client, imports config), `page.tsx` (server list), `new/page.tsx`, `[id]/edit/page.tsx`. Config in `lib/admin/resources/<name>.ts`.

### Gotchas to replicate (learned building Categories/Cities)
1. **RSC boundary:** client form/list-view import their config **directly** (it has functions + a Zod schema — not serializable). Server pages pass only serializable data (rows, total, params, relationOptions).
2. Form cast: `resource.form.fields as FieldDef<TableName>[]` (FieldDef is invariant).
3. Nullable FK/relation columns: `z.preprocess((v) => (v === "" ? null : v), z.string().uuid().nullish())` — the relation field submits `""` when empty.
4. Link-as-button: `<Button nativeButton={false} render={<Link href=… />}>` (base-ui, no `asChild`).
5. `autoPublish: true` ONLY when the table has `moderation_status` + `published_at` (coaching_institutes, batches). NOT categories/cities/states.
6. `push()` URL contract must match `parseListParams`: `page` (omit=1), `pageSize` (omit=20), `sort`+`dir` separate, `search`, filters flat; reset page→1 on filter/search change.
7. Server pages `await searchParams`/`params` (Next 16 Promises).
8. **Relation dropdowns:** server page fetches options via `listResource(otherResource,{page:1,pageSize:100,filters:{}})` → `rows.map(r=>({label:r.name,value:r.id}))` → pass `relationOptions={{ <field>: options }}` to the form; the form `useMemo`-injects them into matching fields. `FilterBar` also supports `type:"relation"` with `options`.

## Bugs found & fixed this phase (don't reintroduce)
- **Seed arity bug** (Phase 1a `seed.sql` cities CTE) — fixed earlier.
- **CSP blocked hydration** (`lib/security/headers.ts`): App Router needs `'unsafe-inline'` in `script-src` or React never hydrates and forms do native GET submits. Fixed (`e3e292a`).
- **Unlock cookie `secure:true` on http localhost**: now `secure` only in production (`e3e292a`).
- **Node 20 + `@supabase/supabase-js`**: needs native WebSocket (absent on Node 20) and top-level await breaks under tsx. Bootstrap script rewritten to use `fetch` (`998fe3a`). NOTE: `createAdminClient` (supabase-js) DID work inside the Next server runtime for `verifyAdminPin` — only the standalone tsx script needed the fetch rewrite. Consider upgrading to Node 22+.
- **vitest + `server-only`**: aliased to a no-op stub in `vitest.config.ts` (`61ded31`); do NOT use a global `react-server` resolve condition (it breaks client component tests).

## Deferred to a later pass
- **Tests** for everything (unit + component) — implementation-first per user.
- Non-essential admin sections (Blog, Testimonials, Reports, Moderation, Analytics).
- Push to GitHub / open PR (kept local per instruction).
- Security-advisor hardening noted in Phase 1a progress (search_path on 4 fns, extensions schema).

## Commits on `phase-1b-super-admin` (newest first)
2e9ab3f Cities & States · 80d18df Categories · e3e292a login fixes (CSP+cookie) ·
998fe3a fetch bootstrap · 3e9d19c lazy serverEnv · 57761e3 KPI dashboard ·
abf7424 generic DAL · a3f589c form system · d110f70 toolkit contract+display ·
399babe bootstrap script · 9a8362f login portal · 70a2e07 admin shell ·
d4c1b6b (site) refactor · 8ee3717 proxy gate · e153273 adminAction+audit ·
c85ec66 requireAdmin · ce31873 unlock token · 7162b4c PIN hash · 9516eb3 service client ·
61ded31 vitest server-only alias · 806bf6e server env schema
