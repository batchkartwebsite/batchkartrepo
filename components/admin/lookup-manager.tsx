"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "@/components/admin/toggle-switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type ActionResult = { ok: boolean; error?: string };

export type LookupRow = {
  id: string;
  name: string;
  is_active: boolean;
};

export function LookupManager({
  singular,
  description,
  rows,
  create,
  toggle,
}: {
  singular: string;
  description: string;
  rows: LookupRow[];
  create: (raw: unknown) => Promise<ActionResult>;
  toggle: (id: string, isActive: boolean) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState<LookupRow | null>(null);

  const activeCount = rows.filter((r) => r.is_active).length;
  const lower = singular.toLowerCase();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await create({ name: String(fd.get("name") ?? "") });
      if (res.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(res.error ?? "Could not add");
      }
    });
  }

  function doToggle(id: string, next: boolean) {
    startTransition(async () => {
      await toggle(id, next);
      router.refresh();
    });
  }

  function onToggle(row: LookupRow, next: boolean) {
    if (!next) setConfirmOff(row);
    else doToggle(row.id, true);
  }

  const inputClass =
    "h-9 rounded-lg border border-border bg-background px-3 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {singular}s
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description} · {activeCount} of {rows.length} active
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background p-4 dark:bg-slate-950"
      >
        <label className="flex flex-1 flex-col gap-1" style={{ minWidth: "12rem" }}>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{singular} name</span>
          <input name="name" required placeholder={`Add a ${lower}…`} className={inputClass} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          Add {lower}
        </button>
      </form>

      {error ? (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-slate-400">
          No {lower}s yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`flex items-center justify-between gap-4 bg-background px-4 py-3 dark:bg-slate-950 ${r.is_active ? "" : "opacity-70"}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">{r.name}</span>
                {!r.is_active ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Hidden
                  </span>
                ) : null}
              </div>
              <ToggleSwitch
                checked={r.is_active}
                disabled={pending}
                onChange={(next) => onToggle(r, next)}
                label={`${r.is_active ? "Hide" : "Show"} ${r.name}`}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmOff !== null}
        tone="warning"
        title={`Turn off ${confirmOff?.name ?? `this ${lower}`}?`}
        description={
          <>
            It will be hidden from the homepage and all public pages, and batches using it will stop
            showing to students. In admin, those batches become non-editable (marked with the reason)
            until you turn it back on.
          </>
        }
        confirmLabel="Turn off"
        onConfirm={() => {
          if (confirmOff) doToggle(confirmOff.id, false);
          setConfirmOff(null);
        }}
        onCancel={() => setConfirmOff(null)}
      />
    </div>
  );
}
