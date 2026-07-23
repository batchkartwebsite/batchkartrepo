"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef, ListParams, Row } from "@/lib/admin/resource-config";
import { DataTable } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { Button } from "@/components/ui/button";
// Client imports the config DIRECTLY — see RSC boundary note in the config file.
import { categoriesResource } from "@/lib/admin/resources/categories";
import { deleteCategory } from "./actions";

type CategoryRow = Row<"exam_categories">;

type ParamsPatch = Partial<{
  page: number;
  search: string;
  sort: ListParams["sort"];
  filters: Record<string, string>;
}>;

export function CategoriesListView({
  rows,
  total,
  params,
}: {
  rows: CategoryRow[];
  total: number;
  params: ListParams;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const pageCount = Math.max(1, Math.ceil(total / params.pageSize));

  function pushParams(patch: ParamsPatch) {
    const next: ListParams = {
      page: patch.page ?? params.page,
      pageSize: params.pageSize,
      sort: "sort" in patch ? patch.sort : params.sort,
      search: "search" in patch ? patch.search : params.search,
      filters: patch.filters ?? params.filters,
    };
    const qs = new URLSearchParams();
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
    router.push(query ? `/admin/categories?${query}` : "/admin/categories");
  }

  // Append an actions column (Edit link) to the config columns. Kept local so
  // the shared config stays serialization-agnostic and reusable.
  const columns = useMemo<ColumnDef<"exam_categories">[]>(
    () => [
      ...categoriesResource.listColumns,
      {
        key: "__actions",
        header: "Actions",
        cell: (r) => (
          <Link
            href={`/admin/categories/${r.id}/edit`}
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
        await deleteCategory(id);
      }
      setSelected([]);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {categoriesResource.label.plural}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {total} total
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/categories/new" />}
        >
          New {categoriesResource.label.singular}
        </Button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <FilterBar
            filters={categoriesResource.filters}
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
          ]}
          filename="categories.csv"
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
          title="No categories yet"
          description="Create your first category to get started."
          action={
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/categories/new" />}
            >
              New {categoriesResource.label.singular}
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
        title={`Delete ${selected.length} categor${selected.length === 1 ? "y" : "ies"}?`}
        description="This action cannot be undone."
        confirmLabel={pending ? "Deleting…" : "Delete"}
        onConfirm={runBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
