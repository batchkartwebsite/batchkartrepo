"use client";

import { useFormContext } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FIELD_CLASSES, FieldWrapper, type AnyFieldError } from "./shared";

export function RelationField<T extends TableName>({ field }: { field: FieldDef<T> }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error: AnyFieldError = errors[field.name];

  // If options are provided render a select; otherwise accept a raw UUID via text input
  return (
    <FieldWrapper field={field} error={error}>
      {field.options && field.options.length > 0 ? (
        <select
          id={field.name}
          aria-invalid={error ? "true" : undefined}
          className={FIELD_CLASSES}
          {...register(field.name)}
        >
          <option value="">— Select —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.name}
          type="text"
          placeholder={field.placeholder ?? "UUID"}
          aria-invalid={error ? "true" : undefined}
          className={FIELD_CLASSES}
          {...register(field.name)}
        />
      )}
    </FieldWrapper>
  );
}
