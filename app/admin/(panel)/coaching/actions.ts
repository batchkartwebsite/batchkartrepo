"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";
import { failAction } from "@/lib/server/action-error";

const createSchema = z.object({
  name: z.string().min(2, "Enter a coaching name"),
  logo_url: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().url("Enter a valid logo URL").nullish(),
  ),
});

export async function createCoaching(raw: unknown) {
  await requireAdmin();
  const p = createSchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createClient();
  const { error } = await supabase.from("coaching_centers").insert({
    name: p.data.name.trim(),
    logo_url: (p.data.logo_url as string | null) ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false as const, error: "That coaching center already exists." };
    return failAction("coaching.create", error, "Couldn't create the coaching center.");
  }
  return { ok: true as const };
}

export async function toggleCoaching(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coaching_centers").update({ is_active: isActive }).eq("id", id);
  if (error) return failAction("coaching.toggle", error, "Couldn't update the coaching center.");
  return { ok: true as const };
}

// ── Cities (per coaching center) ─────────────────────────────────────────────
const citySchema = z.object({
  coaching_id: z.string().uuid(),
  name: z.string().min(1, "Enter a city"),
});

export async function addCoachingCity(raw: unknown) {
  await requireAdmin();
  const p = citySchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createClient();
  const { error } = await supabase.from("coaching_cities").insert({
    coaching_id: p.data.coaching_id,
    name: p.data.name.trim(),
  });
  if (error) {
    if (error.code === "23505") return { ok: false as const, error: "That city is already added." };
    return failAction("coaching.city.add", error, "Couldn't add the city.");
  }
  return { ok: true as const };
}

export async function removeCoachingCity(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coaching_cities").delete().eq("id", id);
  if (error) return failAction("coaching.city.remove", error, "Couldn't remove the city.");
  return { ok: true as const };
}
