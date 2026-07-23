import "server-only";
import { createClient } from "@/lib/supabase/server";

async function countRows(
  table: string,
  apply?: (q: any) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<number> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = (supabase as any).from(table).select("*", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count } = await q;
  return count ?? 0;
}

export type Kpis = {
  students: number;
  coaching: number;
  batches: number;
  pendingDiscountRequests: number;
  pendingModeration: number;
};

export async function getKpis(): Promise<Kpis> {
  const [students, coaching, batches, pendingDiscountRequests, pendingModeration] =
    await Promise.all([
      countRows("profiles", (q) => q.eq("role", "student")),
      countRows("coaching_institutes"),
      countRows("batches"),
      countRows("discount_requests", (q) => q.eq("status", "pending")),
      countRows("batches", (q) => q.eq("moderation_status", "pending")),
    ]);
  return { students, coaching, batches, pendingDiscountRequests, pendingModeration };
}

export async function getRecentDiscountRequests(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discount_requests")
    .select("id, reason_type, status, created_at, student_id, batch_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentAudit(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
