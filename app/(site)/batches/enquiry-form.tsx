"use client";

import { useState, useTransition } from "react";
import { submitQuery } from "./actions";

export function EnquiryForm({ exams }: { exams: string[] }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
      exam: String(fd.get("exam") ?? ""),
    };
    setError(null);
    startTransition(async () => {
      const res = await submitQuery(payload);
      if (res.ok) {
        setDone(true);
        form.reset();
      } else {
        setError(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
          Thanks! We&apos;ve received your enquiry.
        </p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          Our team will reach out to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm font-medium text-emerald-700 underline dark:text-emerald-300"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/30 dark:bg-slate-950 dark:text-slate-100";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {error ? (
        <p
          role="alert"
          className="sm:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Name <span aria-hidden className="text-rose-500">*</span>
        </span>
        <input name="name" required className={inputClass} placeholder="Your name" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Mobile <span aria-hidden className="text-rose-500">*</span>
        </span>
        <input
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          className={inputClass}
          placeholder="10-digit mobile"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email <span className="text-slate-400">(optional)</span>
        </span>
        <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Exam <span className="text-slate-400">(optional)</span>
        </span>
        <select name="exam" className={inputClass} defaultValue="">
          <option value="">Any / not sure</option>
          {exams.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Message <span className="text-slate-400">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={4}
          className={inputClass}
          placeholder="Tell us what you're looking for…"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Submit enquiry"}
        </button>
      </div>
    </form>
  );
}
