"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FormShell } from "@/components/admin/form-shell";
// Client component imports the config DIRECTLY (RSC boundary rule): the schema
// and column cell functions are not serializable, so they cannot be passed as
// props from the Server Component page.
import { citiesResource } from "@/lib/admin/resources/cities";
import { createCity, updateCity } from "./cities-actions";

/**
 * Relation-dropdown pattern:
 * Server pages fetch relation options (e.g. states) and pass them here as
 * `relationOptions`. Before rendering FormShell we merge options into the
 * matching fields. This keeps the static config clean while supporting dynamic
 * FK dropdowns at render time.
 */
export function CityForm({
  mode,
  id,
  defaultValues,
  relationOptions,
}: {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: Record<string, unknown>;
  relationOptions?: Record<string, { label: string; value: string }[]>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Merge relation options into the field definitions at render time.
  // FieldDef is invariant in its table type, so we widen with the expected cast.
  const fields = useMemo<FieldDef<TableName>[]>(() => {
    const base = citiesResource.form.fields as FieldDef<TableName>[];
    if (!relationOptions) return base;
    return base.map((field) => {
      const opts = relationOptions[field.name];
      if (opts) return { ...field, options: opts };
      return field;
    });
  }, [relationOptions]);

  function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCity(values)
          : await updateCity(id!, values);
      if (result.ok) {
        router.push("/admin/cities");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}
      <FormShell
        schema={citiesResource.form.schema}
        fields={fields}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel={mode === "create" ? "Create city" : "Save changes"}
        submitting={pending}
      />
    </div>
  );
}
