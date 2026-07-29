"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";
import { failAction } from "@/lib/server/action-error";

const STATUSES = ["new", "contacted", "closed"] as const;

export async function updateEnquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false as const, error: "Invalid status" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) return failAction("enquiries.status", error, "Couldn't update the status.");
  return { ok: true as const };
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) return failAction("enquiries.delete", error, "Couldn't delete the enquiry.");
  return { ok: true as const };
}
