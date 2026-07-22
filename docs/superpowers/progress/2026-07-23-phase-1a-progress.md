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
| 17 | pgTAP trigger tests | 📝 authored | run deferred to CI |
| 18 | pgTAP RLS tests | 📝 authored | run deferred to CI |
| 19 | Curated seed data | 📝 authored | |
| 20 | TS types + typed clients | see notes | types **hand-authored** pending `db:types` (Docker); clients typed; vitest type-test ✅ |
| 21 | CI workflow (db.yml) | 📝 authored | this is what verifies 2–19 on push |
| 22 | Full reset/test gate | ⏳ deferred | needs Docker or CI run |

## Deferred-to-CI checklist (run these when Docker/CI is available)

- [ ] `npm run db:reset` applies all 14 migrations + seed with zero errors
- [ ] `npm run db:test` — 3 pgTAP files, 15 assertions pass
- [ ] `npm run db:types` — regenerate; commit if it differs from hand-authored types
- [ ] GitHub Actions `Database` workflow green

## Log

- 2026-07-23: `supabase init` scaffolded `config.toml` + `.gitignore`. Confirmed
  migrations/seed/tests are NOT gitignored. Began authoring migrations.
