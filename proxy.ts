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
  // 1. Build the response and attach security headers
  let response = NextResponse.next({ request });
  response.headers.set("Content-Security-Policy", buildCspHeader(isDev));
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // 2. Supabase session refresh (writes refreshed cookies onto `response`)
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Admin gate
  const decision = adminGateDecision(request.nextUrl.pathname, Boolean(user));
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
