"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { submitEnquiry } from "./actions";

export type BatchOption = {
  id: string;
  name: string;
  exam: string | null;
  institute_name: string | null;
  city: string | null;
  fee: number | null;
  discounted_fee: number | null;
};

type Coaching = { name: string; cities: string[] };

const CLASS_OPTIONS = ["Class 9", "Class 10", "Class 11", "Class 12", "Dropper", "Graduate", "Working professional"];
const STEPS = ["Exam", "Coaching", "Batches", "Your details"];

function toggle(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function EnquireWizard({
  exams,
  coaching,
  batches,
  prefill,
  isLoggedIn,
  initialBatchId,
  initialExam,
  initialBatchName,
  initialCoaching,
  initialCity,
}: {
  exams: string[];
  coaching: Coaching[];
  batches: BatchOption[];
  prefill: { name: string; phone: string; email: string } | null;
  isLoggedIn: boolean;
  initialBatchId?: string;
  initialExam?: string;
  initialBatchName?: string;
  initialCoaching?: string | null;
  initialCity?: string | null;
}) {
  // Arriving from a batch: exam + coaching + city are already known, so skip
  // straight to the batches/budget step instead of re-asking.
  const [step, setStep] = useState(initialBatchId ? 2 : 0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [exam, setExam] = useState(initialExam ?? "");
  const [classLevel, setClassLevel] = useState("");
  const [selCoaching, setSelCoaching] = useState<string[]>(initialCoaching ? [initialCoaching] : []);
  const [selCities, setSelCities] = useState<string[]>(initialCity ? [initialCity] : []);
  const [selBatches, setSelBatches] = useState<string[]>(initialBatchId ? [initialBatchId] : []);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [scholarship, setScholarship] = useState("");
  const [achievements, setAchievements] = useState("");

  // Cities available from the selected coaching centers.
  const cityChoices = useMemo(() => {
    const set = new Set<string>();
    for (const c of coaching) if (selCoaching.includes(c.name)) c.cities.forEach((x) => set.add(x));
    return [...set];
  }, [coaching, selCoaching]);

  // Batches relevant to the selected exam (fall back to all).
  const shownBatches = useMemo(() => {
    if (!exam) return batches;
    const matched = batches.filter((b) => b.exam === exam);
    return matched.length ? matched : batches;
  }, [batches, exam]);

  const canNext =
    (step === 0 && Boolean(exam)) ||
    (step === 1) ||
    (step === 2) ||
    step === 3;

  function next() {
    setError(null);
    if (step === 0 && !exam) {
      setError("Please pick an exam to continue.");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function submit() {
    setError(null);
    if (!name.trim() || phone.trim().length < 6) {
      setError("Please enter your name and a valid phone number.");
      return;
    }
    startTransition(async () => {
      const res = await submitEnquiry({
        name,
        phone,
        email,
        exam,
        class_level: classLevel,
        coaching_choices: selCoaching,
        cities: selCities,
        batch_ids: selBatches,
        budget,
        scholarship_reason: scholarship,
        achievements,
      });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-600 text-2xl text-white">✓</div>
        <h2 className="font-display mt-5 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">
          Requirement submitted!
        </h2>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">
          Our team will shortlist matching batches and reach out to you shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={isLoggedIn ? "/account" : "/batches"} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {isLoggedIn ? "Track in my account" : "Browse batches"}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 lg:p-8">
      {/* Progress */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 ? <span className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} /> : null}
          </li>
        ))}
      </ol>

      {initialBatchName ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          <span aria-hidden>🎯</span>
          <span className="text-foreground">
            Enquiring about <span className="font-semibold">{initialBatchName}</span> — it&apos;s pre-selected below.
          </span>
        </div>
      ) : null}

      {/* Step 1 — Exam + class */}
      {step === 0 ? (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Which exam are you preparing for?</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {exams.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    exam === e
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Your current class / stage</span>
            <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className={inputClass}>
              <option value="">Select…</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {/* Step 2 — Coaching + cities */}
      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Preferred coaching centers</h3>
            <p className="text-sm text-muted-foreground">Choose any you&apos;re interested in (optional).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {coaching.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelCoaching((s) => toggle(s, c.name))}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selCoaching.includes(c.name)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {cityChoices.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-semibold">Preferred cities</h3>
              <p className="text-sm text-muted-foreground">Based on the coaching you picked (optional).</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cityChoices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelCities((s) => toggle(s, c))}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      selCities.includes(c)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    📍 {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Step 3 — Batches + budget */}
      {step === 2 ? (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Batches you&apos;re interested in</h3>
            <p className="text-sm text-muted-foreground">Optional — pick any that catch your eye.</p>
            <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
              {shownBatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No batches to show yet.</p>
              ) : (
                shownBatches.map((b) => {
                  const checked = selBatches.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelBatches((s) => toggle(s, b.id))}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        checked ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{b.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {b.institute_name ?? "—"}
                          {b.exam ? ` · ${b.exam}` : ""}
                        </span>
                      </span>
                      <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {checked ? "✓" : ""}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Your budget (₹)</span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 50000"
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {/* Step 4 — Details */}
      {step === 3 ? (
        <div className="space-y-5">
          {!isLoggedIn ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="text-foreground">Have an account? Log in to track this enquiry.</span>
              <Link href="/login?next=/enquire" className="shrink-0 font-semibold text-primary hover:underline">
                Log in
              </Link>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="10-digit mobile" />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Email <span className="text-muted-foreground">(optional)</span></span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} placeholder="you@example.com" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Why do you need a scholarship? <span className="text-muted-foreground">(optional)</span></span>
            <textarea value={scholarship} onChange={(e) => setScholarship(e.target.value)} rows={3} className={inputClass} placeholder="Tell us about your situation…" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Achievements <span className="text-muted-foreground">(optional)</span></span>
            <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} className={inputClass} placeholder="Ranks, scores, awards…" />
          </label>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      ) : null}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
        >
          ← Back
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-px disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit requirement"}
          </button>
        )}
      </div>
    </div>
  );
}
