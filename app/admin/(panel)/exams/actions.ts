"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";

const createSchema = z.object({
  name: z.string().min(2, "Enter an exam name"),
});

export async function createExam(raw: unknown) {
  await requireAdmin();
  const p = createSchema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Invalid input" };
  const supabase = await createClient();
  const { error } = await supabase.from("exams").insert({ name: p.data.name.trim() });
  if (error) {
    return {
      ok: false as const,
      error: error.code === "23505" ? "That exam already exists." : error.message,
    };
  }
  return { ok: true as const };
}

export async function toggleExam(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("exams").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
