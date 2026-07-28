"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";

const STATUSES = ["new", "contacted", "closed"] as const;

export async function updateQueryStatus(id: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false as const, error: "Invalid status" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("queries").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function deleteQuery(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("queries").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
