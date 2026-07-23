import type { ReactNode } from "react";
import type { ZodType } from "zod";
import type { Database } from "@/lib/supabase/database.types";

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

export type ColumnDef<T extends TableName> = {
  key: string;
  header: string;
  cell: (row: Row<T>) => ReactNode;
};

export type FilterDef<T extends TableName> = {
  key: Extract<keyof Row<T>, string>;
  label: string;
  type: "boolean" | "enum" | "date" | "text" | "relation";
  options?: { label: string; value: string }[];
  relation?: { table: TableName; labelColumn: string };
};

export type FieldType =
  | "text" | "textarea" | "number" | "date" | "switch"
  | "slug" | "select" | "relation" | "media";

export type FieldDef<T extends TableName> = {
  name: Extract<keyof Row<T>, string>;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  relation?: { table: TableName; labelColumn: string };
  from?: Extract<keyof Row<T>, string>;
  placeholder?: string;
};

export type CustomAction = { key: string; label: string };

export type ResourceConfig<T extends TableName> = {
  table: T;
  label: { singular: string; plural: string };
  listColumns: ColumnDef<T>[];
  searchColumns: Extract<keyof Row<T>, string>[];
  filters: FilterDef<T>[];
  defaultSort: { column: Extract<keyof Row<T>, string>; dir: "asc" | "desc" };
  form: { schema: ZodType; fields: FieldDef<T>[] };
  actions?: CustomAction[];
  autoPublish?: boolean;
};

export type ListParams = {
  page: number;
  pageSize: number;
  sort?: { column: string; dir: "asc" | "desc" };
  search?: string;
  filters: Record<string, string>;
};

export function parseListParams(
  sp: Record<string, string | string[] | undefined>,
): ListParams {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const pageSizeRaw = Number(first(sp.pageSize)) || 20;
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw));
  const sortCol = first(sp.sort);
  const dir = first(sp.dir) === "desc" ? "desc" : "asc";
  const search = first(sp.search) || undefined;
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (["page", "pageSize", "sort", "dir", "search"].includes(k)) continue;
    const val = first(v);
    if (val != null && val !== "") filters[k] = val;
  }
  return { page, pageSize, sort: sortCol ? { column: sortCol, dir } : undefined, search, filters };
}
