"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/server/require-admin";
import { failAction } from "@/lib/server/action-error";

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
    if (error.code === "23505") return { ok: false as const, error: "That exam already exists." };
    return failAction("exams.create", error, "Couldn't create the exam.");
  }
  return { ok: true as const };
}

export async function toggleExam(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("exams").update({ is_active: isActive }).eq("id", id);
  if (error) return failAction("exams.toggle", error, "Couldn't update the exam.");
  return { ok: true as const };
}
