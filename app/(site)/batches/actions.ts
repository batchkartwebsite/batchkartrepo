"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Public enquiry submission. Runs as the anon role; the `queries_public_insert`
// RLS policy permits the insert. No auth required.
const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().optional(),
  batch_id: z.string().uuid().optional().or(z.literal("")),
});

export async function submitQuery(raw: unknown) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, phone, email, message, batch_id } = parsed.data;
  const supabase = await createClient();
  // Attach the enquiry to the signed-in user (if any) so they can track it.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("queries").insert({
    name,
    phone,
    email: email || null,
    message: message || null,
    batch_id: batch_id || null,
    user_id: user?.id ?? null,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
