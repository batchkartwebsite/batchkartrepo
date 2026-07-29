"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { failAction } from "@/lib/server/action-error";

const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  exam: z.string().optional(),
  class_level: z.string().optional(),
  coaching_choices: z.array(z.string()).default([]),
  cities: z.array(z.string()).default([]),
  batch_ids: z.array(z.string()).default([]),
  budget: z.string().optional(),
  scholarship_reason: z.string().optional(),
  achievements: z.string().optional(),
});

export async function submitEnquiry(raw: unknown) {
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false as const, error: p.error.issues[0]?.message ?? "Invalid input" };
  const d = p.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const budgetNum = d.budget && d.budget.trim() !== "" ? Number(d.budget) : null;

  const { error } = await supabase.from("enquiries").insert({
    user_id: user?.id ?? null,
    name: d.name,
    phone: d.phone,
    email: d.email || null,
    exam: d.exam || null,
    class_level: d.class_level || null,
    coaching_choices: d.coaching_choices,
    cities: d.cities,
    batch_ids: d.batch_ids,
    budget: budgetNum != null && Number.isFinite(budgetNum) ? budgetNum : null,
    scholarship_reason: d.scholarship_reason || null,
    achievements: d.achievements || null,
  });
  if (error) return failAction("enquiries.insert", error, "We couldn't submit your enquiry. Please try again.");
  return { ok: true as const };
}
