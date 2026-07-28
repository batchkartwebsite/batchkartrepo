"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";

export async function setBatchDiscount(id: string, discountedFee: number | null) {
  await requireAdmin();
  if (discountedFee != null && (!Number.isFinite(discountedFee) || discountedFee < 0)) {
    return { ok: false as const, error: "Enter a valid amount" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("batches").update({ discounted_fee: discountedFee }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
