"use client";

import { useFormContext } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FIELD_CLASSES, FieldWrapper, type AnyFieldError } from "./shared";

export function SelectField<T extends TableName>({ field }: { field: FieldDef<T> }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error: AnyFieldError = errors[field.name];

  return (
    <FieldWrapper field={field} error={error}>
      <select
        id={field.name}
        aria-invalid={error ? "true" : undefined}
        className={FIELD_CLASSES}
        {...register(field.name)}
      >
        <option value="">— Select —</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
