import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Catalog = { activeCoaching: Set<string>; activeExams: Set<string> };

/**
 * Active coaching + exam names. As anon, RLS already returns only active rows;
 * as admin it returns all, so we filter by `is_active` either way. Returns null
 * on failure so callers can fail open (don't hide content on a transient error).
 */
export async function getActiveCatalog(): Promise<Catalog | null> {
  try {
    const supabase = await createClient();
    const [{ data: coaching }, { data: exams }] = await Promise.all([
      supabase.from("coaching_centers").select("name, is_active"),
      supabase.from("exams").select("name, is_active"),
    ]);
    return {
      activeCoaching: new Set((coaching ?? []).filter((c) => c.is_active).map((c) => c.name)),
      activeExams: new Set((exams ?? []).filter((e) => e.is_active).map((e) => e.name)),
    };
  } catch {
    return null;
  }
}

/** Active exam names (for the contact form dropdown). Empty on failure. */
export async function getActiveExamNames(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("exams")
      .select("name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    return (data ?? []).map((e) => e.name);
  } catch {
    return [];
  }
}

export function isBatchVisible(
  batch: { institute_name: string | null; exam: string | null },
  cat: Catalog | null,
): boolean {
  if (!cat) return true; // fail open
  if (batch.institute_name && !cat.activeCoaching.has(batch.institute_name)) return false;
  if (batch.exam && !cat.activeExams.has(batch.exam)) return false;
  return true;
}

/** Human-readable reason a batch is hidden (for the admin list), or null. */
export function blockedReason(
  batch: { institute_name: string | null; exam: string | null },
  cat: Catalog | null,
): string | null {
  if (!cat) return null;
  const reasons: string[] = [];
  if (batch.institute_name && !cat.activeCoaching.has(batch.institute_name)) {
    reasons.push(`Coaching “${batch.institute_name}” is turned off`);
  }
  if (batch.exam && !cat.activeExams.has(batch.exam)) {
    reasons.push(`Exam “${batch.exam}” is turned off`);
  }
  return reasons.length ? reasons.join(" · ") : null;
}
