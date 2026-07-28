"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Row } from "@/lib/admin/resource-config";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { updateEnquiryStatus, deleteEnquiry } from "./actions";

type EnquiryRow = Row<"enquiries">;

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed", value: "closed" },
];

function asList(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EnquiriesListView({
  rows,
  batchNames,
}: {
  rows: EnquiryRow[];
  batchNames: Record<string, string>;
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeStatus(id: string, status: string) {
    startTransition(async () => {
      await updateEnquiryStatus(id, status);
      router.refresh();
    });
  }

  function runDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteEnquiry(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Enquiries
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {rows.length} total — detailed requirements from the Enquire flow.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No enquiries yet" description="Detailed enquiries will appear here." />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {rows.map((e) => {
            const coaching = asList(e.coaching_choices);
            const cities = asList(e.cities);
            const batchIds = asList(e.batch_ids);
            return (
              <li key={e.id} className="rounded-2xl border border-border bg-background p-5 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{e.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {e.phone}
                      {e.email ? ` · ${e.email}` : ""}
                    </p>
                  </div>
                  <select
                    value={e.status}
                    disabled={pending}
                    onChange={(ev) => changeStatus(e.id, ev.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-slate-900 outline-none dark:bg-slate-950 dark:text-slate-100"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.exam ? <Tag tone="exam">{e.exam}</Tag> : null}
                  {e.class_level ? <Tag>{e.class_level}</Tag> : null}
                  {e.budget != null ? <Tag>Budget ₹{Number(e.budget).toLocaleString("en-IN")}</Tag> : null}
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  {coaching.length ? <Line label="Coaching" value={coaching.join(", ")} /> : null}
                  {cities.length ? <Line label="Cities" value={cities.join(", ")} /> : null}
                  {batchIds.length ? (
                    <Line
                      label="Batches"
                      value={batchIds.map((id) => batchNames[id] ?? "—").join(", ")}
                    />
                  ) : null}
                  {e.scholarship_reason ? <Line label="Scholarship" value={e.scholarship_reason} /> : null}
                  {e.achievements ? <Line label="Achievements" value={e.achievements} /> : null}
                </dl>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <time className="text-xs text-slate-400">{formatDate(e.created_at)}</time>
                  <button
                    type="button"
                    onClick={() => setDeleteId(e.id)}
                    className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-500 dark:text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        tone="danger"
        title="Delete this enquiry?"
        description="This permanently removes the enquiry. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={runDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "exam" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        tone === "exam"
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-slate-600 dark:text-slate-300"
      }`}
    >
      {children}
    </span>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-slate-400">{label}:</dt>
      <dd className="text-slate-700 dark:text-slate-300">{value}</dd>
    </div>
  );
}
