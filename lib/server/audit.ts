import "server-only";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Row = Record<string, unknown>;
export function diffChanges(before: Row | null, after: Row | null) {
  if (!before || !after) return { before: before ?? null, after: after ?? null };
  const b: Row = {}, a: Row = {};
  for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) { b[k] = before[k]; a[k] = after[k]; }
  }
  return { before: b, after: a };
}

export async function writeAuditLog(
  supabase: SupabaseClient<Database>,
  entry: { actorId: string; action: string; entityType: string; entityId?: string | null; before: Row | null; after: Row | null },
) {
  const h = await headers();
  await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    changes: diffChanges(entry.before, entry.after) as never,
    ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: h.get("user-agent") ?? null,
  });
}
