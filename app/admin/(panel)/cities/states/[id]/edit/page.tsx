import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/server/resource";
import { statesResource } from "@/lib/admin/resources/states";
import { StateForm } from "../../../state-form";

export default async function EditStatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = await getResource(statesResource, id);
  if (!state) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/admin/cities?tab=states"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          &larr; Cities &amp; States
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Edit State
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <StateForm mode="edit" id={id} defaultValues={state} />
      </div>
    </div>
  );
}
