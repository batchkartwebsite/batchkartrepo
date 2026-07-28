import { BatchForm } from "../batch-form";
import { getBatchFormOptions } from "../options";
import { BackButton } from "@/components/admin/back-button";

export default async function NewBatchPage() {
  const { coachingOptions, examOptions, cityByCoaching } = await getBatchFormOptions();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <BackButton href="/admin/batches" label="Back to batches" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          New Batch
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <BatchForm
          mode="create"
          examOptions={examOptions}
          coachingOptions={coachingOptions}
          cityByCoaching={cityByCoaching}
        />
      </div>
    </div>
  );
}
