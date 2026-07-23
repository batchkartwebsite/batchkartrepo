import Link from "next/link";
import { listResource } from "@/lib/server/resource";
import { statesResource } from "@/lib/admin/resources/states";
import { CityForm } from "../city-form";

export default async function NewCityPage() {
  const { rows } = await listResource(statesResource, {
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const stateOptions = rows.map((s) => ({ label: s.name, value: s.id }));

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
          New City
        </h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 dark:bg-slate-950">
        <CityForm
          mode="create"
          relationOptions={{ state_id: stateOptions }}
        />
      </div>
    </div>
  );
}
