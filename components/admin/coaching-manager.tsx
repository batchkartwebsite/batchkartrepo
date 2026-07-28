"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ToggleSwitch } from "@/components/admin/toggle-switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type ActionResult = { ok: boolean; error?: string };
type City = { id: string; name: string };
export type CoachingRow = {
  id: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  cities: City[];
};

export function CoachingManager({
  rows,
  create,
  toggle,
  addCity,
  removeCity,
}: {
  rows: CoachingRow[];
  create: (raw: unknown) => Promise<ActionResult>;
  toggle: (id: string, isActive: boolean) => Promise<ActionResult>;
  addCity: (raw: unknown) => Promise<ActionResult>;
  removeCity: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState<CoachingRow | null>(null);

  const activeCount = rows.filter((r) => r.is_active).length;

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const res = await create({ name: String(fd.get("name") ?? ""), logo_url: String(fd.get("logo_url") ?? "") });
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

  function onToggle(row: CoachingRow, next: boolean) {
    if (!next) setConfirmOff(row); // turning OFF → confirm
    else doToggle(row.id, true);
  }

  const inputClass =
    "h-9 rounded-lg border border-border bg-background px-3 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 dark:bg-slate-950 dark:text-slate-100";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Coaching centers
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Active centers (and their cities) appear in the batch form · {activeCount} of {rows.length} active
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background p-4 dark:bg-slate-950"
      >
        <label className="flex flex-1 flex-col gap-1" style={{ minWidth: "12rem" }}>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Coaching name</span>
          <input name="name" required placeholder="Add a coaching center…" className={inputClass} />
        </label>
        <label className="flex flex-1 flex-col gap-1" style={{ minWidth: "12rem" }}>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Logo URL <span className="text-slate-400">(optional)</span>
          </span>
          <input name="logo_url" placeholder="https://… or /logos/x.png" className={inputClass} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          Add coaching
        </button>
      </form>

      {error ? (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-slate-400">
          No coaching centers yet. Add one above.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border border-border bg-background p-4 dark:bg-slate-950 ${r.is_active ? "" : "opacity-70"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {r.logo_url ? (
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white p-1">
                      <Image src={r.logo_url} alt={r.name} width={28} height={28} className="size-full object-contain" />
                    </span>
                  ) : (
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-600/10 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  )}
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
              </div>

              <CityEditor coachingId={r.id} cities={r.cities} addCity={addCity} removeCity={removeCity} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmOff !== null}
        tone="warning"
        title={`Turn off ${confirmOff?.name ?? "this coaching"}?`}
        description={
          <>
            It will be hidden from the homepage and all public pages, and its batches will stop
            showing to students. In admin, those batches become non-editable (marked with the
            reason) until you turn it back on.
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

function CityEditor({
  coachingId,
  cities,
  addCity,
  removeCity,
}: {
  coachingId: string;
  cities: City[];
  addCity: (raw: unknown) => Promise<ActionResult>;
  removeCity: (id: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmCity, setConfirmCity] = useState<City | null>(null);

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    setError(null);
    startTransition(async () => {
      const res = await addCity({ coaching_id: coachingId, name });
      if (res.ok) {
        setValue("");
        router.refresh();
      } else {
        setError(res.error ?? "Could not add city");
      }
    });
  }

  function doRemove(id: string) {
    startTransition(async () => {
      await removeCity(id);
      setConfirmCity(null);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-border pt-3 pl-12">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Cities</span>
        {cities.length === 0 ? (
          <span className="text-xs text-slate-400">None yet</span>
        ) : (
          cities.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {c.name}
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                disabled={pending}
                onClick={() => setConfirmCity(c)}
                className="text-slate-400 transition-colors hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
      <form onSubmit={add} className="mt-2 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a city…"
          className="h-8 w-40 rounded-lg border border-border bg-background px-2.5 text-sm text-slate-900 outline-none focus-visible:border-emerald-600 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="h-8 rounded-lg border border-emerald-600/40 px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
        >
          + Add city
        </button>
        {error ? <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span> : null}
      </form>

      <ConfirmDialog
        open={confirmCity !== null}
        tone="danger"
        title={`Remove ${confirmCity?.name ?? "this city"}?`}
        description="It will no longer be selectable for this coaching in the batch form. Existing batches keep their saved city."
        confirmLabel="Remove"
        onConfirm={() => confirmCity && doRemove(confirmCity.id)}
        onCancel={() => setConfirmCity(null)}
      />
    </div>
  );
}
