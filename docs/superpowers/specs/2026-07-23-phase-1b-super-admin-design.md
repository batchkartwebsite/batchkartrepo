# BatchKart Phase 1b — Super Admin Dashboard — Design Specification

**Date:** 2026-07-23
**Status:** Approved (design phase) — ready for implementation planning
**Builds on:** Phase 0 (foundation) and Phase 1a (database, RLS, types). Derived from the
master design `docs/superpowers/specs/2026-07-20-batchkart-design.md` §7, §9, §10, §13.

---

## 1. Goal & scope

Deliver the complete **Super Admin Dashboard** — the single surface through which the super
admin enters and manages **every** platform entity — on top of the Phase 1a schema. This is the
back half of roadmap Phase 1 ("DB + Super Admin dashboard"); Phase 1a delivered the DB.

**Exit criteria (from the master spec):** a super admin can log in (email + password + 8-digit
PIN) and enter/manage every entity; RLS enforces access; every admin write is audit-logged.

**In scope:** admin auth (login-portal + PIN), the guarded admin shell, a reusable CRUD
framework, and full CRUD + list/filter/search/pagination/bulk/CSV for all admin sections in
spec §9, plus the KPI dashboard, moderation queue, discount-request review, media library, SEO
& settings editors, and an audit-log viewer.

**Out of scope (deferred):** transactional email *sending* (Phase 3 — Phase 1b writes
`notifications` rows but does not send email), coaching self-serve UI (schema-ready, deferred),
the public marketing/catalog site (Phase 2), student accounts/onboarding (Phase 3), Playwright
E2E (vitest-first this phase).

---

## 2. Locked approach decisions

| Decision | Choice | Rationale |
|---|---|---|
| Phase scope | **Full dashboard, all sections, one plan** | Meets the spec exit criterion; sequenced into waves so each is shippable/reviewable. |
| CRUD system | **Shared toolkit + per-entity typed config** | DRY reusable primitives without an over-abstracted metadata engine; escape hatches for non-CRUD panels. |
| Write authorization | **RLS as the admin role** | Reuse the existing `is_admin()` policies; DB-level safety net. Service-role client only where unavoidable (auth-user creation, cross-user reads). |
| Admin auth | **Password, then server-verified PIN** | Supabase session establishes identity; PIN is a second server-side gate that sets a short-lived admin-unlock token. |

---

## 3. Architecture

### 3.1 Site-chrome route-group refactor (prerequisite)

Today `app/layout.tsx` hardcodes `SiteHeader` + `SiteFooter` around all pages; admin must not
render marketing chrome. Refactor:

- **Root `app/layout.tsx`** keeps only `<html>`, `<body>`, fonts, `ThemeProvider` — no chrome.
- New **`app/(site)/layout.tsx`** renders `SiteHeader` + `SiteFooter`; move the existing
  `app/page.tsx` to `app/(site)/page.tsx`. (`(site)` is a URL-less route group; `/` unchanged.)
- **`app/admin/`** gets its own layouts (below), free of marketing chrome.

This is a targeted structural improvement required by the work — not unrelated refactoring.

### 3.2 Admin route tree

```
app/
├─ (site)/                     # marketing/public chrome (existing home moves here)
│  ├─ layout.tsx               # SiteHeader + SiteFooter
│  └─ page.tsx                 # homepage (moved)
├─ admin/
│  ├─ login-portal/page.tsx    # UNGATED: password step + PIN step
│  └─ (panel)/                 # URL-less group; all routes below are GUARDED
│     ├─ layout.tsx            # server guard + admin shell (sidebar + topbar)
│     ├─ page.tsx              # /admin — KPI dashboard overview
│     ├─ coaching/ …           # Catalog
│     ├─ batches/ · discounts/ · categories/ · cities/
│     ├─ students/ · requirements/ · discount-requests/ · reviews/ · reports/   # Community
│     ├─ blogs/ · testimonials/ · media/                                        # Content
│     └─ moderation/ · seo/ · analytics/ · settings/ · audit-logs/ · users/     # System
└─ middleware.ts               # Supabase session refresh + admin gate (root)
```

Sidebar nav groups mirror spec §9: **Overview** · **Catalog** · **Community** · **Content** ·
**System**.

### 3.3 New/changed directories

```
app/(site)/ …                       # NEW group (chrome + moved home)
app/admin/ …                        # NEW admin surface
middleware.ts                       # NEW: session refresh + admin gate
components/admin/                    # NEW: DataTable, FilterBar, Pagination, FormShell + fields,
                                    #      ModerationPill, StatCard, BulkActionBar, CsvExportButton,
                                    #      ConfirmDialog, EmptyState, AdminSidebar, AdminTopbar
lib/server/                         # NEW server-only core: requireAdmin, adminAction, audit, admin-session
lib/supabase/admin.ts               # NEW: service-role client (server-only)
lib/admin/resources/                # NEW: per-entity resource configs (typed)
config/env.server.ts                # NEW: server-only env (service key, session secret)
scripts/create-admin.ts             # NEW: bootstrap the first super admin
```

Placement follows the repo's existing **flat** convention (`lib/`, `components/`, `config/`),
not the master spec's aspirational `src/features/` layout (this repo does not use `src/`).

---

## 4. Admin authentication

### 4.1 Flow

1. **Password step** — `/admin/login-portal` submits email + password to a server action that
   calls `supabase.auth.signInWithPassword`. The action then asserts `profiles.role = 'admin'`
   **and** an `admin_users` row exists for the profile. If either fails, `supabase.auth.signOut`
   and return a generic error.
2. **PIN step** — the portal then shows an 8-digit PIN field. A server action verifies the PIN
   against `admin_users.security_pin_hash`. On success it:
   - sets a short-lived signed **admin-unlock token** — httpOnly, `Secure`, `SameSite=Strict`
     cookie, HMAC-signed with `ADMIN_SESSION_SECRET`, payload `{ sub, exp }`, TTL ~30 min, and
     re-issued on activity;
   - updates `admin_users.last_login_at` and `last_ip`.

### 4.2 PIN hashing

Node `crypto.scrypt` + `crypto.timingSafeEqual` (salt stored with the hash, `scrypt$<salt>$<hash>`
format). **No new dependency** — honors the "lean first" constraint. PIN operations run only in
Node-runtime server actions, never the edge.

### 4.3 Guard (defense in depth)

- **`middleware.ts`** — refreshes the Supabase session (required by `@supabase/ssr`) and, for
  `/admin/*` except `/admin/login-portal`, redirects to the portal when there is no session.
- **`app/admin/(panel)/layout.tsx`** — server component that runs `requireAdmin()` (session +
  `role='admin'` + valid unlock token); redirects to the portal otherwise.
- **`adminAction()`** — every mutation re-checks `requireAdmin()` server-side. UI guards are never
  trusted.

### 4.4 Bootstrap & throttling

- **`scripts/create-admin.ts`** (service-role): create or promote an auth user, set
  `profiles.role='admin'`, insert `admin_users` with a scrypt PIN hash. Runnable via `tsx`/node;
  the same result can be produced by SQL/MCP. Documented in the plan.
- **Throttling** — a simple per-IP/per-account failed-attempt counter on the password and PIN
  actions (in-memory limiter to start), with failures written to `audit_logs`. A durable
  lockout store is a later hardening item (no schema change needed now).

---

## 5. Server-action core & data access (`lib/server/`)

- **`requireAdmin()`** → returns the admin profile or throws/redirects. Reads the Supabase session,
  asserts role, and verifies the admin-unlock token. Used by the panel layout and every action.
- **`adminAction(schema, handler)`** → the single mutation wrapper. Steps: Zod-validate input →
  `requireAdmin()` → run `handler` → write an `audit_logs` row (`actor_id`, `action`,
  `entity_type`, `entity_id`, `changes: { before, after }`, `ip_address`, `user_agent`) → return a
  typed `{ ok, data | error }`. Centralizes **auth + validation + audit** so no section re-implements them.
- **RLS-as-admin** — mutations use the normal request-scoped, RLS-enforced Supabase server client;
  the existing `is_admin()` policies grant full CRUD. Admin-created catalog rows are **auto-published**
  (`moderation_status='published'`, `published_at=now()`), per the spec.
- **`lib/supabase/admin.ts`** — a service-role client used **only** for operations RLS genuinely
  can't serve: creating/inviting `auth.users`, and reading `auth.users`-only fields (e.g. email
  confirmation / last-sign-in) not mirrored in `profiles`. Ordinary Students reads go through RLS as
  admin (`profiles_admin_all` already grants admin select on all profiles). Server-only; a lint/test
  guards against client-side import.

---

## 6. CRUD framework

### 6.1 Reusable components (`components/admin/`)

`DataTable` (columns, sort, row-select for bulk), `FilterBar` (filter config ↔ URL search params),
`Pagination`, `FormShell` + typed fields (`text`, `textarea`, `enum-select`, `number`, `date`,
`switch`, `slug`, `relation-select`, `media-picker`) built on React Hook Form + Zod,
`ModerationPill`, `StatCard`, `BulkActionBar`, `CsvExportButton`, `ConfirmDialog`, `EmptyState`,
plus `AdminSidebar` / `AdminTopbar` shell.

### 6.2 Resource config (per entity)

Each section declares a typed config bound to a `public` table:

```ts
type ResourceConfig<T extends keyof Database["public"]["Tables"]> = {
  table: T;
  label: { singular: string; plural: string };
  listColumns: ColumnDef<T>[];           // what the DataTable shows
  searchColumns: (keyof Row<T>)[];        // ilike / search_vector targets
  filters: FilterDef<T>[];                // enum/date/boolean/relation filters
  defaultSort: { column: keyof Row<T>; dir: "asc" | "desc" };
  form: {                                 // create + edit
    schema: ZodType;                      // client + server validation
    fields: FieldDef<T>[];
  };
  actions?: CustomAction<T>[];            // e.g. moderation approve/reject, feature toggle
  autoPublish?: boolean;                  // catalog entities: set on admin create
};
```

A section is realized by thin route files that pass the config to shared components:
`.../<resource>/page.tsx` (list; server-fetches a page via the generic DAL + config),
`.../<resource>/new/page.tsx`, `.../<resource>/[id]/edit/page.tsx`. Mutations call
`adminAction(config.form.schema, …)`. Configs live in `lib/admin/resources/<resource>.ts`.

### 6.3 Escape hatches

Non-CRUD or composite surfaces are hand-built but reuse the primitives: **KPI dashboard**,
**moderation queue**, **discount-request review**, **media library grid**, **SEO/Settings**
editors, **audit-log viewer**. Coaching detail composes nested branches/faculty/discounts.

---

## 7. Sections (spec §9) & notable behavior

- **Overview / Dashboard** — KPI `StatCard`s (students, coaching, batches, pending discount
  requests, pending moderation) from aggregate queries; recent discount requests with inline
  approve/reject; audit activity feed.
- **Catalog** — Coaching (+ nested branches, faculty, coaching-level discounts, FAQs), Batches,
  Discounts, Categories (`exam_categories`, self-referencing), Cities & States. Admin creates are
  auto-published.
- **Community** — Students (`profiles`, read/manage via RLS as admin; service-role only for
  `auth.users`-level fields), Requirement
  Posts, Discount Requests (approve/reject → status + `admin_note` + `reviewed_by`, write a
  `notifications` row; email deferred), Reviews (approve/reject → rating recompute trigger fires),
  Reports (moderation queue).
- **Content** — Blog (posts + categories; long `content` field), Testimonials (curate/feature),
  Media Library (upload to the `media` bucket + `media` table; the `media-picker` field consumes it).
- **System** — Moderation (cross-entity pending list; mostly empty until self-serve, but built),
  SEO (`settings` group `seo`), Analytics (derived KPIs), Settings (feature flags / homepage
  config), Audit Logs (read-only, filterable viewer), Users (`admin_users` management).

---

## 8. Build sequence (waves within the single plan)

- **Wave 0 — Foundation:** site-chrome refactor; env split (+ service key, session secret);
  `middleware.ts`; admin auth (portal + PIN + guard + bootstrap script); admin shell;
  `requireAdmin` / `adminAction` / audit; CRUD toolkit + resource-config type + generic DAL;
  **KPI dashboard**.
- **Wave 1 — Catalog:** Coaching (+ branches/faculty/discounts/FAQs), Batches, Discounts,
  Categories, Cities & States.
- **Wave 2 — Community:** Students, Requirement Posts, Discount Requests (inline review), Reviews,
  Reports.
- **Wave 3 — Content:** Blog (posts + categories), Testimonials, Media Library.
- **Wave 4 — System:** Moderation queue, SEO, Analytics, Settings, Audit Logs viewer, Users.

Each resource is built test-first (schema + action units, then component tests, then the route
wiring). Waves are ordered so the framework (Wave 0) proves out on Catalog before the long tail.

---

## 9. Environment & config

Split env into public vs server-only so the service key never enters the client bundle:

- **`config/env.ts`** (existing, public): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **`config/env.server.ts`** (new, server-only, Zod-validated, imported only in server code):
  `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET` (min length for HMAC).
- Update `.env.example` with the new server keys (placeholders only; real values in gitignored
  `.env.local`).

---

## 10. Security (enterprise standards, spec §10)

Triple guard (middleware → layout → action); scrypt PIN with constant-time compare; signed,
short-lived, httpOnly admin-unlock token; login/PIN attempt throttling; **all writes audit-logged**;
Zod validation client + server; RLS enforced (writes as admin, not blanket service-role); existing
CSP + security headers retained; no client-side secrets (service key server-only, import-guarded);
least privilege.

---

## 11. Testing strategy

**Vitest-first** (standing constraint: no Playwright/Docker this phase).

- **Unit:** Zod resource schemas; `requireAdmin` decisions; `adminAction` validation + audit-diff
  shaping; PIN hash/verify; admin-unlock token sign/verify; resource-config → query builder;
  CSV export shaping.
- **Component (RTL + jsdom):** `DataTable` (sort/select/bulk), `FilterBar` (params sync),
  `FormShell` field rendering + validation errors, `ModerationPill`, `StatCard`, using a mocked
  Supabase client.
- **Deferred:** Playwright admin E2E (a later phase); no live DB required for unit/component tests,
  though a few read-only queries may be sanity-checked against the hosted project via MCP.

---

## 12. Definition of Done (Phase 1b)

- A seeded super admin can log in at `/admin/login-portal` (password → PIN) and reach `/admin`.
- The admin shell renders the grouped nav; unauthenticated access to any `/admin/(panel)` route
  redirects to the portal.
- Every spec §9 section supports list + search + filter + pagination + create + edit + delete
  (and bulk + CSV where applicable); catalog creates are auto-published.
- Discount requests can be approved/rejected inline; reviews moderation recomputes ratings.
- Every admin write produces an `audit_logs` row; the audit viewer shows them.
- `npm run typecheck` clean; `npm test` green (unit + component); `npm run build` succeeds.
- Service-role key is server-only; no client-side secret leakage.

**Next:** Phase 2 — Public site (homepage, catalog, SEO infrastructure) rendering the admin-entered
data.
