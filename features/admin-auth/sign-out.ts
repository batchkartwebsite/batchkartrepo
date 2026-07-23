"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_UNLOCK_COOKIE } from "@/lib/server/admin-session";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(ADMIN_UNLOCK_COOKIE);
  redirect("/admin/login-portal");
}
