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
