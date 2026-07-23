"use server";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/server/pin";
import {
  ADMIN_UNLOCK_COOKIE,
  ADMIN_UNLOCK_TTL_MS,
  signAdminToken,
} from "@/lib/server/admin-session";
import { credsSchema, pinSchema } from "./schemas";

export async function signInAdmin(raw: unknown) {
  const p = credsSchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: "Invalid credentials" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(p.data);
  if (error || !data.user) return { ok: false as const, error: "Invalid credentials" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", data.user.id)
    .single();

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Session expired" };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("admin_users")
    .select("security_pin_hash")
    .eq("profile_id", user.id)
    .single();

  if (!row || !verifyPin(p.data.pin, row.security_pin_hash)) {
    return { ok: false as const, error: "Incorrect PIN" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // last_ip is typed as `unknown` in the generated DB types (inet column).
  // Cast to `never` only for that field to satisfy the Update payload type.
  await admin
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
      last_ip: ip as never,
    })
    .eq("profile_id", user.id);

  (await cookies()).set(ADMIN_UNLOCK_COOKIE, signAdminToken(user.id), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/admin",
    maxAge: ADMIN_UNLOCK_TTL_MS / 1000,
  });

  return { ok: true as const };
}
