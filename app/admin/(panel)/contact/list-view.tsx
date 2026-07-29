"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Row } from "@/lib/admin/resource-config";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";

import { updateQueryStatus, deleteQuery } from "./actions";

type QueryRow = Row<"queries">;

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Closed", value: "closed" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContactListView({ rows }: { rows: QueryRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function changeStatus(id: string, status: string) {
    startTransition(async () => {
      await updateQueryStatus(id, status);
      router.refresh();
    });
  }

  function runDelete() {
    const target = deleteId;
    if (!target) return;
    startTransition(async () => {
      await deleteQuery(target);
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Contact
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {rows.length} total — messages from the contact form.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Messages from the contact form will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Name", "Phone", "Email", "Message", "Exam", "Status", "Received", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="align-top transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                    {r.name}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{r.phone}</td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {r.email ?? "—"}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-slate-700 dark:text-slate-300">
                    {r.message ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300">{r.exam ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={r.status}
                      disabled={pending}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-slate-900 outline-none focus-visible:border-emerald-600 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteId(r.id)}
                      className="font-medium text-rose-600 transition-colors hover:text-rose-500 dark:text-rose-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this query?"
        description="This action cannot be undone."
        confirmLabel={pending ? "Deleting…" : "Delete"}
        onConfirm={runDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
