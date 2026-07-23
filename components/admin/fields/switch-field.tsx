"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FieldWrapper, type AnyFieldError } from "./shared";

export function SwitchField<T extends TableName>({ field }: { field: FieldDef<T> }) {
  const { control, formState: { errors } } = useFormContext();
  const error: AnyFieldError = errors[field.name];

  return (
    <FieldWrapper field={field} error={error}>
      <Controller
        control={control}
        name={field.name}
        render={({ field: rhfField }) => (
          <label className="inline-flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                id={field.name}
                type="checkbox"
                className="sr-only"
                checked={Boolean(rhfField.value)}
                onChange={(e) => rhfField.onChange(e.target.checked)}
                onBlur={rhfField.onBlur}
                ref={rhfField.ref}
                aria-invalid={error ? "true" : undefined}
              />
              {/* Track */}
              <div
                aria-hidden="true"
                className={[
                  "h-5 w-9 rounded-full border transition-colors",
                  rhfField.value
                    ? "border-emerald-600 bg-emerald-600"
                    : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700",
                ].join(" ")}
              />
              {/* Thumb */}
              <div
                aria-hidden="true"
                className={[
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  rhfField.value ? "translate-x-4" : "translate-x-0.5",
                ].join(" ")}
              />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {rhfField.value ? "Yes" : "No"}
            </span>
          </label>
        )}
      />
    </FieldWrapper>
  );
}
