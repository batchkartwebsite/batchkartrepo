import "server-only";
import type { ZodType } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, type AdminContext } from "./require-admin";
import { writeAuditLog } from "./audit";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type Row = Record<string, unknown>;
export type ActionResult<O> = { ok: true; data: O } | { ok: false; error: string };

export function adminAction<I, O>(opts: {
  action: string;
  entityType: string;
  schema: ZodType<I>;
  handler: (
    input: I, ctx: AdminContext, supabase: SupabaseClient<Database>,
  ) => Promise<{ result: O; entityId?: string; before?: Row | null; after?: Row | null }>;
}): (raw: unknown) => Promise<ActionResult<O>> {
  return async (raw) => {
    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const ctx = await requireAdmin();
    const supabase = await createClient();
    try {
      const { result, entityId, before = null, after = null } = await opts.handler(parsed.data, ctx, supabase);
      await writeAuditLog(supabase, {
        actorId: ctx.userId, action: opts.action, entityType: opts.entityType,
        entityId, before, after,
      });
      return { ok: true, data: result };
    } catch (e) {
      console.error(`[action:${opts.action}]`, e);
      return { ok: false, error: "Action failed" };
    }
  };
}
