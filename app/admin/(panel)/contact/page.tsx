import { createClient } from "@/lib/supabase/server";
import { ContactListView } from "./list-view";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: queries } = await supabase
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false });

  return <ContactListView rows={queries ?? []} />;
}
