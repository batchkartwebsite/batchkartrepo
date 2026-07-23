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
