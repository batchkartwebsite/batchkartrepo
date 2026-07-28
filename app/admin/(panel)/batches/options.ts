import { createClient } from "@/lib/supabase/server";

/** Active coaching + exam names for the batch form dropdowns. */
export async function getBatchFormOptions() {
  const supabase = await createClient();
  const [{ data: coaching }, { data: exams }, { data: cities }] = await Promise.all([
    supabase
      .from("coaching_centers")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("exams")
      .select("name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("coaching_cities").select("name, coaching_id").order("name", { ascending: true }),
  ]);

  const idToName = new Map((coaching ?? []).map((c) => [c.id, c.name]));
  const cityByCoaching: Record<string, string[]> = {};
  for (const ct of cities ?? []) {
    const cname = idToName.get(ct.coaching_id);
    if (!cname) continue; // only cities of active coaching centers
    (cityByCoaching[cname] ??= []).push(ct.name);
  }

  return {
    coachingOptions: (coaching ?? []).map((c) => ({ label: c.name, value: c.name })),
    examOptions: (exams ?? []).map((e) => ({ label: e.name, value: e.name })),
    cityByCoaching,
  };
}
