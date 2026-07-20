import { NextResponse, type NextRequest } from "next/server";
import { buildCspHeader, securityHeaders } from "@/lib/security/headers";

const isDev = process.env.NODE_ENV === "development";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", buildCspHeader(isDev));
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // all paths except static assets and image optimization
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
