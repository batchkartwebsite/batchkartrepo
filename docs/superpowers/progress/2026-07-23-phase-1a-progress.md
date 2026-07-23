# Phase 1a — Database & Auth Foundation — Build Progress

**Plan:** `docs/superpowers/plans/2026-07-21-batchkart-phase-1a-database.md`
**Started:** 2026-07-23
**Branch:** `main` (local only — not pushed per instruction)

## Environment constraints for this build session

- **No Docker.** The local Supabase stack (`supabase start`, `supabase db reset`,
  `supabase test db`) is NOT run in this session. All SQL is **authored** but
  live-applied verification is **deferred to CI** (`.github/workflows/db.yml`,
  which spins up the stack on Docker in GitHub Actions).
- **Vitest only** for local tests — no Playwright work.
- **No push** — commits stay local.
- **Lean first** — no extra tooling/deps beyond what the plan needs.

## Verification legend

- ✅ **verified** — ran locally and confirmed (vitest / typecheck / file scaffolding)
- 📝 **authored** — code written, correct-by-construction from the plan, but the
  Docker-dependent verification (`db reset` / pgTAP) is deferred to CI
- ⏳ **pending** — not started

## Task status

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Supabase CLI init + scripts | ✅ authored/verified | `supabase init` ran (no Docker); scripts added; `db:start/reset/test/types` are Docker-run steps, deferred |
| 2 | Extensions + `set_updated_at()` | 📝 authored | |
| 3 | Enum types | 📝 authored | |
| 4 | Identity & Access + profile trigger | 📝 authored | |
| 5 | Taxonomy & Location | 📝 authored | |
| 6 | Coaching Catalog + search_vector | 📝 authored | |
| 7 | Student & Marketplace | 📝 authored | |
| 8 | Engagement & Content + rating trigger | 📝 authored | |
| 9 | System & Admin | 📝 authored | |
| 10 | Multi-tenant coaching | 📝 authored | |
| 11 | Indexes | 📝 authored | |
| 12 | RLS helper functions | 📝 authored | |
| 13 | RLS policies (all tables) | 📝 authored | |
| 14 | pg_cron nightly archive | 📝 authored | |
| 15 | Storage buckets + RLS | 📝 authored | |
| 16 | pgTAP schema tests | 📝 authored | run deferred to CI |
| 17 | pgTAP trigger tests | ✅ fixed + partially verified | **Fixed a latent bug** in assertion 2 (see log); `search_vector` + `set_updated_at` logic smoke-tested live via MCP. Full run still on CI |
| 18 | pgTAP RLS tests | 📝 authored | RLS-enabled-everywhere verified live; behavioral run deferred to CI |
| 19 | Curated seed data | ✅ verified | **Fixed a bug** in `cities` VALUES (see log); applied to hosted, counts match (states 10, cities 12, exams 13, blog_cats 6, settings 3, testimonials 3) |
| 20 | TS types + typed clients | ✅ verified | Applied schema to hosted `xmdugrozuftbtonkqtnn`; `database.types.ts` generated (54 KB); clients typed `<Database>`; type-test + `npm run typecheck` + `npm test` (21) all green |
| 21 | CI workflow (db.yml) | 📝 authored | this is what verifies 2–19 on push |
| 22 | Full reset/test gate | ✅ verified via hosted MCP | Schema integrity confirmed live: 30 public tables, 0 with RLS disabled, 20 enums, 9 helper/trigger fns. Local Docker `db reset`/`db test` still deferred to CI |

## Verification path (decided 2026-07-23): hosted Supabase MCP

Docker is not used. Instead we apply + verify against the **hosted** BatchKart
project (`ref = xmdugrozuftbtonkqtnn`, owned by a different Google account than the
CLI login). `.env.local` already points at this ref.

- MCP registered in `.mcp.json` (HTTP transport, OAuth — no token stored):
  `https://mcp.supabase.com/mcp?project_ref=xmdugrozuftbtonkqtnn`
- ✅ **Done (2026-07-23):** MCP authenticated + tools loaded. Full schema applied to
  hosted as 3 migrations (`phase_1a_schema_indexes_rls`, `phase_1a_cron_archive`,
  `phase_1a_storage` — combined from the 14 local files, identical SQL). Seed applied.
  Types generated, clients typed, vitest + typecheck green.

## Security advisor triage (hosted, 2026-07-23)

`get_advisors(security)` returned only **WARN** (no ERROR). Triage:

- **Intentional design (accept):** `newsletter_public_insert` WITH CHECK (true) is a
  public subscribe endpoint; public `avatars`/`media` buckets allow listing (public assets).
- **Must NOT "fix" (would break RLS):** the SECURITY DEFINER helpers (`is_admin`,
  `is_active_member_of`, `can_manage_branch`) are called by anon-facing RLS policies, so
  they must keep EXECUTE for anon/authenticated. The RPC-exposure lint is expected here.
- **Deferred hardening (cheap, non-blocking, for a follow-up migration):**
  pin `search_path` on the 4 non-SD functions (`set_updated_at`,
  `batches_search_vector_update`, `recompute_coaching_rating`,
  `archive_expired_requirements`); optionally move `citext`/`pg_trgm`/`unaccent` out of
  `public` into an `extensions` schema. `current_profile_role` / `handle_new_user` are the
  only helpers not used by a policy and could have EXECUTE revoked from anon later.

## Deferred-to-CI checklist (run these when Docker/CI is available)

- [ ] `npm run db:reset` applies all 14 migrations + seed with zero errors
- [ ] `npm run db:test` — 3 pgTAP files, 15 assertions pass
- [ ] `npm run db:types` — regenerate; commit if it differs from hand-authored types
- [ ] GitHub Actions `Database` workflow green

## Log

- 2026-07-23: `supabase init` scaffolded `config.toml` + `.gitignore`. Confirmed
  migrations/seed/tests are NOT gitignored. Began authoring migrations.
- 2026-07-23: Applied full schema + seed to hosted `xmdugrozuftbtonkqtnn` via MCP;
  generated `lib/supabase/database.types.ts`; typed both Supabase clients with
  `<Database>`; added `database.types.test.ts`. `npm run typecheck` clean,
  `npm test` = 11 files / 21 tests pass.
- 2026-07-23: **Seed bug fixed.** `supabase/seed.sql` `cities` CTE declared 4 column
  aliases `(state_name, name, slug, state_slug)` but each VALUES row supplied only 3
  → `ERROR 42P10: table "c" has 3 columns available but 4 columns specified`. This would
  also fail the CI `supabase db reset`. Added the missing display `name` to each of the
  12 rows. Re-applied to hosted; counts correct.
- 2026-07-23: **pgTAP trigger test bug fixed.** `tests/01_triggers.test.sql` assertion 2
  asserted `updated_at > created_at` after an in-transaction UPDATE. `now()` is constant
  for a whole transaction (and pgTAP wraps each file in one `begin;…rollback;`), so
  `updated_at == created_at` → the assertion would FAIL in CI. Verified live: the
  `set_updated_at` trigger is correct (updated_at = now() in a *separate* txn). Rewrote the
  assertion to write a stale `updated_at` and assert the trigger overrides it — robust
  within a single transaction. Confirmed live (`trigger_overrode_stale = true`).
