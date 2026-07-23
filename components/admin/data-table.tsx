"use client";

import type { ColumnDef, Row, TableName } from "@/lib/admin/resource-config";
import { cn } from "@/lib/utils";

type SortState = { column: string; dir: "asc" | "desc" };

export function DataTable<T extends TableName>({
  columns,
  rows,
  getRowId,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sort,
  onSortChange,
}: {
  columns: ColumnDef<T>[];
  rows: Row<T>[];
  getRowId: (row: Row<T>) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
}) {
  if (rows.length === 0) return null;

  const selected = new Set(selectedIds);
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(getRowId(row)));

  function toggleAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rows.map(getRowId));
  }

  function toggleRow(id: string) {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange([...next]);
  }

  function toggleSort(column: string) {
    if (!onSortChange) return;
    const dir: "asc" | "desc" =
      sort?.column === column && sort.dir === "asc" ? "desc" : "asc";
    onSortChange({ column, dir });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {selectable ? (
              <th className="w-10 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 rounded border-border accent-emerald-600"
                />
              </th>
            ) : null}
            {columns.map((column) => {
              const active = sort?.column === column.key;
              return (
                <th
                  key={column.key}
                  className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {onSortChange ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-slate-900 dark:hover:text-slate-100",
                        active && "text-slate-900 dark:text-slate-100",
                      )}
                    >
                      {column.header}
                      {active ? (
                        <span aria-hidden="true">
                          {sort?.dir === "asc" ? "↑" : "↓"}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const id = getRowId(row);
            const isSelected = selected.has(id);
            return (
              <tr
                key={id}
                className={cn(
                  "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                  isSelected && "bg-emerald-600/5 dark:bg-emerald-500/10",
                )}
              >
                {selectable ? (
                  <td className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select row"
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      className="size-4 rounded border-border accent-emerald-600"
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 py-2.5 text-slate-700 dark:text-slate-300"
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
