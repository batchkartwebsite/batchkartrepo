"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef, FilterDef, ListParams, Row } from "@/lib/admin/resource-config";
import { DataTable } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { Button } from "@/components/ui/button";
// Client imports the config DIRECTLY — see RSC boundary note in the config file.
import { citiesResource } from "@/lib/admin/resources/cities";
import { deleteCity } from "./cities-actions";

type CityRow = Row<"cities">;

type ParamsPatch = Partial<{
  page: number;
  search: string;
  sort: ListParams["sort"];
  filters: Record<string, string>;
}>;

/**
 * Relation-dropdown pattern for FilterBar:
 * `stateOptions` is fetched server-side and passed as a serializable prop.
 * We augment the static `citiesResource.filters` array at render time to inject
 * the options into the `state_id` filter, keeping the static config clean.
 */
export function CitiesListView({
  rows,
  total,
  params,
  stateOptions,
}: {
  rows: CityRow[];
  total: number;
  params: ListParams;
  stateOptions: { label: string; value: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const pageCount = Math.max(1, Math.ceil(total / params.pageSize));

  // Inject state options into the state_id filter at render time.
  const filters = useMemo<FilterDef<"cities">[]>(
    () =>
      citiesResource.filters.map((f) =>
        f.key === "state_id" ? { ...f, options: stateOptions } : f,
      ),
    [stateOptions],
  );

  function pushParams(patch: ParamsPatch) {
    const next: ListParams = {
      page: patch.page ?? params.page,
      pageSize: params.pageSize,
      sort: "sort" in patch ? patch.sort : params.sort,
      search: "search" in patch ? patch.search : params.search,
      filters: patch.filters ?? params.filters,
    };
    const qs = new URLSearchParams();
    // default tab is cities — no need to set tab param
    if (next.page > 1) qs.set("page", String(next.page));
    if (next.pageSize !== 20) qs.set("pageSize", String(next.pageSize));
    if (next.search) qs.set("search", next.search);
    if (next.sort) {
      qs.set("sort", next.sort.column);
      qs.set("dir", next.sort.dir);
    }
    for (const [key, value] of Object.entries(next.filters)) {
      if (value !== "") qs.set(key, value);
    }
    const query = qs.toString();
    router.push(query ? `/admin/cities?${query}` : "/admin/cities");
  }

  const columns = useMemo<ColumnDef<"cities">[]>(
    () => [
      ...citiesResource.listColumns,
      {
        key: "__actions",
        header: "Actions",
        cell: (r) => (
          <Link
            href={`/admin/cities/${r.id}/edit`}
            className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Edit
          </Link>
        ),
      },
    ],
    [],
  );

  function runBulkDelete() {
    const ids = [...selected];
    startTransition(async () => {
      for (const id of ids) {
        await deleteCity(id);
      }
      setSelected([]);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total} total
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/cities/new" />}
        >
          New {citiesResource.label.singular}
        </Button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FilterBar
            filters={filters}
            values={params.filters}
            onChange={(nextFilters) => pushParams({ filters: nextFilters, page: 1 })}
          />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Search
            </span>
            <input
              type="search"
              defaultValue={params.search ?? ""}
              placeholder="Name or slug"
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 dark:bg-slate-950 dark:text-slate-100"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  pushParams({ search: event.currentTarget.value, page: 1 });
                }
              }}
              onBlur={(event) => {
                if ((event.currentTarget.value || "") !== (params.search ?? "")) {
                  pushParams({ search: event.currentTarget.value, page: 1 });
                }
              }}
            />
          </label>
        </div>
        <CsvExportButton
          rows={rows}
          columns={[
            { header: "Name", value: (r) => r.name },
            { header: "Slug", value: (r) => r.slug },
            { header: "Popular", value: (r) => (r.is_popular ? "Yes" : "No") },
          ]}
          filename="cities.csv"
        />
      </div>

      {/* Bulk actions */}
      <BulkActionBar
        count={selected.length}
        actions={[{ key: "delete", label: "Delete", onRun: () => setConfirmOpen(true) }]}
        onClear={() => setSelected([])}
      />

      {/* Table / empty state */}
      {rows.length === 0 ? (
        <EmptyState
          title="No cities yet"
          description="Create your first city to get started."
          action={
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/cities/new" />}
            >
              New {citiesResource.label.singular}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          sort={params.sort}
          onSortChange={(s) => pushParams({ sort: s })}
        />
      )}

      {/* Pagination */}
      <Pagination
        page={params.page}
        pageCount={pageCount}
        onPageChange={(p) => pushParams({ page: p })}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.length} cit${selected.length === 1 ? "y" : "ies"}?`}
        description="This action cannot be undone."
        confirmLabel={pending ? "Deleting…" : "Delete"}
        onConfirm={runBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
