import { createClient } from "@/lib/supabase/server";
import { getActiveCatalog, blockedReason } from "@/lib/server/catalog";
import { DiscountedListView } from "./list-view";

export default async function DiscountedPage() {
  const supabase = await createClient();
  const [{ data }, cat] = await Promise.all([
    supabase
      .from("batches")
      .select("id, name, institute_name, exam, fee, discounted_fee")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    getActiveCatalog(),
  ]);

  const rows = data ?? [];
  const blockedReasons: Record<string, string> = {};
  for (const b of rows) {
    const reason = blockedReason(b, cat);
    if (reason) blockedReasons[b.id] = reason;
  }

  return <DiscountedListView rows={rows} blockedReasons={blockedReasons} />;
}
