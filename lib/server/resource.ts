import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./require-admin";
import { writeAuditLog } from "./audit";
import type { ActionResult } from "./admin-action";
import type { ResourceConfig, TableName, Row, ListParams } from "@/lib/admin/resource-config";

export async function listResource<T extends TableName>(
  config: ResourceConfig<T>,
  params: ListParams,
): Promise<{ rows: Row<T>[]; total: number }> {
  const supabase = await createClient();
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from(config.table).select("*", { count: "exact" });
  if (params.search && config.searchColumns.length) {
    const term = params.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      const ors = config.searchColumns.map((c) => `${String(c)}.ilike.%${term}%`).join(",");
      query = query.or(ors);
    }
  }
  for (const [key, value] of Object.entries(params.filters)) {
    if (value === "true" || value === "false") query = query.eq(key, value === "true");
    else query = query.eq(key, value);
  }
  const sort = params.sort ?? { column: String(config.defaultSort.column), dir: config.defaultSort.dir };
  query = query.order(sort.column, { ascending: sort.dir === "asc" });
  query = query.range(from, to);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Row<T>[], total: count ?? 0 };
}

export async function getResource<T extends TableName>(
  config: ResourceConfig<T>,
  id: string,
): Promise<Row<T> | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = await createClient();
  const { data } = await supabase.from(config.table).select("*").eq("id", id).single();
  return (data ?? null) as Row<T> | null;
}

export function createResource<T extends TableName>(config: ResourceConfig<T>) {
  return async (raw: unknown): Promise<ActionResult<Row<T>>> => {
    const parsed = config.form.schema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const ctx = await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = await createClient();
    const values: Record<string, unknown> = { ...(parsed.data as object) };
    if (config.autoPublish) {
      values.moderation_status = "published";
      values.published_at = new Date().toISOString();
    }
    const { data, error } = await supabase.from(config.table).insert(values).select().single();
    if (error) return { ok: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: ctx.userId, action: `${config.table}.create`, entityType: config.table,
      entityId: (data as { id?: string } | null)?.id ?? null, before: null, after: data as Record<string, unknown>,
    });
    return { ok: true, data: data as Row<T> };
  };
}

export function updateResource<T extends TableName>(config: ResourceConfig<T>) {
  return async (id: string, raw: unknown): Promise<ActionResult<Row<T>>> => {
    const parsed = config.form.schema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    const ctx = await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = await createClient();
    const { data: before } = await supabase.from(config.table).select("*").eq("id", id).single();
    const { data, error } = await supabase.from(config.table).update(parsed.data as never).eq("id", id).select().single();
    if (error) return { ok: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: ctx.userId, action: `${config.table}.update`, entityType: config.table, entityId: id,
      before: (before ?? null) as Record<string, unknown> | null, after: data as Record<string, unknown>,
    });
    return { ok: true, data: data as Row<T> };
  };
}

export function deleteResource<T extends TableName>(config: ResourceConfig<T>) {
  return async (id: string): Promise<ActionResult<null>> => {
    const ctx = await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = await createClient();
    const { data: before } = await supabase.from(config.table).select("*").eq("id", id).single();
    const { error } = await supabase.from(config.table).delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAuditLog(supabase, {
      actorId: ctx.userId, action: `${config.table}.delete`, entityType: config.table, entityId: id,
      before: (before ?? null) as Record<string, unknown> | null, after: null,
    });
    return { ok: true, data: null };
  };
}
