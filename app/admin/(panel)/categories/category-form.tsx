"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { FormShell } from "@/components/admin/form-shell";
// Client component imports the config DIRECTLY (RSC boundary rule): the schema
// and column cell functions are not serializable, so they cannot be passed as
// props from the Server Component page.
import { categoriesResource } from "@/lib/admin/resources/categories";
import { createCategory, updateCategory } from "./actions";

export function CategoryForm({
  mode,
  id,
  defaultValues,
}: {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategory(values)
          : await updateCategory(id!, values);
      if (result.ok) {
        router.push("/admin/categories");
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
        schema={categoriesResource.form.schema}
        // FieldDef is invariant in its table type, so a resource-specific
        // FieldDef[] is not assignable to FormShell's FieldDef<TableName>[].
        // This widening cast is expected in every resource section.
        fields={categoriesResource.form.fields as FieldDef<TableName>[]}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel={mode === "create" ? "Create category" : "Save changes"}
        submitting={pending}
      />
    </div>
  );
}
