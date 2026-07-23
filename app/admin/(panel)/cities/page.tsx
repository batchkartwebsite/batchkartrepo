import Link from "next/link";
import { parseListParams } from "@/lib/admin/resource-config";
import { listResource } from "@/lib/server/resource";
import { statesResource } from "@/lib/admin/resources/states";
import { citiesResource } from "@/lib/admin/resources/cities";
import { StatesListView } from "./states-list-view";
import { CitiesListView } from "./cities-list-view";

type Tab = "cities" | "states";

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "states" ? "states" : "cities";
  const params = parseListParams(sp);

  // Always fetch state options — used for city filter + city form relation dropdown.
  const { rows: stateRows } = await listResource(statesResource, {
    page: 1,
    pageSize: 100,
    filters: {},
  });
  const stateOptions = stateRows.map((s) => ({ label: s.name, value: s.id }));

  const isStates = tab === "states";

  // Fetch only the active tab's data.
  const { rows: stateListRows, total: stateTotal } = isStates
    ? await listResource(statesResource, params)
    : { rows: [], total: 0 };

  const { rows: cityRows, total: cityTotal } = !isStates
    ? await listResource(citiesResource, params)
    : { rows: [], total: 0 };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Cities &amp; States
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage the geographic hierarchy used across BatchKart.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <Link
          href="/admin/cities"
          className={[
            "px-4 py-2 text-sm font-medium transition-colors",
            !isStates
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
          ].join(" ")}
        >
          Cities
        </Link>
        <Link
          href="/admin/cities?tab=states"
          className={[
            "px-4 py-2 text-sm font-medium transition-colors",
            isStates
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
          ].join(" ")}
        >
          States
        </Link>
      </div>

      {/* Tab content */}
      {isStates ? (
        <StatesListView rows={stateListRows} total={stateTotal} params={params} />
      ) : (
        <CitiesListView
          rows={cityRows}
          total={cityTotal}
          params={params}
          stateOptions={stateOptions}
        />
      )}
    </div>
  );
}
