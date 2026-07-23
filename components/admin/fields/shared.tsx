"use client";

import type { ReactNode } from "react";
import type { FieldErrors } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";

/** FieldErrors[name] can be FieldError | nested object — use this wider type */
export type AnyFieldError = FieldErrors[string];

/** Input/control base classes — mirrors filter-bar.tsx CONTROL_CLASS with form adaptations */
export const FIELD_CLASSES =
  "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-rose-500/20 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export function FieldWrapper<T extends TableName>({
  field,
  error,
  children,
}: {
  field: FieldDef<T>;
  error: AnyFieldError;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={field.name}
        className="text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        {field.label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-rose-500 dark:text-rose-400">
          {String(error.message ?? "Invalid value")}
        </p>
      ) : null}
    </div>
  );
}
