"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import {
  TextField,
  TextareaField,
  NumberField,
  DateField,
  SwitchField,
  SelectField,
  SlugField,
} from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
// Client component imports the config DIRECTLY (RSC boundary).
import { batchesResource, batchCreateDefaults } from "@/lib/admin/resources/batches";
import { createBatch, updateBatch } from "./actions";

// One field renderer (mirrors FormShell, but this form places fields into steps).
function Field({ field }: { field: FieldDef<TableName> }) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} />;
    case "number":
      return <NumberField field={field} />;
    case "date":
      return <DateField field={field} />;
    case "switch":
      return <SwitchField field={field} />;
    case "select":
      return <SelectField field={field} />;
    case "slug":
      return <SlugField field={field} />;
    default:
      return <TextField field={field} />;
  }
}

type Option = { label: string; value: string };

export function BatchForm({
  mode,
  id,
  defaultValues,
  examOptions = [],
  coachingOptions = [],
  cityByCoaching = {},
}: {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: Record<string, unknown>;
  examOptions?: Option[];
  coachingOptions?: Option[];
  cityByCoaching?: Record<string, string[]>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Ensure the batch's currently-saved exam/coaching stays selectable even if
  // it was later toggled off in the admin lists.
  function withCurrent(options: Option[], current: unknown): Option[] {
    const value = typeof current === "string" ? current.trim() : "";
    if (value && !options.some((o) => o.value === value)) {
      return [{ label: value, value }, ...options];
    }
    return options;
  }

  // Look up field defs by name, injecting the dynamic dropdown options.
  const byName = useMemo(() => {
    const map: Record<string, FieldDef<TableName>> = {};
    for (const f of batchesResource.form.fields) map[f.name] = f as FieldDef<TableName>;
    map.exam = { ...map.exam, options: withCurrent(examOptions, defaultValues?.exam) };
    map.institute_name = {
      ...map.institute_name,
      options: withCurrent(coachingOptions, defaultValues?.institute_name),
    };
    return map;
  }, [examOptions, coachingOptions, defaultValues]);

  const methods = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(batchesResource.form.schema as any),
    defaultValues: (mode === "create" ? batchCreateDefaults : defaultValues) ?? {},
  });

  const exam = methods.watch("exam");
  const institute = methods.watch("institute_name");
  const showStep2 = Boolean(exam);
  const showStep3 = Boolean(exam) && Boolean(institute && String(institute).trim());

  // City options depend on the currently-selected coaching center.
  const instituteName = typeof institute === "string" ? institute : "";
  const cityOptions = (cityByCoaching[instituteName] ?? []).map((c) => ({ label: c, value: c }));
  const cityField: FieldDef<TableName> = {
    ...byName.city,
    options: withCurrent(cityOptions, defaultValues?.city),
  };

  function handleSubmit(values: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create" ? await createBatch(values) : await updateBatch(id!, values);
      if (result.ok) {
        router.push("/admin/batches");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const detailFields = [
    "city",
    "teacher",
    "mode",
    "language",
    "fee",
    "discounted_fee",
    "fee_type",
    "start_date",
    "duration_months",
    "seats_total",
    "status",
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} noValidate className="flex flex-col gap-6">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400"
          >
            {error}
          </p>
        ) : null}

        {/* Step 1 — Exam */}
        <fieldset className="rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            1. Which exam is this batch for?
          </legend>
          <div className="mt-2">
            <Field field={byName.exam} />
          </div>
        </fieldset>

        {/* Step 2 — Coaching + batch */}
        {showStep2 ? (
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              2. Coaching &amp; batch
            </legend>
            <div className="mt-2 flex flex-col gap-5">
              <Field field={byName.institute_name} />
              <Field field={byName.name} />
              <Field field={byName.slug} />
            </div>
          </fieldset>
        ) : null}

        {/* Step 3 — Details */}
        {showStep3 ? (
          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              3. Batch details
            </legend>
            <div className="mt-2 grid gap-5 sm:grid-cols-2">
              {detailFields.map((n) => (
                <Field key={n} field={n === "city" ? cityField : byName[n]} />
              ))}
            </div>
            {cityOptions.length === 0 ? (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                No cities added for this coaching yet — add them under Coaching in the sidebar.
              </p>
            ) : null}
            <div className="mt-5 flex flex-col gap-5">
              <Field field={byName.scholarship_available} />
              <Field field={byName.description} />
            </div>
          </fieldset>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending || !showStep3} size="sm">
            {pending ? "Saving…" : mode === "create" ? "Create batch" : "Save changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
