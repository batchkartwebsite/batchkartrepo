"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { ZodType } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldDef, TableName } from "@/lib/admin/resource-config";
import { Button } from "@/components/ui/button";
import {
  TextField,
  TextareaField,
  NumberField,
  DateField,
  SwitchField,
  SelectField,
  SlugField,
  RelationField,
  MediaField,
} from "./fields";

export interface FormShellProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<any, any, any>;
  fields: FieldDef<TableName>[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}

export function FormShell({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  submitting = false,
}: FormShellProps) {
  const methods = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues ?? {},
  });

  const isPending = submitting || methods.formState.isSubmitting;

  async function handleSubmit(values: Record<string, unknown>) {
    await onSubmit(values);
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {fields.map((field) => {
          switch (field.type) {
            case "text":
              return <TextField key={field.name} field={field} />;
            case "textarea":
              return <TextareaField key={field.name} field={field} />;
            case "number":
              return <NumberField key={field.name} field={field} />;
            case "date":
              return <DateField key={field.name} field={field} />;
            case "switch":
              return <SwitchField key={field.name} field={field} />;
            case "select":
              return <SelectField key={field.name} field={field} />;
            case "slug":
              return <SlugField key={field.name} field={field} />;
            case "relation":
              return <RelationField key={field.name} field={field} />;
            case "media":
              return <MediaField key={field.name} field={field} />;
            default:
              return null;
          }
        })}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
