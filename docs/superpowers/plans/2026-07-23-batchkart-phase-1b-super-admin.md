# BatchKart Phase 1b — Super Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Super Admin Dashboard — password+PIN login, a guarded admin shell, a reusable CRUD framework, and full manage-everything sections over the Phase 1a schema — so a super admin can enter and moderate every platform entity, with every write audit-logged.

**Architecture:** A `(site)` route group holds the marketing chrome; a guarded `app/admin/(panel)` group holds the dashboard. Admin auth is Supabase email+password followed by a server-verified 8-digit PIN (scrypt) that mints a short-lived HMAC-signed unlock cookie; `middleware.ts` → panel layout → `adminAction()` form a triple guard. All writes go through the **RLS-enforced** admin client (existing `is_admin()` policies); a service-role client is used only for `auth.users`-level operations. A shared toolkit (DataTable, FilterBar, FormShell, …) plus a typed per-entity **resource config** renders every CRUD section from one code path, with escape hatches for non-CRUD panels (KPI dashboard, moderation, media, audit viewer).

**Tech Stack:** Next.js 16 (App Router, Server Components, Server Actions, middleware), TypeScript, Tailwind + shadcn/ui, React Hook Form + Zod, `@supabase/ssr` + `@supabase/supabase-js`, Node `crypto` (scrypt/HMAC), Vitest + Testing Library.

---

## Conventions for every task

- Run commands from the project root (`C:\Users\sagar\OneDrive\Desktop\Websites\BatchKart`) in PowerShell unless noted.
- **This is Next.js 16.** Before writing middleware or server actions, skim `node_modules/next/dist/docs/` for the current API (async `cookies()`/`headers()` are already used in `lib/supabase/server.ts`). Match existing repo patterns.
- **TDD:** write the failing test first, watch it fail, implement minimally, watch it pass, commit. Pure logic (PIN, token, audit-diff, config→query, Zod schemas) is unit-tested; React pieces use Testing Library + jsdom with a mocked Supabase client.
- **Commands:** `npm test <path>` runs a file; `npm run typecheck`; `npm run build`. Commit at the end of each task.
- **Server-only files** start with `import "server-only";` so they can never enter the client bundle.
- **No pushing** — commits stay local (standing instruction). CI/build verification via `npm run build`.

## Prerequisites

- Phase 1a merged: schema + RLS + `lib/supabase/database.types.ts` present; hosted project reachable.
- `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. This plan adds
  `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SESSION_SECRET` (Task 1 documents where to get them).

---

## File Structure (created/modified in this phase)

```
config/
├─ env.server.ts                         # NEW: server-only env (service key, session secret)
├─ env.ts                                 # (unchanged; public vars)
app/
├─ layout.tsx                             # MODIFY: strip SiteHeader/Footer → html/body/theme only
├─ (site)/
│  ├─ layout.tsx                          # NEW: SiteHeader + SiteFooter
│  └─ page.tsx                            # MOVED from app/page.tsx
├─ admin/
│  ├─ login-portal/page.tsx               # NEW: password step + PIN step (client form)
│  └─ (panel)/
│     ├─ layout.tsx                       # NEW: requireAdmin guard + AdminShell
│     ├─ page.tsx                         # NEW: KPI dashboard
│     └─ <resource>/…                     # NEW per section (Waves 1–4)
middleware.ts                             # NEW: session refresh + /admin gate
lib/
├─ supabase/admin.ts                      # NEW: service-role client (server-only)
├─ server/
│  ├─ pin.ts                              # NEW: scrypt hash/verify
│  ├─ admin-session.ts                    # NEW: HMAC unlock-token sign/verify
│  ├─ require-admin.ts                    # NEW: getAdminContext / requireAdmin
│  ├─ admin-action.ts                     # NEW: adminAction() wrapper + audit
│  ├─ audit.ts                            # NEW: diff + writeAuditLog
│  └─ resource.ts                         # NEW: generic list/get/create/update/delete DAL
├─ admin/
│  ├─ resource-config.ts                  # NEW: ResourceConfig types + helpers
│  └─ resources/<name>.ts                 # NEW per section (Waves 1–4)
components/admin/
├─ admin-shell.tsx · admin-sidebar.tsx · admin-topbar.tsx
├─ data-table.tsx · filter-bar.tsx · pagination.tsx
├─ form-shell.tsx · fields/*.tsx
├─ stat-card.tsx · moderation-pill.tsx · bulk-action-bar.tsx
├─ csv-export-button.tsx · confirm-dialog.tsx · empty-state.tsx
scripts/
└─ create-admin.ts                        # NEW: bootstrap first super admin
```

---

# WAVE 0 — Foundation

## Task 1: Server-only environment config

**Files:**
- Create: `config/env.server.ts`, `config/env.server.test.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write the failing test**

```ts
// config/env.server.test.ts
import { describe, it, expect } from "vitest";
import { parseServerEnv } from "./env.server";

describe("parseServerEnv", () => {
  it("parses valid server env", () => {
    const env = parseServerEnv({
      SUPABASE_SERVICE_ROLE_KEY: "svc-key",
      ADMIN_SESSION_SECRET: "x".repeat(32),
    });
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("svc-key");
  });

  it("rejects a short session secret", () => {
    expect(() =>
      parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: "k", ADMIN_SESSION_SECRET: "short" }),
    ).toThrow(/Invalid server environment/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test config/env.server.test.ts`
Expected: FAIL (cannot find module `./env.server`).

- [ ] **Step 3: Implement**

```ts
// config/env.server.ts
import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const serverEnv = parseServerEnv({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
});
```

Note: `config/env.server.test.ts` imports only `parseServerEnv` (a pure function). Because the
module runs `parseServerEnv(process.env…)` at import, set dummy values in `vitest.setup.ts` OR
keep the test importing the type-only path. To keep the eager `serverEnv` from throwing under test,
add to `vitest.setup.ts`: `process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-svc"; process.env.ADMIN_SESSION_SECRET ??= "t".repeat(32);`

- [ ] **Step 4: Add the two keys to `.env.example` (placeholders)**

```
# Server-only (never exposed to the client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SESSION_SECRET=generate-a-32+char-random-string
```

Also set real values in gitignored `.env.local` (service role key: Supabase dashboard → Project
Settings → API; session secret: any 32+ char random string).

- [ ] **Step 5: Run tests + typecheck**

Run: `npm test config/env.server.test.ts` → PASS.
Run: `npm run typecheck` → clean.

- [ ] **Step 6: Commit**

```bash
git add config/env.server.ts config/env.server.test.ts .env.example vitest.setup.ts
git commit -m "feat(admin): server-only env schema (service key, session secret)"
```

---

## Task 2: Service-role Supabase client

**Files:**
- Create: `lib/supabase/admin.ts`, `lib/supabase/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/supabase/admin.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ __marker: "admin-client" })),
}));

describe("createAdminClient", () => {
  it("builds a client with the service-role key and no session persistence", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { createAdminClient } = await import("./admin");
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith(
      expect.any(String),
      "test-svc",
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: false }) }),
    );
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test lib/supabase/admin.test.ts` → FAIL (no module `./admin`).

- [ ] **Step 3: Implement**

```ts
// lib/supabase/admin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { serverEnv } from "@/config/env.server";
import type { Database } from "./database.types";

/** Bypasses RLS. Server-only. Use ONLY for auth.users-level operations. */
export function createAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
```

- [ ] **Step 4: Run → PASS. Typecheck clean.**

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/admin.ts lib/supabase/admin.test.ts
git commit -m "feat(admin): service-role Supabase client (server-only)"
```

---

## Task 3: PIN hashing (scrypt)

**Files:**
- Create: `lib/server/pin.ts`, `lib/server/pin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/server/pin.test.ts
import { describe, it, expect } from "vitest";
import { hashPin, verifyPin } from "./pin";

describe("pin hashing", () => {
  it("verifies a correct pin and rejects a wrong one", () => {
    const stored = hashPin("12345678");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPin("12345678", stored)).toBe(true);
    expect(verifyPin("87654321", stored)).toBe(false);
  });

  it("rejects malformed stored values", () => {
    expect(verifyPin("12345678", "garbage")).toBe(false);
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
// lib/server/pin.ts
import "server-only";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(pin, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**

```bash
git add lib/server/pin.ts lib/server/pin.test.ts
git commit -m "feat(admin): scrypt PIN hash/verify"
```

---

## Task 4: Admin unlock token (HMAC)

**Files:**
- Create: `lib/server/admin-session.ts`, `lib/server/admin-session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/server/admin-session.test.ts
import { describe, it, expect } from "vitest";
import { signAdminToken, verifyAdminToken, ADMIN_UNLOCK_COOKIE } from "./admin-session";

const SUB = "11111111-1111-1111-1111-111111111111";

describe("admin unlock token", () => {
  it("signs and verifies a token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t, 2000)).toEqual({ sub: SUB });
  });

  it("rejects an expired token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t, 1000 + 31 * 60 * 1000)).toBeNull();
  });

  it("rejects a tampered token", () => {
    const t = signAdminToken(SUB, 1000);
    expect(verifyAdminToken(t.slice(0, -2) + "xx", 2000)).toBeNull();
  });

  it("exposes the cookie name", () => {
    expect(ADMIN_UNLOCK_COOKIE).toBe("bk_admin_unlock");
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
// lib/server/admin-session.ts
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/env.server";

export const ADMIN_UNLOCK_COOKIE = "bk_admin_unlock";
export const ADMIN_UNLOCK_TTL_MS = 30 * 60 * 1000;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}
function sign(payload: string): string {
  return createHmac("sha256", serverEnv.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
}

export function signAdminToken(sub: string, now = Date.now()): string {
  const body = b64url(JSON.stringify({ sub, exp: now + ADMIN_UNLOCK_TTL_MS }));
  return `${body}.${sign(body)}`;
}

export function verifyAdminToken(token: string, now = Date.now()): { sub: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof sub !== "string" || typeof exp !== "number" || now > exp) return null;
    return { sub };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit**

```bash
git add lib/server/admin-session.ts lib/server/admin-session.test.ts
git commit -m "feat(admin): HMAC-signed admin unlock token"
```

---

## Task 5: `getAdminContext` / `requireAdmin`

**Files:**
- Create: `lib/server/require-admin.ts`, `lib/server/require-admin.test.ts`

- [ ] **Step 1: Write the failing test** (mock the Supabase server client + cookies + a valid token)

```ts
// lib/server/require-admin.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { signAdminToken } from "./admin-session";

const SUB = "22222222-2222-2222-2222-222222222222";
const getUser = vi.fn();
const single = vi.fn();
const cookieGet = vi.fn();

vi.mock("next/headers", () => ({ cookies: async () => ({ get: cookieGet }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}));

beforeEach(() => { getUser.mockReset(); single.mockReset(); cookieGet.mockReset(); });

describe("getAdminContext", () => {
  it("returns context for an admin with a valid unlock token", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "admin", full_name: "A", email: "a@x.dev" } });
    cookieGet.mockReturnValue({ value: signAdminToken(SUB) });
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toMatchObject({ userId: SUB });
  });

  it("returns null when the profile is not an admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "student" } });
    cookieGet.mockReturnValue({ value: signAdminToken(SUB) });
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toBeNull();
  });

  it("returns null when the unlock token is missing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: SUB } } });
    single.mockResolvedValue({ data: { id: SUB, role: "admin" } });
    cookieGet.mockReturnValue(undefined);
    const { getAdminContext } = await import("./require-admin");
    expect(await getAdminContext()).toBeNull();
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
// lib/server/require-admin.ts
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_UNLOCK_COOKIE, verifyAdminToken } from "./admin-session";

export type AdminProfile = { id: string; role: string; full_name: string | null; email: string | null };
export type AdminContext = { userId: string; profile: AdminProfile };

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles").select("id, role, full_name, email").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return null;

  const token = (await cookies()).get(ADMIN_UNLOCK_COOKIE)?.value;
  const verified = token ? verifyAdminToken(token) : null;
  if (!verified || verified.sub !== user.id) return null;

  return { userId: user.id, profile: profile as AdminProfile };
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login-portal");
  return ctx;
}
```

- [ ] **Step 4: Run → PASS. Typecheck clean.**

- [ ] **Step 5: Commit**

```bash
git add lib/server/require-admin.ts lib/server/require-admin.test.ts
git commit -m "feat(admin): getAdminContext + requireAdmin guard"
```

---

## Task 6: Audit logging + `adminAction` wrapper

**Files:**
- Create: `lib/server/audit.ts`, `lib/server/audit.test.ts`
- Create: `lib/server/admin-action.ts`, `lib/server/admin-action.test.ts`

- [ ] **Step 1: Write the failing test for the diff helper**

```ts
// lib/server/audit.test.ts
import { describe, it, expect } from "vitest";
import { diffChanges } from "./audit";

describe("diffChanges", () => {
  it("captures only changed fields as before/after", () => {
    const before = { a: 1, b: "x", c: true };
    const after = { a: 2, b: "x", c: false };
    expect(diffChanges(before, after)).toEqual({
      before: { a: 1, c: true },
      after: { a: 2, c: false },
    });
  });

  it("handles create (no before) and delete (no after)", () => {
    expect(diffChanges(null, { a: 1 })).toEqual({ before: null, after: { a: 1 } });
    expect(diffChanges({ a: 1 }, null)).toEqual({ before: { a: 1 }, after: null });
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `audit.ts`**

```ts
// lib/server/audit.ts
import "server-only";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Row = Record<string, unknown>;
export function diffChanges(before: Row | null, after: Row | null) {
  if (!before || !after) return { before: before ?? null, after: after ?? null };
  const b: Row = {}, a: Row = {};
  for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) { b[k] = before[k]; a[k] = after[k]; }
  }
  return { before: b, after: a };
}

export async function writeAuditLog(
  supabase: SupabaseClient<Database>,
  entry: { actorId: string; action: string; entityType: string; entityId?: string | null; before: Row | null; after: Row | null },
) {
  const h = await headers();
  await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    changes: diffChanges(entry.before, entry.after),
    ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: h.get("user-agent") ?? null,
  });
}
```

- [ ] **Step 4: Write the failing test for `adminAction`** (mock requireAdmin + client)

```ts
// lib/server/admin-action.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

const requireAdmin = vi.fn();
const insertAudit = vi.fn().mockResolvedValue({});
vi.mock("./require-admin", () => ({ requireAdmin: () => requireAdmin() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: () => ({ insert: insertAudit }) }),
}));
vi.mock("next/headers", () => ({ headers: async () => new Map() }));

beforeEach(() => { requireAdmin.mockReset(); insertAudit.mockClear(); });

describe("adminAction", () => {
  it("rejects invalid input before touching the DB", async () => {
    requireAdmin.mockResolvedValue({ userId: "u1", profile: {} });
    const { adminAction } = await import("./admin-action");
    const run = adminAction({
      action: "test.create", entityType: "thing",
      schema: z.object({ name: z.string().min(1) }),
      handler: async () => ({ result: { id: "x" }, after: { id: "x" } }),
    });
    const res = await run({ name: "" });
    expect(res.ok).toBe(false);
  });

  it("runs the handler and writes an audit row on success", async () => {
    requireAdmin.mockResolvedValue({ userId: "u1", profile: {} });
    const { adminAction } = await import("./admin-action");
    const run = adminAction({
      action: "test.create", entityType: "thing",
      schema: z.object({ name: z.string().min(1) }),
      handler: async () => ({ result: { id: "x" }, entityId: "x", after: { id: "x", name: "n" } }),
    });
    const res = await run({ name: "n" });
    expect(res).toEqual({ ok: true, data: { id: "x" } });
    expect(insertAudit).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 5: Implement `admin-action.ts`**

```ts
// lib/server/admin-action.ts
import "server-only";
import type { ZodType } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, type AdminContext } from "./require-admin";
import { writeAuditLog } from "./audit";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Row = Record<string, unknown>;
export type ActionResult<O> = { ok: true; data: O } | { ok: false; error: string };

export function adminAction<I, O>(opts: {
  action: string;
  entityType: string;
  schema: ZodType<I>;
  handler: (
    input: I, ctx: AdminContext, supabase: SupabaseClient<Database>,
  ) => Promise<{ result: O; entityId?: string; before?: Row | null; after?: Row | null }>;
}): (raw: unknown) => Promise<ActionResult<O>> {
  return async (raw) => {
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const ctx = await requireAdmin();
    const supabase = await createClient();
    try {
      const { result, entityId, before = null, after = null } = await opts.handler(parsed.data, ctx, supabase);
      await writeAuditLog(supabase, {
        actorId: ctx.userId, action: opts.action, entityType: opts.entityType,
        entityId, before, after,
      });
      return { ok: true, data: result };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Action failed" };
    }
  };
}
```

- [ ] **Step 6: Run both test files → PASS. Typecheck clean.**

- [ ] **Step 7: Commit**

```bash
git add lib/server/audit.ts lib/server/audit.test.ts lib/server/admin-action.ts lib/server/admin-action.test.ts
git commit -m "feat(admin): audit diff + adminAction wrapper (auth+validate+audit)"
```

---

## Task 7: Middleware — session refresh + `/admin` gate

**Files:**
- Create: `middleware.ts`, `middleware.test.ts`

- [ ] **Step 1: Read the Next 16 middleware guide**

Skim `node_modules/next/dist/docs/` for middleware + `@supabase/ssr` `updateSession` pattern.

- [ ] **Step 2: Write the failing test** (unit-test the gate decision helper, not the Next runtime)

```ts
// middleware.test.ts
import { describe, it, expect } from "vitest";
import { adminGateDecision } from "./middleware";

describe("adminGateDecision", () => {
  it("allows the login portal without a session", () => {
    expect(adminGateDecision("/admin/login-portal", false)).toEqual({ type: "next" });
  });
  it("redirects guarded admin routes when unauthenticated", () => {
    expect(adminGateDecision("/admin/coaching", false)).toEqual({ type: "redirect", to: "/admin/login-portal" });
  });
  it("allows guarded admin routes when a session exists", () => {
    expect(adminGateDecision("/admin", true)).toEqual({ type: "next" });
  });
  it("ignores non-admin routes", () => {
    expect(adminGateDecision("/batches", false)).toEqual({ type: "next" });
  });
});
```

- [ ] **Step 3: Run → FAIL.**

- [ ] **Step 4: Implement** (export the pure helper + the Next middleware that refreshes the Supabase session)

```ts
// middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/config/env";

export type GateDecision = { type: "next" } | { type: "redirect"; to: string };

export function adminGateDecision(pathname: string, hasSession: boolean): GateDecision {
  if (!pathname.startsWith("/admin")) return { type: "next" };
  if (pathname.startsWith("/admin/login-portal")) return { type: "next" };
  return hasSession ? { type: "next" } : { type: "redirect", to: "/admin/login-portal" };
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const decision = adminGateDecision(request.nextUrl.pathname, Boolean(user));
  if (decision.type === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 5: Run → PASS. Typecheck clean. `npm run build` succeeds.**

- [ ] **Step 6: Commit**

```bash
git add middleware.ts middleware.test.ts
git commit -m "feat(admin): middleware session refresh + /admin gate"
```

---

## Task 8: Site-chrome route-group refactor

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/(site)/layout.tsx`
- Move: `app/page.tsx` → `app/(site)/page.tsx`

- [ ] **Step 1: Move the homepage**

Run: `git mv app/page.tsx app/(site)/page.tsx`

- [ ] **Step 2: Create `app/(site)/layout.tsx`** (owns the marketing chrome)

```tsx
// app/(site)/layout.tsx
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 3: Strip chrome from the root layout** (keep html/body/theme/font only)

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — Discover & compare coaching batches`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify existing header/footer tests still pass + home renders**

Run: `npm test components/layout` → PASS.
Run: `npm run build` → succeeds; `/` still renders with header/footer.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx "app/(site)/layout.tsx" "app/(site)/page.tsx"
git commit -m "refactor(app): move marketing chrome into (site) route group"
```

---

## Task 9: Admin shell (sidebar + topbar + panel layout guard)

**Files:**
- Create: `components/admin/admin-sidebar.tsx`, `admin-topbar.tsx`, `admin-shell.tsx`, `admin-shell.test.tsx`
- Create: `lib/admin/nav.ts` (nav config), `lib/admin/nav.test.ts`
- Create: `app/admin/(panel)/layout.tsx`

- [ ] **Step 1: Write the failing test for the nav config**

```ts
// lib/admin/nav.test.ts
import { describe, it, expect } from "vitest";
import { adminNav } from "./nav";

describe("adminNav", () => {
  it("has the five spec groups", () => {
    expect(adminNav.map((g) => g.label)).toEqual(["Overview", "Catalog", "Community", "Content", "System"]);
  });
  it("every item has an href under /admin", () => {
    for (const g of adminNav) for (const i of g.items) expect(i.href.startsWith("/admin")).toBe(true);
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `lib/admin/nav.ts`**

```ts
// lib/admin/nav.ts
export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin" }] },
  { label: "Catalog", items: [
    { label: "Coaching", href: "/admin/coaching" },
    { label: "Batches", href: "/admin/batches" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Cities & States", href: "/admin/cities" },
  ]},
  { label: "Community", items: [
    { label: "Students", href: "/admin/students" },
    { label: "Requirement Posts", href: "/admin/requirements" },
    { label: "Discount Requests", href: "/admin/discount-requests" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
  ]},
  { label: "Content", items: [
    { label: "Blog", href: "/admin/blogs" },
    { label: "Testimonials", href: "/admin/testimonials" },
    { label: "Media Library", href: "/admin/media" },
  ]},
  { label: "System", items: [
    { label: "Moderation", href: "/admin/moderation" },
    { label: "SEO", href: "/admin/seo" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Settings", href: "/admin/settings" },
    { label: "Audit Logs", href: "/admin/audit-logs" },
    { label: "Users", href: "/admin/users" },
  ]},
];
```

- [ ] **Step 4: Implement the shell components** (`admin-sidebar.tsx` renders `adminNav` with active-link highlighting via `usePathname`; `admin-topbar.tsx` shows the admin name + a sign-out button; `admin-shell.tsx` composes sidebar + topbar + `{children}` in the Growth-Emerald style). Write `admin-shell.test.tsx` asserting the sidebar renders all five group labels. Keep components presentational; data comes from props.

- [ ] **Step 5: Implement the guarded panel layout**

```tsx
// app/admin/(panel)/layout.tsx
import { requireAdmin } from "@/lib/server/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <AdminShell admin={{ name: profile.full_name ?? profile.email ?? "Admin" }}>{children}</AdminShell>;
}
```

- [ ] **Step 6: Run tests → PASS. Typecheck + build clean.**

- [ ] **Step 7: Commit**

```bash
git add lib/admin/nav.ts lib/admin/nav.test.ts components/admin/ "app/admin/(panel)/layout.tsx"
git commit -m "feat(admin): admin shell (sidebar, topbar, guarded panel layout)"
```

---

## Task 10: Login portal — password step + PIN step

**Files:**
- Create: `features/admin-auth/actions.ts` (server actions), `features/admin-auth/actions.test.ts`
- Create: `app/admin/login-portal/page.tsx` (client form, two steps)

- [ ] **Step 1: Write the failing test for the sign-in action** (mock supabase auth + profiles + pin)

```ts
// features/admin-auth/actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const single = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { signInWithPassword, signOut },
    from: () => ({ select: () => ({ eq: () => ({ single }) }) }),
  }),
}));
beforeEach(() => { signInWithPassword.mockReset(); signOut.mockReset(); single.mockReset(); });

describe("signInAdmin", () => {
  it("signs out and errors when the user is not an admin", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    single.mockResolvedValue({ data: { id: "u1", role: "student" } });
    const { signInAdmin } = await import("./actions");
    const res = await signInAdmin({ email: "a@x.dev", password: "pw123456" });
    expect(res.ok).toBe(false);
    expect(signOut).toHaveBeenCalled();
  });

  it("succeeds for an admin", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    single.mockResolvedValue({ data: { id: "u1", role: "admin" } });
    const { signInAdmin } = await import("./actions");
    expect(await signInAdmin({ email: "a@x.dev", password: "pw123456" })).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `features/admin-auth/actions.ts`** with two server actions:

```ts
// features/admin-auth/actions.ts
"use server";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/server/pin";
import { ADMIN_UNLOCK_COOKIE, ADMIN_UNLOCK_TTL_MS, signAdminToken } from "@/lib/server/admin-session";

const credsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const pinSchema = z.object({ pin: z.string().regex(/^\d{8}$/) });

export async function signInAdmin(raw: unknown) {
  const p = credsSchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "Invalid credentials" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(p.data);
  if (error || !data.user) return { ok: false as const, error: "Invalid credentials" };
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", data.user.id).single();
  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { ok: false as const, error: "Not authorized" };
  }
  return { ok: true as const };
}

export async function verifyAdminPin(raw: unknown) {
  const p = pinSchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "Invalid PIN" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Session expired" };
  const admin = createAdminClient();
  const { data: row } = await admin.from("admin_users").select("security_pin_hash").eq("profile_id", user.id).single();
  if (!row || !verifyPin(p.data.pin, row.security_pin_hash)) {
    return { ok: false as const, error: "Incorrect PIN" };
  }
  const h = await headers();
  await admin.from("admin_users").update({
    last_login_at: new Date().toISOString(),
    last_ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  }).eq("profile_id", user.id);
  (await cookies()).set(ADMIN_UNLOCK_COOKIE, signAdminToken(user.id), {
    httpOnly: true, secure: true, sameSite: "strict", path: "/admin", maxAge: ADMIN_UNLOCK_TTL_MS / 1000,
  });
  return { ok: true as const };
}
```

- [ ] **Step 4: Implement `app/admin/login-portal/page.tsx`** — a client component with two stages:
  stage 1 (email+password → `signInAdmin`), on success advance to stage 2 (8-digit PIN →
  `verifyAdminPin`), on success `router.push("/admin")` and `router.refresh()`. Show inline errors.
  Use RHF + Zod (`credsSchema`, `pinSchema` re-exported) and the shared `FormShell`/`Input`.

- [ ] **Step 5: Run action tests → PASS. Typecheck + build clean.**

- [ ] **Step 6: Commit**

```bash
git add features/admin-auth/ app/admin/login-portal/
git commit -m "feat(admin): login portal (password step + server-verified PIN)"
```

---

## Task 11: Bootstrap script — create the first super admin

**Files:**
- Create: `scripts/create-admin.ts`

- [ ] **Step 1: Implement the script** (service-role; idempotent)

```ts
// scripts/create-admin.ts
/* Usage: npx tsx scripts/create-admin.ts <email> <password> <8-digit-pin>
   Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in the environment. */
import { createClient } from "@supabase/supabase-js";
import { hashPin } from "../lib/server/pin";

const [email, password, pin] = process.argv.slice(2);
if (!email || !password || !/^\d{8}$/.test(pin ?? "")) {
  console.error("Usage: tsx scripts/create-admin.ts <email> <password> <8-digit-pin>");
  process.exit(1);
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error && !error.message.includes("already been registered")) throw error;
const userId = created?.user?.id
  ?? (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === email)?.id;
if (!userId) throw new Error("Could not resolve user id");

await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
await admin.from("admin_users").upsert(
  { profile_id: userId, security_pin_hash: hashPin(pin!) },
  { onConflict: "profile_id" },
);
console.log(`✓ Super admin ready: ${email}`);
```

- [ ] **Step 2: Add a script alias to `package.json`**

```json
    "admin:create": "tsx scripts/create-admin.ts"
```

Install `tsx` as a dev dep only if not present: `npm install -D tsx`.

- [ ] **Step 3: Run against the hosted project** (uses `.env.local` values; load them into the shell)

Run: `npx tsx scripts/create-admin.ts admin@batchkart.com "<strong-password>" 12345678`
Expected: `✓ Super admin ready`. Verify via MCP/SQL that `profiles.role='admin'` and an
`admin_users` row exists. Do NOT commit real credentials.

- [ ] **Step 4: Commit** (script only, no secrets)

```bash
git add scripts/create-admin.ts package.json package-lock.json
git commit -m "feat(admin): bootstrap script for first super admin"
```

---

## Task 12: CRUD toolkit components

**Files:**
- Create under `components/admin/`: `data-table.tsx`, `filter-bar.tsx`, `pagination.tsx`, `form-shell.tsx`, `fields/` (`text-field.tsx`, `textarea-field.tsx`, `select-field.tsx`, `number-field.tsx`, `date-field.tsx`, `switch-field.tsx`, `slug-field.tsx`, `relation-field.tsx`, `media-field.tsx`), `moderation-pill.tsx`, `stat-card.tsx`, `bulk-action-bar.tsx`, `csv-export-button.tsx`, `confirm-dialog.tsx`, `empty-state.tsx`
- Tests: `data-table.test.tsx`, `filter-bar.test.tsx`, `form-shell.test.tsx`, `csv-export-button.test.tsx`

Build these presentational primitives test-first. Each is generic (typed by generics), takes data +
config via props, and emits callbacks; **no data fetching inside**. Minimum test coverage:

- [ ] **`data-table.tsx`** — props `{ columns, rows, getRowId, selectable?, onSelectionChange?, sort?, onSortChange? }`. Test: renders a header per column, a cell per `column.cell(row)`, and toggling a row checkbox calls `onSelectionChange` with the row id.
- [ ] **`filter-bar.tsx`** — props `{ filters, values, onChange }` for enum/boolean/date/text filters. Test: changing a select calls `onChange` with the new `{ key: value }`.
- [ ] **`pagination.tsx`** — props `{ page, pageCount, onPageChange }`. Test: prev disabled on page 1; clicking next calls `onPageChange(page+1)`.
- [ ] **`form-shell.tsx`** — props `{ schema, fields, defaultValues, onSubmit, submitLabel }`. Wraps RHF + `zodResolver`; renders a field component per `field.type`. Test: submitting with an invalid required field shows the Zod message and does not call `onSubmit`; valid submit calls `onSubmit` with typed values.
- [ ] **field components** — each binds to RHF context by `name`. Keep tiny + focused. `media-field` opens the media picker (built in Wave 3; until then it renders a plain URL input — no dead code, just a URL text field the picker later enhances).
- [ ] **`csv-export-button.tsx`** — props `{ rows, columns, filename }`. Test: `rowsToCsv(rows, columns)` (exported pure helper) produces a header line + one line per row with values escaped.
- [ ] **`moderation-pill.tsx`** — maps `moderation_status` → colored pill (draft/pending/published/rejected). Test: renders the status label.
- [ ] **`stat-card.tsx`, `bulk-action-bar.tsx`, `confirm-dialog.tsx`, `empty-state.tsx`** — presentational; one render test each.

- [ ] **Commit** after the set is green:

```bash
git add components/admin/
git commit -m "feat(admin): CRUD toolkit (data-table, filter-bar, form-shell, fields, exports)"
```

---

## Task 13: Resource config type + generic DAL

**Files:**
- Create: `lib/admin/resource-config.ts`, `lib/admin/resource-config.test.ts`
- Create: `lib/server/resource.ts`, `lib/server/resource.test.ts`

- [ ] **Step 1: Define the config types + a query-params helper (test-first)**

`resource-config.ts` exports `ResourceConfig<T>` (as in the spec §6.2) and pure helpers:
`parseListParams(searchParams)` → `{ page, pageSize, sort, search, filters }` with safe defaults
(page 1, pageSize 20). Test `parseListParams` for defaults, clamping, and sort parsing.

- [ ] **Step 2: Implement the generic DAL (test-first with a mocked query builder)**

`lib/server/resource.ts` exports `listResource(config, params)`, `getResource(config, id)`,
`createResource(config, values, ctx)`, `updateResource(config, id, values, ctx)`,
`deleteResource(config, id, ctx)`. List builds a range query (`.range(from, to)`), applies
`search` via `ilike`/`or` across `config.searchColumns`, applies `filters`, `order` by sort, and
returns `{ rows, total }`. Create/update/delete go through `adminAction` (so they validate + audit);
create sets auto-publish fields when `config.autoPublish`. Test: `listResource` calls `range` with
the right offsets for page 2; `createResource` on an `autoPublish` config includes
`moderation_status: 'published'` + `published_at`.

- [ ] **Step 3: Run tests → PASS. Typecheck clean.**

- [ ] **Step 4: Commit**

```bash
git add lib/admin/resource-config.ts lib/admin/resource-config.test.ts lib/server/resource.ts lib/server/resource.test.ts
git commit -m "feat(admin): resource-config types + generic CRUD DAL"
```

---

## Task 14: KPI dashboard (`/admin`)

**Files:**
- Create: `features/admin-dashboard/queries.ts`, `queries.test.ts`
- Create: `app/admin/(panel)/page.tsx`

- [ ] **Step 1: Test the KPI aggregation** (mock client `head:true, count:'exact'` calls)

```ts
// features/admin-dashboard/queries.test.ts — asserts getKpis returns the six counts shape
```

- [ ] **Step 2: Implement `getKpis()`** returning `{ students, coaching, batches, pendingDiscountRequests, pendingModeration }` via `count: "exact", head: true` queries (RLS admin), plus `getRecentDiscountRequests(limit)` and `getRecentAudit(limit)`.

- [ ] **Step 3: Implement `app/admin/(panel)/page.tsx`** — server component: `requireAdmin()` (inherited from layout), fetch KPIs, render `StatCard`s, a recent discount-requests table with inline approve/reject (wired in Wave 2 to the discount-request actions; until then link to the section), and an audit activity feed.

- [ ] **Step 4: Run tests → PASS. Build clean; `/admin` renders after login.**

- [ ] **Step 5: Commit**

```bash
git add features/admin-dashboard/ "app/admin/(panel)/page.tsx"
git commit -m "feat(admin): KPI dashboard overview"
```

---

## Wave 0 checkpoint

- [ ] `npm run typecheck` clean · `npm test` green · `npm run build` succeeds.
- [ ] Manual: run the bootstrap script, log in at `/admin/login-portal` (password → PIN), land on
  `/admin`; visiting `/admin/coaching` while logged out redirects to the portal.

---

# Resource Task Recipe (used by every CRUD section in Waves 1–4)

Each standard section is one task that follows these **exact steps**. The only thing that differs
per resource is its config file (the code blocks given per task below). Do NOT re-derive the
framework — Wave 0 built it.

- [ ] **Step A — Schema test.** Create `lib/admin/resources/<name>.test.ts` asserting the config's
  `form.schema` rejects a missing required field and accepts a valid object (use the values shown in
  the task). Run → FAIL.
- [ ] **Step B — Config.** Create `lib/admin/resources/<name>.ts` exporting `<name>Resource:
  ResourceConfig<"<table>">` with the `listColumns`, `searchColumns`, `filters`, `defaultSort`,
  `form.schema`, `form.fields`, `autoPublish`, and any `actions` from the task. Run schema test → PASS.
- [ ] **Step C — Actions.** Create `app/admin/(panel)/<route>/actions.ts`:
  `"use server"; export const create<Name> = createResource.bind(null, <name>Resource);` (and
  `update<Name>`, `delete<Name>` similarly). These inherit validation + audit from `adminAction`.
- [ ] **Step D — Routes.** Create thin wrappers passing the config to the toolkit:
  `app/admin/(panel)/<route>/page.tsx` (server: `parseListParams` → `listResource` → `<DataTable>` +
  `<FilterBar>` + `<Pagination>` + `<CsvExportButton>`), `.../new/page.tsx` (`<FormShell>` → create
  action), `.../[id]/edit/page.tsx` (`getResource` → `<FormShell>` → update action + `<ConfirmDialog>`
  delete). Bulk delete uses `<BulkActionBar>`.
- [ ] **Step E — Integration test.** `app/admin/(panel)/<route>/page.test.tsx` renders the list with a
  mocked `listResource` and asserts the column headers appear.
- [ ] **Step F — Verify + commit.** `npm test <name>` + `npm run typecheck` → clean.
  `git add lib/admin/resources/<name>.* "app/admin/(panel)/<route>/"` then
  `git commit -m "feat(admin): <Name> section (CRUD)"`.

---

# WAVE 1 — Catalog

## Task 15: Categories section (fully-worked recipe example)

**Route:** `/admin/categories` · **Table:** `exam_categories` · `autoPublish`: n/a.

- [ ] **Step A — Schema test**

```ts
// lib/admin/resources/categories.test.ts
import { describe, it, expect } from "vitest";
import { categoriesResource } from "./categories";
describe("categoriesResource.form.schema", () => {
  it("requires name and slug", () => {
    expect(categoriesResource.form.schema.safeParse({ name: "", slug: "" }).success).toBe(false);
  });
  it("accepts a valid category", () => {
    expect(categoriesResource.form.schema.safeParse({
      name: "JEE", slug: "jee", icon: "GraduationCap", sort_order: 1, is_active: true,
    }).success).toBe(true);
  });
});
```

- [ ] **Step B — Config**

```ts
// lib/admin/resources/categories.ts
import { z } from "zod";
import type { ResourceConfig } from "@/lib/admin/resource-config";

export const categoriesResource: ResourceConfig<"exam_categories"> = {
  table: "exam_categories",
  label: { singular: "Category", plural: "Categories" },
  searchColumns: ["name", "slug"],
  defaultSort: { column: "sort_order", dir: "asc" },
  filters: [{ key: "is_active", type: "boolean", label: "Active" }],
  listColumns: [
    { key: "name", header: "Name", cell: (r) => r.name },
    { key: "slug", header: "Slug", cell: (r) => r.slug },
    { key: "sort_order", header: "Order", cell: (r) => String(r.sort_order) },
    { key: "is_active", header: "Active", cell: (r) => (r.is_active ? "Yes" : "No") },
  ],
  form: {
    schema: z.object({
      name: z.string().min(1),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
      icon: z.string().optional(),
      parent_id: z.string().uuid().nullish(),
      description: z.string().optional(),
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
    fields: [
      { name: "name", type: "text", label: "Name" },
      { name: "slug", type: "slug", label: "Slug", from: "name" },
      { name: "icon", type: "text", label: "Icon (lucide name)" },
      { name: "parent_id", type: "relation", label: "Parent", relation: { table: "exam_categories", labelColumn: "name" } },
      { name: "description", type: "textarea", label: "Description" },
      { name: "sort_order", type: "number", label: "Sort order" },
      { name: "is_active", type: "switch", label: "Active" },
    ],
  },
};
```

- [ ] **Steps C–F** — follow the Resource Task Recipe (actions, routes, integration test, commit).

---

## Task 16: States section

**Route:** `/admin/cities` (States tab) · **Table:** `states`. Config `searchColumns:["name","slug"]`,
columns name/slug/code, schema `{ name: min1, slug: kebab, code: optional }`. Follow the recipe.
(States + Cities share the `/admin/cities` page via two tabs; build States first as its own config.)

## Task 17: Cities section

**Route:** `/admin/cities` · **Table:** `cities`. Columns name/slug/state (relation)/is_popular;
filters `is_popular` (boolean) + `state_id` (relation); schema
`{ state_id: uuid, name: min1, slug: kebab, is_popular: bool, latitude?: num, longitude?: num }`;
fields include a `relation` field to `states`. Follow the recipe; render States + Cities as two tabs
on the page.

## Task 18: Coaching section (composite — institute + nested branches/faculty/discounts/FAQs)

**Route:** `/admin/coaching` · **Table:** `coaching_institutes` · **`autoPublish: true`**.

- [ ] Config `coachingResource` — columns name/city-count/rating/moderation (via `<ModerationPill>`)/
  verified; filters `moderation_status` (enum), `is_verified` (boolean); searchColumns `["name","slug"]`;
  schema `{ name, slug, description?, logo_url?, cover_url?, contact_email?, contact_phone?,
  website_url?, is_verified: bool }`; fields include `media` fields for logo/cover. `autoPublish: true`
  → create sets `moderation_status:'published', published_at: now`.
- [ ] **Detail page** `app/admin/(panel)/coaching/[id]/page.tsx` — tabs: Overview (edit form),
  Branches, Faculty, Discounts, FAQs. Each nested tab is a mini-DataTable + inline create/edit bound to
  its child table (`coaching_branches`, `coaching_faculty`, `discounts`, `faqs`) scoped by `coaching_id`.
  Reuse `data-table` + `form-shell`; child configs live in `lib/admin/resources/coaching-*.ts`.
- [ ] Tests: institute schema; a branch create scoped to the coaching id. Commit per sub-part.

## Task 19: Batches section

**Route:** `/admin/batches` · **Table:** `batches` · **`autoPublish: true`**. Columns
name/coaching(relation)/exam(relation)/mode/fee/moderation pill/status; filters `moderation_status`,
`status`, `mode`, `exam_id`(relation), `coaching_id`(relation); searchColumns `["name","teacher"]`
(also expose search via `search_vector` in the DAL when a text query is present); schema covers
`coaching_id, branch_id?, exam_id, name, slug, teacher?, mode, language, fee?, discounted_fee?,
fee_type, start_date?, duration_months?, seats_total?, seats_left?, scholarship_available,
curriculum(json)`. Fields use `relation` (coaching/branch/exam) + `select` (enums) + `date` + `number`
+ `switch`. Follow the recipe.

## Task 20: Discounts section

**Route:** `/admin/discounts` · **Table:** `discounts`. Columns title/coaching/percent/amount/
valid_to/is_active; filters `is_active`, `coaching_id`; schema `{ coaching_id, batch_id?, title,
percent?, amount?, code?, valid_from?, valid_to?, is_active }`. Follow the recipe.

## Wave 1 checkpoint
- [ ] All catalog sections list/create/edit/delete; admin creates are auto-published; `npm test`,
  `typecheck`, `build` clean.

---

# WAVE 2 — Community

## Task 21: Students section (read + limited manage)

**Route:** `/admin/students` · **Table:** `profiles` (RLS admin read-all). Columns
full_name/email/phone/role/city(relation)/created_at; filters `role`, `city_id`; searchColumns
`["full_name","email","phone"]`. Edit is limited (e.g. toggle `role`, correct contact fields) —
schema only exposes editable fields; **no create/delete** (accounts come from auth). Follow the recipe
minus create/delete. A read of `auth.users`-only fields (email confirmed / last sign-in) uses the
service-role client in the DAL for this section only.

## Task 22: Requirement Posts section

**Route:** `/admin/requirements` · **Table:** `requirement_posts`. Columns student(relation)/exam/
city/status/study_start_date; filters `status`, `exam_id`, `city_id`; edit allows `status` changes
(active/paused/archived). Follow the recipe (read + status edit; no admin create).

## Task 23: Discount Requests section (custom review actions)

**Route:** `/admin/discount-requests` · **Table:** `discount_requests`.

- [ ] Config columns student/batch/reason_type/status(pill)/created_at; filters `status`, `reason_type`.
- [ ] **Custom actions** in `app/admin/(panel)/discount-requests/actions.ts` via `adminAction`:
  `approveDiscountRequest({ id, admin_note? })` and `rejectDiscountRequest({ id, admin_note })` set
  `status`, `admin_note`, `reviewed_by = ctx.userId`, and insert a `notifications` row for the student
  (`type: 'discount_approved' | 'discount_rejected'`). **Email is NOT sent this phase.**
- [ ] Test: approve sets status `approved` + writes a notification (mock client asserts both calls).
- [ ] The list row shows inline Approve/Reject buttons + a note dialog. The KPI dashboard's recent-
  requests widget (Task 14) now imports these actions. Commit.

## Task 24: Reviews section (moderation)

**Route:** `/admin/reviews` · **Table:** `reviews`. Columns coaching/author/rating/status(pill)/
created_at; filters `status`, `coaching_id`. Custom actions `approveReview`/`rejectReview` set
`status` (the DB trigger recomputes `coaching_institutes.rating_avg/count`). Test: approving flips
status to `approved`. Follow the recipe + custom actions.

## Task 25: Reports section

**Route:** `/admin/reports` · **Table:** `reports`. Columns entity_type/entity_id/reason/status(pill)/
created_at; filters `status`, `entity_type`. Edit = status transitions
(open/reviewing/resolved/dismissed). Follow the recipe (read + status edit).

## Wave 2 checkpoint
- [ ] Discount requests approve/reject writes status + notification; reviews moderation recomputes
  ratings; `npm test`, `typecheck`, `build` clean.

---

# WAVE 3 — Content

## Task 26: Blog Categories section

**Route:** `/admin/blogs` (Categories tab) · **Table:** `blog_categories`. Columns name/slug/
description; schema `{ name, slug: kebab, description? }`. Follow the recipe.

## Task 27: Blog Posts section

**Route:** `/admin/blogs` · **Table:** `blog_posts`. Columns title/category(relation)/status(pill)/
published_at; filters `status`, `category_id`; searchColumns `["title","slug"]`; schema
`{ category_id?, title, slug: kebab, excerpt?, cover_url?, content?, reading_time?, status, seo(json) }`.
`content` uses a large `textarea` field (rich editor deferred). Publishing sets `published_at` when
`status → published`. Follow the recipe; render Posts + Categories as tabs.

## Task 28: Testimonials section

**Route:** `/admin/testimonials` · **Table:** `testimonials`. Columns name/exam/rating/is_featured;
filters `is_featured`; schema `{ name, role?, exam?, avatar_url?, quote, rating?(1..5), is_featured }`.
Follow the recipe.

## Task 29: Media Library (upload + picker)

**Route:** `/admin/media` · **Table:** `media` · **Bucket:** `media`.

- [ ] **Upload action** `app/admin/(panel)/media/actions.ts` via `adminAction`: validates file
  type/size (Zod on metadata), uploads to the `media` storage bucket (path `media/<uuid>-<name>`), then
  inserts a `media` row (url, type, size, folder, alt_text, width, height). Test the metadata schema +
  that a successful upload inserts a row (mock storage + client).
- [ ] **Grid page** `page.tsx` — a media grid (not DataTable) with search + upload dropzone + delete.
- [ ] **Wire `media-field`** (Task 12) to open a picker dialog listing this grid and return the chosen
  `url`; forms using logo/cover/avatar now use it. Commit.

## Wave 3 checkpoint
- [ ] Blog + testimonials CRUD; media upload + picker works end-to-end; `npm test`, `typecheck`,
  `build` clean.

---

# WAVE 4 — System

## Task 30: Moderation queue

**Route:** `/admin/moderation`. A cross-entity read view (not a single table): lists
`coaching_institutes` + `batches` where `moderation_status = 'pending'`, each with Approve/Reject
actions (`approveModeration`/`rejectModeration` via `adminAction` set `moderation_status` +
`published_at` + `reviewed_by`). Mostly empty until coaching self-serve exists, but built + tested
(mock returns one pending batch; approve flips it to published).

## Task 31: SEO editor

**Route:** `/admin/seo` · **Table:** `settings` (group `seo`). A key/value editor for the `seo.*`
settings rows (e.g. `seo.defaults` JSON: title/description/ogImage) via a `FormShell` bound to a Zod
schema; save upserts the `settings` row through `adminAction`. Test the schema + upsert call.

## Task 32: Settings editor

**Route:** `/admin/settings` · **Table:** `settings` (groups `homepage`, `general`). Editors for
`homepage.trust_stats` and `general.feature_flags` (typed Zod schemas → `switch`/`number` fields).
Upsert via `adminAction`. Test schemas + upsert.

## Task 33: Analytics

**Route:** `/admin/analytics`. A read-only KPIs/trends page reusing `getKpis` (Task 14) plus a few
derived aggregates (e.g. batches per exam, requirements per status) rendered as `StatCard`s + simple
tables. No writes. Test the aggregate query shapes.

## Task 34: Audit Logs viewer

**Route:** `/admin/audit-logs` · **Table:** `audit_logs` (read-only). DataTable columns
actor(relation)/action/entity_type/entity_id/created_at; filters `action`, `entity_type`, actor;
a row-expand shows the `changes` before/after JSON. No create/edit/delete. Follow the recipe (read-only).

## Task 35: Users (admin_users)

**Route:** `/admin/users` · **Table:** `admin_users` (+ `profiles`). List admins (join profile
name/email, `last_login_at`). Actions: **invite/create admin** (service-role: create auth user →
`profiles.role='admin'` → `admin_users` with a set PIN) reusing the bootstrap logic in a server action;
**reset PIN** (`update admin_users.security_pin_hash = hashPin(newPin)`); **revoke** (delete
`admin_users` row + set `profiles.role='student'`). All via `adminAction` (audited). Test PIN-reset +
create paths (mock service client).

## Wave 4 checkpoint
- [ ] Moderation, SEO, Settings, Analytics, Audit viewer, Users all work; `npm test`, `typecheck`,
  `build` clean.

---

## Final phase gate (Task 36)

- [ ] `npm run typecheck` → no errors.
- [ ] `npm test` → all unit + component tests green.
- [ ] `npm run build` → succeeds (middleware + all admin routes compile).
- [ ] **Manual end-to-end** (against the hosted project): bootstrap an admin; log in (password →
  PIN); create a coaching (auto-published) + a batch; approve a discount request (notification row
  written); upload media and pick it in a form; confirm each write produced an `audit_logs` row via the
  Audit Logs viewer; log-out/expired-token redirects to the portal.
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` never appears in client bundle (grep `.next` build output).

---

## Definition of Done (Phase 1b)

- Seeded super admin logs in at `/admin/login-portal` (password → PIN) and reaches `/admin`; the
  triple guard (middleware → panel layout → `adminAction`) blocks unauthenticated/unlocked access.
- Every spec §9 section supports list + search + filter + pagination + create/edit/delete (+ bulk +
  CSV where applicable); catalog creates are auto-published.
- Discount requests approve/reject inline (status + notification); reviews moderation recomputes
  ratings; media upload + picker work; audit viewer shows every write.
- `npm run typecheck` clean · `npm test` green · `npm run build` succeeds · service key server-only.

**Next:** Phase 2 — Public site (homepage, `/batches` search + filters, batch/coaching/exam/city
pages, SEO infrastructure) rendering the admin-entered data.

---

## Self-review notes (author)

- **Spec coverage:** every spec §9 nav item maps to a task (Overview→T14; Catalog→T15–20;
  Community→T21–25; Content→T26–29; System→T30–35). Auth (§4)→T1–11; framework (§6)→T12–13; env
  (§9)→T1; security (§10) → triple guard across T5/T7/T6; testing (§11) → per-task vitest.
- **Placeholders:** the `media-field` explicitly degrades to a URL input until Task 29 (no dead code);
  no "TBD"/"handle edge cases" left.
- **Type consistency:** `adminAction`, `requireAdmin`/`AdminContext`, `ResourceConfig<T>`,
  `createResource`/`listResource`, `ADMIN_UNLOCK_COOKIE`, `signAdminToken`/`verifyAdminToken`,
  `hashPin`/`verifyPin` are named identically wherever referenced across tasks.
