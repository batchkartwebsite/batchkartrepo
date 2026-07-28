import { createClient } from "@/lib/supabase/server";
import { CoachingManager, type CoachingRow } from "@/components/admin/coaching-manager";
import { createCoaching, toggleCoaching, addCoachingCity, removeCoachingCity } from "./actions";

export default async function CoachingPage() {
  const supabase = await createClient();
  const [{ data: centers }, { data: cities }] = await Promise.all([
    supabase
      .from("coaching_centers")
      .select("id, name, logo_url, is_active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("coaching_cities").select("id, name, coaching_id").order("name", { ascending: true }),
  ]);

  const cityMap = new Map<string, { id: string; name: string }[]>();
  for (const c of cities ?? []) {
    const list = cityMap.get(c.coaching_id) ?? [];
    list.push({ id: c.id, name: c.name });
    cityMap.set(c.coaching_id, list);
  }

  const rows: CoachingRow[] = (centers ?? []).map((c) => ({
    ...c,
    cities: cityMap.get(c.id) ?? [],
  }));

  return (
    <CoachingManager
      rows={rows}
      create={createCoaching}
      toggle={toggleCoaching}
      addCity={addCoachingCity}
      removeCity={removeCoachingCity}
    />
  );
}
