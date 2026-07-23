"use client";

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FIELD_CLASSES, FieldWrapper, type AnyFieldError } from "./shared";

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SlugField<T extends TableName>({ field }: { field: FieldDef<T> }) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const error: AnyFieldError = errors[field.name];

  // Track whether the user has manually edited the slug
  const userEditedRef = useRef(false);

  // Watch the source field if `field.from` is set.
  // Cast to string so RHF's overloaded generics accept any field path.
  const watchName = (field.from ?? "__none__") as string;
  const sourceValue = useWatch({ name: watchName });

  useEffect(() => {
    if (!field.from) return;
    if (userEditedRef.current) return;

    const currentSlug = getValues(field.name) as string | undefined;
    // Only auto-fill when the slug is empty / untouched
    if (currentSlug && currentSlug.trim() !== "") return;

    const derived = toSlug(String(sourceValue ?? ""));
    if (derived) {
      // Cast to string — useFormContext() is untyped and setValue expects a complex path type
      setValue(field.name as string, derived, { shouldValidate: false, shouldDirty: false });
    }
  }, [sourceValue, field.from, field.name, getValues, setValue]);

  const { onChange, ...rest } = register(field.name);

  return (
    <FieldWrapper field={field} error={error}>
      <input
        id={field.name}
        type="text"
        placeholder={field.placeholder ?? "auto-generated-slug"}
        aria-invalid={error ? "true" : undefined}
        className={FIELD_CLASSES}
        onChange={(e) => {
          userEditedRef.current = e.target.value !== "";
          void onChange(e);
        }}
        {...rest}
      />
    </FieldWrapper>
  );
}
