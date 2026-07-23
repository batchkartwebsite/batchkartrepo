"use client";

import { useFormContext } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FIELD_CLASSES, FieldWrapper, type AnyFieldError } from "./shared";

export function TextField<T extends TableName>({ field }: { field: FieldDef<T> }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error: AnyFieldError = errors[field.name];

  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.name}
        type="text"
        placeholder={field.placeholder}
        aria-invalid={error ? "true" : undefined}
        className={FIELD_CLASSES}
        {...register(field.name)}
      />
    </FieldWrapper>
  );
}
