"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/admin/empty-state";
import { setBatchDiscount } from "./actions";

export type DiscountRowData = {
  id: string;
  name: string;
  institute_name: string | null;
  exam: string | null;
  fee: number | null;
  discounted_fee: number | null;
};

export function DiscountedListView({
  rows,
  blockedReasons = {},
}: {
  rows: DiscountRowData[];
  blockedReasons?: Record<string, string>;
}) {
  const discountedCount = rows.filter((r) => r.discounted_fee != null).length;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Discounted batches
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Set a discounted price per batch · {discountedCount} of {rows.length} discounted. Discounted
          batches are highlighted on the site and the Enquire page.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No batches yet" description="Create a batch first, then set its discount here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Batch", "Coaching", "Exam", "Fee", "Discounted price", ""].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <DiscountRow key={r.id} row={r} reason={blockedReasons[r.id]} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DiscountRow({ row, reason }: { row: DiscountRowData; reason?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(row.discounted_fee != null ? String(row.discounted_fee) : "");
  const [msg, setMsg] = useState<string | null>(null);
  const locked = Boolean(reason);

  const off =
    row.fee != null && row.discounted_fee != null && row.discounted_fee < row.fee
      ? Math.round((1 - row.discounted_fee / row.fee) * 100)
      : 0;

  function save() {
    const num = value.trim() === "" ? null : Number(value);
    setMsg(null);
    startTransition(async () => {
      const res = await setBatchDiscount(row.id, num);
      setMsg(res.ok ? "Saved" : (res.error ?? "Error"));
      router.refresh();
    });
  }

  function clear() {
    setValue("");
    setMsg(null);
    startTransition(async () => {
      await setBatchDiscount(row.id, null);
      router.refresh();
    });
  }

  return (
    <tr className={`align-middle ${locked ? "opacity-60" : ""}`}>
      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{row.institute_name ?? "—"}</td>
      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{row.exam ?? "—"}</td>
      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
        {row.fee != null ? `₹${row.fee.toLocaleString("en-IN")}` : "—"}
      </td>
      {locked ? (
        <td className="px-3 py-2.5" colSpan={2}>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-slate-400" title={reason}>
              🔒 Locked
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">{reason}</span>
          </div>
        </td>
      ) : (
        <>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">₹</span>
              <input
                value={value}
                inputMode="numeric"
                placeholder="—"
                onChange={(e) => setValue(e.target.value)}
                className="h-8 w-28 rounded-lg border border-border bg-background px-2 text-sm text-slate-900 outline-none focus-visible:border-emerald-600 dark:bg-slate-950 dark:text-slate-100"
              />
              {off > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {off}% off
                </span>
              ) : null}
            </div>
          </td>
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={pending || value === ""}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Clear
              </button>
              {msg ? <span className="text-xs text-emerald-600 dark:text-emerald-400">{msg}</span> : null}
            </div>
          </td>
        </>
      )}
    </tr>
  );
}
