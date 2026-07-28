# BatchKart — V1 (Minimal) — Build Progress / Handoff

**Branch:** `phase-1b-super-admin` (local only — NOT pushed, per standing instruction)
**Last worked:** 2026-07-28

> **V1 pivot (2026-07-28):** the earlier "18-section super admin" build was scrapped as
> over-engineered. V1 is intentionally minimal: **admin uploads batches** and **visitors
> submit an enquiry ("query")**. Coaching / categories / cities / discounts / KPI dashboard
> and their tables were deleted. See "What changed" below.

## How to resume

```powershell
git checkout phase-1b-super-admin
npm run dev                       # http://localhost:3000
```
- Public: `/` (homepage) → `/batches` (listing + enquiry form).
- Admin: `/admin/login-portal` → `/admin` (dashboard) → Batches / Queries.

### Admin login (created on the hosted project)
- Email: `admin.rishikesh@batchkart.com` · Password: `Rishi3425dgt@@` · PIN: `80032779`
- To create/reset: load `.env.local` into env, then `npx tsx scripts/create-admin.ts <email> <password> <8-digit-pin>`.

### Environment (`.env.local`, gitignored)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — hosted project `xmdugrozuftbtonkqtnn`.
- `SUPABASE_SERVICE_ROLE_KEY` — needed at runtime (PIN verify + bootstrap).
- `ADMIN_SESSION_SECRET` — 64-char random (set). `serverEnv` is lazy so `next build` works without runtime secrets.

## Working workflow preferences (IMPORTANT)
- **Keep it minimal / simple.** Do not re-expand scope. Get review before adding new sections.
- **Implementation-first, no TDD.** Verify with `npm run typecheck` + `npm run build`; tests deferred.

## Current state (V1) — build-verified (`npm run build` green)

### Database (hosted project — migration `supabase/migrations/20260728000000_v1_simplify.sql`)
Tables kept: **`profiles`**, **`admin_users`**, **`audit_logs`** (auth/audit), **`batches`** (standalone), **`queries`** (new).
Everything else was dropped (coaching*, categories, cities/states, discounts, reviews, blog, testimonials, media, settings, notifications, reports, requirement_posts, student_*, saved_batches, batch_contacts, newsletter, coaching_members*). The `archive-expired-requirements` pg_cron job + helper functions (`can_manage_branch`, `is_active_member_of`, `archive_expired_requirements`) were dropped too.
- **`batches`** made standalone: dropped `coaching_id`/`exam_id`/`branch_id`; added text `institute_name`, `exam`, `city`, `description`, `contact_phone`. RLS: `batches_admin_all` (kept, `is_admin()`), `batches_public_read` (published or admin).
- **`queries`**: `id, batch_id→batches (set null), name, phone, email, message, status ('new'/'contacted'/'closed'), created_at`. RLS: `queries_public_insert` (anon INSERT, `with check (true)`), `queries_admin_all` (admins full). **No public SELECT** → enquiries aren't world-readable.
- Types regenerated into `lib/supabase/database.types.ts` (enums still list old values — harmless).

### Admin (`/admin`, guarded by `(panel)/layout.tsx` + `proxy.ts`)
- **Dashboard** (`(panel)/page.tsx`) — simple: two `StatCard`s (total batches, new queries) + links. No KPI complexity.
- **Batches** (`/admin/batches`) — full CRUD via the resource template (`lib/admin/resources/batches.ts`, `autoPublish: true`). The create/edit form (`batch-form.tsx`) is a **custom progressive form**: Step 1 pick **Exam** (select) → Step 2 **Coaching/Institute + batch name + slug** appears → Step 3 remaining details appear. Submit disabled until step 3. Demo data seeded (Allen/Aakash/PW/FIITJEE/Vajiram/Drishti/Unacademy/Made Easy for NEET/JEE/UPSC/GATE).
- **Queries** (`/admin/queries`) — custom read-only-ish list: table of enquiries with an inline status `<select>` + delete. Server-guarded actions (`requireAdmin()`), not the generic template.
- Nav (`lib/admin/nav.ts`): Overview→Dashboard; Manage→Batches, Queries.

### Public (`app/(site)/`) — pro redesign (2026-07-28)
- **Fonts:** Fraunces (display, `.font-display` / `--font-fraunces`) + Hanken Grotesk (body, `--font-hanken`). Set in `app/layout.tsx`; wired in `globals.css`. (Replaced Inter.)
- **Design system atmospherics** in `globals.css`: emerald+amber mesh gradients (inline `radial-gradient`), `.bk-grain` SVG-noise overlay, keyframes `bk-marquee`/`bk-float`/`bk-rise` (+ `prefers-reduced-motion` guard).
- **Homepage** (`(site)/page.tsx`, server) — hero (staggered `bk-rise` reveal + floating cards), trusted-institutes marquee, **live featured batches from DB**, popular exams, how-it-works, why-us, reviews (static), FAQ (`<details>` accordion). Section ids `#exams #how #why #reviews #faq` match nav.
- **`/batches`** — refined header band + `BatchCard` grid + split enquiry panel.
- **`components/batches/batch-card.tsx`** — shared batch card (used by homepage + `/batches`).
- **Header** (`site-header.tsx`) — announcement bar + pill nav + `mobile-nav.tsx` (client hamburger) + "Send enquiry" CTA. **Footer** (`site-footer.tsx`) — CTA strip + Explore/Company columns + mesh.
- **`config/site.ts`** nav rewritten so **every link resolves** (page routes or on-page anchors — no 404s); test `config/site.test.ts` updated + asserts this.
- `submitQuery` (anon insert into `queries`, zod-validated) unchanged. Homepage `/` is now dynamic (ƒ) since it reads featured batches.

## Foundation still in place (unchanged, reusable)
- Auth: `lib/server/` `pin.ts`, `admin-session.ts` (cookie `bk_admin_unlock`), `require-admin.ts`, `audit.ts`, `admin-action.ts`, `resource.ts` (generic CRUD DAL). `lib/supabase/{server,admin}.ts`. `scripts/create-admin.ts`.
- `proxy.ts` (session refresh + `/admin` gate + security headers). `app/(site)/` chrome. Login portal.
- CRUD toolkit: `components/admin/*` (data-table, filter-bar, pagination, form-shell + `fields/*`, stat-card, bulk-action-bar, csv-export-button, confirm-dialog, empty-state, moderation-pill). `lib/admin/resource-config.ts`.

## Gotchas that still apply
1. **RSC boundary:** client form/list-view import their config directly (schema + cell fns aren't serializable); server pages pass only serializable data.
2. Form field cast: `resource.form.fields as FieldDef<TableName>[]`.
3. Enum `select` fields submit `""` if unpicked → seed create defaults (see `batchCreateDefaults`) or the `.default()` won't fire.
4. `autoPublish: true` requires `moderation_status` + `published_at` (batches has both).
5. `push()` URL contract must match `parseListParams` (page omit=1, pageSize omit=20, sort+dir, search, flat filters; reset page→1 on filter/search).
6. Server pages `await searchParams`/`params` (Next 16 Promises). `middleware.ts` is `proxy.ts` in Next 16.
7. CSP needs `'unsafe-inline'` in `script-src` or React never hydrates (forms do native GET). Unlock cookie `secure` only in prod.
8. Node 20 + `@supabase/supabase-js`: deprecation warning at build (harmless); consider Node 22+.

## Deferred / not done
- Tests (implementation-first).
- Commit + push (kept local per instruction).
- Email on enquiry (only DB row written). Auth-linked "my enquiries", spam protection on the public form.
- Editing the marketing site content beyond the two wired buttons.
