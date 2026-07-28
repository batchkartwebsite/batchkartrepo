
# BatchKart — Design Specification

**Date:** 2026-07-20
**Status:** Approved (design phase) — ready for implementation planning
**Domain:** batchkart.com

---

## 1. Overview

BatchKart is India's coaching **batch discovery marketplace**. Students discover coaching
batches, compare institutes and prices, unlock exclusive discounts, post requirements, and
connect with coaching institutes. The product targets startup-grade polish (Stripe, Airbnb,
Linear, Notion, Framer, Apple) and must be clean, premium, extremely fast, and SEO-optimized.

Supported exam categories at launch: **JEE, NEET, UPSC, SSC, Banking, Railway (RRB), BPSC,
CAT, GATE, CUET, CLAT, NDA, State PSC** — and the taxonomy is extensible for future categories.

### Locked design decisions

| Area                   | Decision                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| Visual direction       | **Growth Emerald** — fresh, value/education-forward                   |
| Logo                   | **Grad Cap** mark in a rounded emerald tile + `BatchKart` wordmark   |
| Reviews                | **Coaching-level** only (not per-batch)                                |
| Coaching data model    | **Multi-tenant, per-city** — schema built now, self-serve UI deferred |
| Data entry (now)       | **Super admin enters all data** via the complete admin dashboard       |
| Coaching self-serve UI | **Deferred** (schema ready, zero future schema change to enable)       |

---

## 2. Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion,
  React Hook Form, Zod.
- **Backend:** Supabase (PostgreSQL, Row Level Security, Storage, Edge Functions only where
  necessary).
- **Auth:** Supabase Auth — Email + Password, Google OAuth, email verification, forgot/reset
  password.
- **Hosting:** Vercel. **Repo:** GitHub. **Analytics:** Vercel Analytics, Google Analytics,
  Google Search Console.

---

## 3. Design System — "Growth Emerald"

### 3.1 Color tokens

**Brand (emerald)**

- `emerald-50` `#ecfdf5` · `emerald-100` `#d1fae5` · `emerald-500` `#10b981`
- `emerald-600` `#059669` **(primary)** · `emerald-700` `#047857` · `emerald-900` `#052e2b` (deep ink)

**Neutrals (slate)**

- `#f8fafc` · `#f1f5f9` · `#e2e8f0` (border) · `#94a3b8` · `#64748b` (muted) · `#334155` · `#0f172a` (ink)

**Semantic**

- Success `#10b981` · Warning/urgency `#f59e0b` (amber) · Error `#ef4444` / `#b91c1c` · Info `#0891b2`
- Discount badge = amber; "seats left" urgency = rose `#e11d48` / `#fee2e2` bg.

**Surfaces**

- Page `#ffffff`, subtle `#f8fafc`, mint `#ecfdf5`. Hero gradient: `#f0fdf4 → #ecfdf5 → #f7fee7`.

**Dark mode**

- Base `#0b1220`, surfaces `#0f172a` / `#1e293b`, borders `#1e293b`, emerald accent brightened to `#34d399`.

### 3.2 Typography

- **Family:** `Inter` (variable) for UI + body; display uses Inter with tight tracking
  (`letter-spacing: -0.02em` to `-0.03em`), weights 700–800.
- **Scale:** display 2.9rem/800 · h1 2rem · h2 1.55rem/800 · h3 1.1rem/700 · body 0.95–1rem/400–500 ·
  small 0.75rem · label 0.62–0.7rem uppercase tracked.
- Line-height 1.1 for display, 1.5–1.65 for body.

### 3.3 Shape, elevation, motion

- **Radius:** sm 8px · md 12px · lg 16px · xl 20px · pill 999px. Generous rounded corners throughout.
- **Shadows (soft):** `0 8px 24px rgba(2,46,43,.08)` (card), `0 16px 40px rgba(2,46,43,.14)` (raised).
- **Spacing:** 4px base; sections padded generously; centered content column max-width **1160px** with
  min **60px** left/right gutters (`padding-inline: max(60px, calc((100% - 1160px)/2))`).
- **Motion:** Framer Motion — subtle fade/slide on scroll, 150ms ease hover transitions, respectful of
  `prefers-reduced-motion`.
- **Accessibility first:** WCAG AA contrast, focus-visible rings, semantic HTML, keyboard nav, ARIA.
  Full dark mode support.

### 3.4 Core components (shadcn/ui base)

Button (primary/outline/ghost), Input/Select/Combobox, Slider (budget), Card, Badge/Pill, Tabs,
Dialog/Sheet, Dropdown, Toast, Table + Pagination, Avatar, Skeleton, Stepper (onboarding),
SearchBar (multi-field), FilterPanel, RatingStars, PriceTag (strikethrough + % off), StatCard,
EmptyState, Breadcrumbs.

---

## 4. Logo — "Grad Cap"

- **Mark:** graduation cap (mortarboard + base + tassel) reversed white inside a rounded-square
  emerald tile (`radius 13/48`, gradient `#10b981 → #059669`).
- **Wordmark:** `BatchKart`, Inter 800, tight tracking; "Kart" in emerald-600. **Rendered as a single
  unit** (no space between "Batch" and "Kart").
- **Variants:** full lockup, mark-only favicon/app-icon, reversed-on-dark (tile `#10b981`, cap
  `#052e2b`, "Kart" `#34d399`).
- **Deliverables:** SVG (lockup, mark), favicon set, PWA icons, OG default.

---

## 5. Homepage

Centered 1160px container, ~60px gutters. Sections top-to-bottom:

1. **Sticky nav** — logo · links (Explore Batches, Coaching, Exams, Discounts, Blog) · *Post a
   Requirement* (outline) · Sign in (ghost) · Sign up (primary). Backdrop blur.
2. **Hero** — pill badge, display headline (emerald gradient accent), subtitle, **multi-field search
   bar** (Exam/Coaching · City · Mode + Search), popular exam chips, trust stats (batches, coaching,
   cities, ₹ saved).
3. **Explore by exam** — responsive category grid (12 exams) with icon + batch count.
4. **Top coaching** — verified institute cards (banner, logo, city+exams, rating, batch count).
5. **Trending batches** — batch cards: exam tag, seats-left urgency, title, coaching+teacher, tags
   (mode/language/duration/start), price (now / was strikethrough / % off), dual CTA (Request
   Discount / Details).
6. **Exclusive discounts** — emerald promo band with headline + offer chips.
7. **How BatchKart works** — 4 steps (Discover → Compare → Request → Connect).
8. **Student success stories** — testimonial cards (stars, quote, avatar, exam+city).
9. **Post a Requirement** — dashed emerald CTA band (marketplace: students → coaching).
10. **Blog** — 3 latest posts (category, title, read time).
11. **Newsletter** — dark emerald band, email capture.
12. **Footer** — brand + description, **Quick Links** (All Batches, About Us, Contact Support, Blog),
    **Legal** (Privacy Policy, Terms of Service, Refund Policy), © line.

Footer copy (exact):

> **BatchKart** — India's most trusted platform for finding and comparing coaching batches. We
> connect ambitious students with the best educators.

---

## 6. Database Design (PostgreSQL / Supabase)

**Conventions:** UUID PKs (`gen_random_uuid()`), `created_at`/`updated_at` on all tables,
`deleted_at` soft delete where restorable, Postgres **enum** types for constrained fields, **RLS on
every table**. ~29 tables across six domains.

### 6.1 Identity & Access

- **profiles** — `id` (→ `auth.users`), `role` enum(`student`,`coaching_admin`,`admin`), full_name,
  email, phone, whatsapp, avatar_url, `city_id`→, onboarding_completed, timestamps. Auto-created via
  trigger on signup. 1:1 with auth.users.
- **admin_users** — `id`, `profile_id`→, `security_pin_hash` (8-digit), permissions jsonb,
  last_login_at, last_ip. No public signup.
- **notifications** — `id`, `user_id`→, type enum, title, body, data jsonb, read_at, created_at.

### 6.2 Taxonomy & Location

- **exam_categories** — id, name, slug, icon, `parent_id`→self (sub-exams), description, sort_order,
  is_active, seo jsonb.
- **states** — id, name, slug, code.
- **cities** — id, `state_id`→, name, slug, is_popular, latitude, longitude.

### 6.3 Coaching Catalog

- **coaching_institutes** — id, name, slug, logo_url, cover_url, description, is_verified,
  rating_avg, rating_count (denormalized), contact fields, seo jsonb, **claim_status**
  enum(`unclaimed`,`pending`,`claimed`), **created_by**→ (admin seeder), **moderation_status**.
- **coaching_branches** — id, `coaching_id`→, `city_id`→, address, latitude, longitude, phone,
  is_primary. *(Per-city presence.)*
- **coaching_faculty** — id, `coaching_id`→, name, subject, photo_url, experience_years, bio.
- **batches** — id, `coaching_id`→, `branch_id`→, `exam_id`→, name, slug, teacher, mode enum,
  language enum, fee, discounted_fee, fee_type enum(`one_time`,`emi`), start_date, duration_months,
  seats_total, seats_left, scholarship_available, curriculum jsonb, status, **moderation_status**
  enum(`draft`,`pending`,`published`,`rejected`), submitted_by, reviewed_by, published_at,
  `search_vector` tsvector.
- **discounts** — id, `coaching_id`→, `batch_id`→ (nullable), title, percent, amount, code,
  valid_from, valid_to, is_active.
- **faqs** — id, parent_type(`coaching`|`batch`), `parent_id`→, question, answer, sort_order.

### 6.4 Student & Marketplace

- **student_preferences** — id, `profile_id`→, language, study_mode enum, `target_exam_id`→,
  target_year, `preferred_city_id`→, preferred_coaching, budget_min, budget_max, fee_type,
  study_start_date, contact_time. *(Onboarding steps 1–3; always editable.)*
- **requirement_posts** — id, `student_id`→, `exam_id`→, `city_id`→, budget_min, budget_max, mode,
  language, target_year, study_start_date, description, status
  enum(`active`,`paused`,`archived`,`deleted`). **Auto-archive** when `now() > study_start_date`.
- **discount_requests** — id, `student_id`→, `batch_id`→ (nullable), reason_type enum, reason_text,
  `document_id`→ (nullable), status enum(`pending`,`approved`,`rejected`), admin_note, created_at.
- **saved_batches** — id, `student_id`→, `batch_id`→, unique(student, batch).
- **batch_contacts** — id, `student_id`→, `batch_id`→, status enum(`contacted`,`applied`).
- **student_documents** — id, `owner_id`→, type, file_url, file_size, is_verified. Supabase Storage,
  validated type/size.

### 6.5 Engagement & Content

- **reviews** — id, `author_id`→, `coaching_id`→, rating, title, body, status(`pending`,`approved`),
  is_verified. Trigger recomputes `coaching.rating_avg` / `rating_count`.
- **blog_posts** — id, `author_id`→, `category_id`→, title, slug, excerpt, cover_url, content
  (rich/mdx), reading_time, status(`draft`,`published`), published_at, seo jsonb(meta, og, canonical).
- **blog_categories** — id, name, slug, description (Exam Tips, Preparation, Scholarships, Admission,
  Career, Coaching Reviews).
- **testimonials** — id, name, role, exam, avatar_url, quote, rating, is_featured. Admin-curated.
- **newsletter_subscribers** — id, email (unique), status(`subscribed`,`unsubscribed`).

### 6.6 System & Admin

- **audit_logs** — id, `actor_id`→, action, entity_type, entity_id, changes jsonb (before/after),
  ip_address, user_agent, created_at. Every admin write logged.
- **media** — id, `uploader_id`→, url, type, size, folder, alt_text, width, height.
- **reports** — id, `reporter_id`→, entity_type, entity_id, reason, status. Moderation queue.
- **settings** — key (PK), value jsonb, group(`seo`,`homepage`,`general`). Feature flags, homepage
  config, SEO defaults.

### 6.7 Multi-tenant coaching (schema now, UI deferred)

- **coaching_members** — id, `coaching_id`→, `profile_id`→, member_role enum(`owner`,`manager`,
  `editor`), all_branches bool, status enum(`invited`,`active`,`suspended`), invited_by, created_at.
- **coaching_member_branches** — id, `member_id`→, `branch_id`→. *(Per-city scope: if
  `all_branches=false`, member manages only these branches.)*
- **coaching_claims** — id, `coaching_id`→ (nullable = new-listing request), `profile_id`→,
  `document_id`→ (proof), status(`pending`,`approved`,`rejected`), reviewed_by, admin_note.

### 6.8 Indexes, triggers, jobs

- GIN index on `batches.search_vector`; btrees on all FKs, slugs (unique), status/moderation_status,
  exam_id/city_id, start_date; trigram indexes for autocomplete where useful.
- Triggers: profile auto-create on signup; `updated_at` touch; review→coaching rating recompute;
  batches `search_vector` maintenance.
- **pg_cron** nightly job: flip `requirement_posts.status → archived` when past study_start_date.

### 6.9 RLS model (one rule, two worlds)

- **anon/public:** read-only, and only `moderation_status = 'published'` catalog rows.
- **student:** full access to *their own* rows (preferences, requirements, saved, discount requests,
  documents, contacts); read published catalog.
- **coaching_admin** *(schema-ready, UI later):* read/write a row only when
  `coaching_id ∈ active memberships` **AND** (`all_branches` **OR** row `branch_id ∈ coaching_member_branches`).
- **admin (super admin):** full unscoped CRUD on every table; admin-entered data is **auto-published**
  (bypasses moderation). Same policies whether data is admin-seeded or coaching-entered → enabling
  self-serve later needs **zero schema change**.

---

## 7. Permissions Model

| Capability                                                   | Student | Coaching admin*(deferred UI)*                                  | Super admin                                              |
| ------------------------------------------------------------ | ------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| Browse/search catalog                                        | ✓      | ✓                                                               | ✓                                                       |
| Manage own profile/requirements/discounts                    | ✓      | —                                                               | ✓ (all)                                                 |
| Enter/edit coaching, branches, batches, faculty, discounts   | —      | Own coaching, scoped to assigned cities,**via moderation** | **All, auto-published**                            |
| Blog, testimonials, cities, categories, media, SEO, settings | —      | —                                                               | ✓                                                       |
| Moderation, reports, audit logs, analytics                   | —      | —                                                               | ✓                                                       |
| Admin access                                                 | —      | —                                                               | `/admin/login-portal` (email + password + 8-digit PIN) |

---

## 8. Information Architecture (routes)

**Public (SSR + SEO):** `/` · `/batches` (search+filters) · `/batches/[slug]` · `/coaching` ·
`/coaching/[slug]` · `/exams/[exam]` · `/exams/[exam]/[city]` · `/cities/[city]` · `/discounts` ·
`/blog` · `/blog/[slug]` · `/blog/category/[cat]` · `/about` · `/contact` · `/for-coaching` ·
`/privacy` · `/terms` · `/refund-policy`.

**Auth:** `/login` · `/signup` · `/forgot-password` · `/reset-password` · `/verify-email`.

**Student (protected):** `/onboarding` (5-step wizard) · `/dashboard` · `/profile` · `/saved` ·
`/requirements` · `/requirements/new` · `/requirements/[id]/edit` · `/discount-requests` ·
`/settings`.

**Coaching (deferred):** `/coaching-portal` · `/coaching-portal/claim` · `/branches` · `/batches` ·
`/discounts` · `/team`.

**Admin (protected):** `/admin/login-portal` · `/admin` · `/admin/users` · `/admin/students` ·
`/admin/coaching` · `/admin/batches` · `/admin/moderation` · `/admin/requirements` ·
`/admin/discount-requests` · `/admin/blogs` · `/admin/testimonials` · `/admin/cities` ·
`/admin/categories` · `/admin/media` · `/admin/reports` · `/admin/seo` · `/admin/settings` ·
`/admin/audit-logs`.

**System:** `/sitemap.xml` · `/robots.txt` · `/feed.xml` (RSS) · `/api/og` · `/manifest.webmanifest`.

### 8.1 Student onboarding wizard (5 steps)

1. Academic preferences (language, study mode, preferred coaching optional, preferred city, target
   exam, target year, study start date optional).
2. Budget (min–max slider, preferred fee type: one-time / EMI).
3. Contact (name, phone, WhatsApp, email, preferred contact time).
4. Reason for discount (reason type + text, optional document upload).
5. Review & submit. Always remains editable afterward.

---

## 9. Super Admin Dashboard

Single surface to **enter and manage all platform data**. Left nav grouped:
Overview (Dashboard) · Catalog (Coaching, Batches, Discounts, Categories, Cities & States) ·
Community (Students, Requirement Posts, Discount Requests, Reviews, Reports) ·
Content (Blog, Testimonials, Media Library) ·
System (Moderation, SEO, Analytics, Settings, Audit Logs).

**Every section provides:** search-everywhere, filters, pagination, bulk actions, CSV export, full
CRUD. Dashboard overview shows KPI stat cards (students, coaching, batches, pending discount
requests, pending moderation), recent discount requests with inline review/approve, and an
activity/audit feed. Batches/coaching quick-manage tables show moderation status pills and add/edit.

---

## 10. Security Standards (enterprise)

Supabase RLS on all tables · strict server-side authorization · Zod validation on all inputs
(client + server) · Server Actions authenticated · rate limiting · CSRF protection where applicable ·
security headers + Content Security Policy · SQL-injection prevention (parameterized) · XSS
prevention + input sanitization · audit logging · secure cookies · session rotation · environment
variable validation · image/file upload validation (type + size) · admin route protection
(middleware + PIN) · **no client-side secrets** · least-privilege access.

---

## 11. SEO Standards (world-class)

Server rendering + Metadata API · dynamic metadata · OpenGraph + Twitter cards · JSON-LD
(Organization, Breadcrumb, FAQ, Course, Article, Review) · canonical URLs · robots.txt · dynamic
sitemap · RSS feed · image optimization + lazy loading · aggressive caching (ISR/route cache) ·
excellent Core Web Vitals. Programmatic SEO landing pages for exam × city.

---

## 12. Performance Targets

React Server Components · streaming + Suspense · Server Actions · image optimization · route
prefetching · caching · edge middleware only where appropriate · code splitting · lazy loading.
**Lighthouse targets:** Performance 95+ · SEO 100 · Accessibility 100 · Best Practices 100.

---

## 13. Folder Structure (feature-based, enterprise-grade)

```
batchkart/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/      # home, exams, cities, blog, legal
│  │  ├─ (catalog)/        # batches, coaching, discounts
│  │  ├─ (auth)/           # login, signup, reset, verify
│  │  ├─ (student)/        # onboarding, dashboard, profile, requirements
│  │  ├─ (coaching)/       # coaching-portal (deferred)
│  │  ├─ admin/            # login-portal + protected panel
│  │  ├─ api/              # route handlers, og, webhooks
│  │  └─ sitemap.ts · robots.ts · manifest.ts · layout.tsx
│  ├─ features/            # self-contained modules; each: components/ actions/
│  │                       #   queries/ schemas/ types
│  │  └─ batches · coaching · requirements · discounts · onboarding · auth ·
│  │     blog · search · admin
│  ├─ components/          # ui/ (shadcn) · layout/ · shared/
│  ├─ lib/                 # supabase, seo, email, rate-limit, utils
│  ├─ server/              # server-only: guards, db, action core
│  ├─ hooks/ · schemas/ · types/ · config/ · styles/ · emails/
│  └─ middleware.ts        # auth + admin guard + security headers
├─ supabase/               # migrations/ · functions/ · seed.sql
├─ tests/                  # unit · integration · e2e (Playwright)
├─ public/
└─ next.config · tailwind.config · tsconfig · .env.example
```

---

## 14. Notifications (transactional email)

Welcome, password reset, email verification, requirement submitted, requirement updated, discount
approved, batch recommendation, admin notifications. React-email templates; queued off
`notifications`.

---

## 15. Phased Roadmap

Each phase gets its **own spec → plan → build** cycle.

| Phase                                      | Scope                                                                                                                                                                                         | Exit criteria                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **P0 — Foundation**                 | Repo, Next.js 16/TS/Tailwind/shadcn, Supabase project, design system (tokens, core components, dark mode), env validation, CSP + security headers, CI/CD, base layout + nav, logo assets.     | App boots on Vercel; design system + nav/footer render; security headers pass; CI green. |
| **P1 — DB + Super Admin dashboard** | Full schema + enums + RLS + triggers + seed; complete admin panel (all CRUD, search, filters, pagination, bulk, CSV), moderation, media, audit logs, KPI dashboard; admin login-portal + PIN. | Super admin can log in and enter/manage every entity; RLS verified; audit logging works. |
| **P2 — Public site**                | Homepage,`/batches` search + filters, batch & coaching pages, exam/city SEO landing pages, discounts, blog; full SEO infra (metadata, JSON-LD, sitemap, robots, RSS, OG).                   | Public catalog displays admin data; Lighthouse targets met; structured data validates.   |
| **P3 — Student accounts**           | Auth (email+password, Google, verify, reset), 5-step onboarding wizard, profile, saved batches, requirement marketplace, discount requests, notifications + transactional email.              | Student can sign up, onboard, save, post requirements, request discounts; emails send.   |
| **Deferred — Coaching self-serve**  | Coaching signup, claim flow, coaching portal, member + per-branch scoping, moderation integration.                                                                                            | Enabled with**no schema change** when prioritized.                                 |
| **Later — Growth**                  | AI recommendations, chatbot, scholarship engine, referrals, badges, push, payments, React Native app.                                                                                         | Each a separate initiative on the same foundation.                                       |

---

## 16. Out of Scope (this design)

Coaching-admin portal UI, payments, AI features, mobile app, CRM, WhatsApp automation, voice search
— all future. The schema and API are designed so these bolt on without major refactoring.
