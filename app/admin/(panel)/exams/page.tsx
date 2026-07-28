import { createClient } from "@/lib/supabase/server";
import { LookupManager } from "@/components/admin/lookup-manager";
import { createExam, toggleExam } from "./actions";

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select("id, name, is_active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <LookupManager
      singular="Exam"
      description="Active exams appear in the batch form dropdown"
      rows={data ?? []}
      create={createExam}
      toggle={toggleExam}
    />
  );
}
