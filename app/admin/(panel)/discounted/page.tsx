import { createClient } from "@/lib/supabase/server";
import { DiscountedListView } from "./list-view";

export default async function DiscountedPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("batches")
    .select("id, name, institute_name, exam, fee, discounted_fee")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return <DiscountedListView rows={data ?? []} />;
}
