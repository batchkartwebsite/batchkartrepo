import { createClient } from "@/lib/supabase/server";
import { ContactListView } from "./list-view";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: queries } = await supabase
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: batches } = await supabase.from("batches").select("id, name");

  const batchNames: Record<string, string> = Object.fromEntries(
    (batches ?? []).map((b) => [b.id, b.name]),
  );

  return <ContactListView rows={queries ?? []} batchNames={batchNames} />;
}
