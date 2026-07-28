import { createClient } from "@/lib/supabase/server";
import { EnquiriesListView } from "./list-view";

export default async function EnquiriesPage() {
  const supabase = await createClient();
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: batches } = await supabase.from("batches").select("id, name");

  const batchNames: Record<string, string> = Object.fromEntries(
    (batches ?? []).map((b) => [b.id, b.name]),
  );

  return <EnquiriesListView rows={enquiries ?? []} batchNames={batchNames} />;
}
