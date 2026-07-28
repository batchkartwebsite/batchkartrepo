import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { buildCspHeader, securityHeaders } from "@/lib/security/headers";
import { env } from "@/config/env";

const isDev = process.env.NODE_ENV === "development";

// ─── Admin gate logic (pure — no I/O, easy to unit-test) ──────────────────────

export type GateDecision = { type: "next" } | { type: "redirect"; to: string };

export function adminGateDecision(pathname: string, hasSession: boolean): GateDecision {
  if (!pathname.startsWith("/admin")) return { type: "next" };
  if (pathname.startsWith("/admin/login-portal")) return { type: "next" };
  return hasSession ? { type: "next" } : { type: "redirect", to: "/admin/login-portal" };
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  // 1. Build the response and attach security headers (always).
  const response = NextResponse.next({ request });
  response.headers.set("Content-Security-Policy", buildCspHeader(isDev));
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // 2. Only guarded /admin routes need a Supabase session check. Public routes
  //    (and the login portal) skip it entirely, so a slow or unreachable DB
  //    never blocks or crashes public page loads.
  const { pathname } = request.nextUrl;
  const needsAuth = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login-portal");
  if (!needsAuth) return response;

  // 3. Supabase session refresh (writes refreshed cookies onto `response`).
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // A network failure reaching Supabase must not 500 the app — treat it as an
  // unauthenticated request and let the gate redirect to the login portal.
  let hasSession = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSession = Boolean(user);
  } catch {
    hasSession = false;
  }

  // 4. Admin gate
  const decision = adminGateDecision(pathname, hasSession);
  if (decision.type === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // all paths except static assets and image optimization
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
