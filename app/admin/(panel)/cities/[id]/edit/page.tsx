import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource, listResource } from "@/lib/server/resource";
import { citiesResource } from "@/lib/admin/resources/cities";
import { statesResource } from "@/lib/admin/resources/states";
import { CityForm } from "../../city-form";

export default async function EditCityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [city, { rows: stateRows }] = await Promise.all([
    getResource(citiesResource, id),
    listResource(statesResource, { page: 1, pageSize: 100, filters: {} }),
  ]);
  if (!city) notFound();

  const stateOptions = stateRows.map((s) => ({ label: s.name, value: s.id }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <Link
          href="/admin/cities"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          &larr; Cities &amp; States
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Edit City
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <CityForm
          mode="edit"
          id={id}
          defaultValues={city}
          relationOptions={{ state_id: stateOptions }}
        />
      </div>
    </div>
  );
}
