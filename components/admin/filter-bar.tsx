"use client";

import type { FilterDef, TableName } from "@/lib/admin/resource-config";

const CONTROL_CLASS =
  "h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 dark:bg-slate-950 dark:text-slate-100";

export function FilterBar<T extends TableName>({
  filters,
  values,
  onChange,
}: {
  filters: FilterDef<T>[];
  values: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  function update(key: string, value: string) {
    const next = { ...values };
    if (value === "") {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  }

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map((filter) => {
        const value = values[filter.key] ?? "";
        return (
          <label key={filter.key} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {filter.label}
            </span>
            {filter.type === "boolean" ? (
              <select
                className={CONTROL_CLASS}
                value={value}
                onChange={(event) => update(filter.key, event.target.value)}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : filter.type === "enum" ? (
              <select
                className={CONTROL_CLASS}
                value={value}
                onChange={(event) => update(filter.key, event.target.value)}
              >
                <option value="">All</option>
                {(filter.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === "date" ? (
              <input
                type="date"
                className={CONTROL_CLASS}
                value={value}
                onChange={(event) => update(filter.key, event.target.value)}
              />
            ) : (
              <input
                type="text"
                className={CONTROL_CLASS}
                value={value}
                placeholder={filter.label}
                onChange={(event) => update(filter.key, event.target.value)}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}
