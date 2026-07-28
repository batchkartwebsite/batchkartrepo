import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/server/resource";
import { batchesResource } from "@/lib/admin/resources/batches";
import { BatchForm } from "../../batch-form";
import { getBatchFormOptions } from "../../options";

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [batch, { coachingOptions, examOptions, cityByCoaching }] = await Promise.all([
    getResource(batchesResource, id),
    getBatchFormOptions(),
  ]);
  if (!batch) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/admin/batches"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          &larr; Batches
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Edit Batch
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <BatchForm
          mode="edit"
          id={id}
          defaultValues={batch}
          examOptions={examOptions}
          coachingOptions={coachingOptions}
          cityByCoaching={cityByCoaching}
        />
      </div>
    </div>
  );
}
