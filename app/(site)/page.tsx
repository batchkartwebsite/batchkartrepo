import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap, BadgeCheck, IndianRupee, Compass, Zap, Check, Plus,
  Stethoscope, Atom, Landmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCatalog, isBatchVisible, getActiveExamNames } from "@/lib/server/catalog";
import { BatchCard } from "@/components/batches/batch-card";
import { EnquiryForm } from "./batches/enquiry-form";
import { INSTITUTES } from "@/lib/institutes";
import { POPULAR_EXAMS } from "@/lib/exams";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — Discover & compare coaching batches`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse verified batches across every major exam, city and budget, all in one place.",
  },
  {
    n: "02",
    title: "Compare",
    body: "Weigh fees, faculty, mode and scholarships side by side. No inflated claims, just facts.",
  },
  {
    n: "03",
    title: "Enquire",
    body: "Send one enquiry and we connect you to the institute. No spam, no pressure.",
  },
];

const FEATURES = [
  { Icon: BadgeCheck, title: "Verified institutes", body: "Every listing is checked, so you only see real, active batches." },
  { Icon: IndianRupee, title: "Honest fees", body: "Transparent pricing with discounts surfaced up front." },
  { Icon: Compass, title: "Every exam", body: "NEET, JEE, UPSC, CAT, GATE, SSC and more, all on one platform." },
  { Icon: Zap, title: "One-tap enquiry", body: "Skip the phone-call maze. Enquire once, we do the rest." },
];

const FAQS = [
  {
    q: "Is BatchKart free for students?",
    a: "Yes, browsing, comparing and enquiring are completely free. We never charge students.",
  },
  {
    q: "How do you verify batches?",
    a: "Every batch is reviewed before it goes live, and we keep listings current so you don't chase dead offers.",
  },
  {
    q: "What happens after I enquire?",
    a: "Your details reach our team, and we connect you with the right institute. No spam, and you stay in control.",
  },
  {
    q: "Which exams are covered?",
    a: "NEET, JEE, UPSC, CAT, GATE, SSC, CLAT, Banking and more, with new categories added regularly.",
  },
];

// Resilient fetch: never let a slow/unreachable DB block or crash the homepage.
// Fails fast (4s) and returns [] so the page renders without the featured strip.
async function getFeaturedBatches() {
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const { data } = await supabase
      .from("batches")
      .select("*")
      .eq("moderation_status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(12)
      .abortSignal(controller.signal);
    clearTimeout(timeout);
    // Hide batches whose coaching/exam has been turned off.
    const cat = await getActiveCatalog();
    return (data ?? []).filter((b) => isBatchVisible(b, cat)).slice(0, 6);
  } catch {
    return [];
  }
}

// Real, DB-derived counts for the hero — no fabricated numbers.
async function getStats() {
  try {
    const supabase = await createClient();
    const head = { count: "exact" as const, head: true };
    const [batches, exams, coaching] = await Promise.all([
      supabase.from("batches").select("*", head).eq("moderation_status", "published").is("deleted_at", null),
      supabase.from("exams").select("*", head).eq("is_active", true),
      supabase.from("coaching_centers").select("*", head).eq("is_active", true),
    ]);
    return { batches: batches.count ?? 0, exams: exams.count ?? 0, coaching: coaching.count ?? 0 };
  } catch {
    return { batches: 0, exams: 0, coaching: 0 };
  }
}

export default async function HomePage() {
  const [featured, stats, examNames] = await Promise.all([
    getFeaturedBatches(),
    getStats(),
    getActiveExamNames(),
  ]);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate bk-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 12% 8%, rgba(16,185,129,0.20), transparent 60%), radial-gradient(45% 40% at 92% 0%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(60% 60% at 50% 120%, rgba(16,185,129,0.10), transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-[60px] lg:pb-24 lg:pt-12">
          <div>
            <span className="bk-rise inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
              <GraduationCap className="size-3.5" /> India&apos;s coaching batch marketplace
            </span>
            <h1
              className="bk-rise font-display mt-6 text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.4rem]"
              style={{ animationDelay: "80ms" }}
            >
              Find the right batch.
              <br />
              <span className="text-primary italic">Pay less,</span> prepare smarter.
            </h1>
            <p
              className="bk-rise mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "160ms" }}
            >
              Compare coaching batches for NEET, JEE, UPSC and more across India. Verified
              institutes, honest fees, and exclusive discounts. One enquiry, zero guesswork.
            </p>
            <div className="bk-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <Link
                href="/batches"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              >
                Explore batches →
              </Link>
              <Link
                href="/enquire"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Post a requirement
              </Link>
            </div>

            {/* trust stats */}
            <dl
              className="bk-rise mt-12 grid max-w-lg grid-cols-3 gap-6"
              style={{ animationDelay: "320ms" }}
            >
              {[
                [String(stats.batches), "Batches listed"],
                [String(stats.exams), "Exams covered"],
                [String(stats.coaching), "Coaching partners"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-foreground">{v}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* hero visual: the product idea — search, compare, save (no brands) */}
          <div className="bk-rise relative hidden lg:block" style={{ animationDelay: "260ms" }}>
            <div className="relative mx-auto w-full max-w-sm">
              {/* soft brand glow */}
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/15 blur-3xl"
              />

              {/* app mockup */}
              <div className="animate-float rounded-[1.75rem] border border-border bg-card p-5 shadow-2xl shadow-primary/10">
                {/* mock search bar */}
                <div className="flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted-foreground" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Find your batch…</span>
                  <span className="ml-auto rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                    Search
                  </span>
                </div>

                {/* exam category chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["NEET", "JEE", "UPSC", "CAT", "GATE"].map((e, i) => (
                    <span
                      key={e}
                      className={
                        i === 0
                          ? "rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                          : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      }
                    >
                      {e}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Comparing 3 batches
                </p>

                {/* generic result rows */}
                <div className="mt-2 space-y-2">
                  {[
                    { exam: "NEET", mode: "Online", Icon: Stethoscope, d: "3,999", o: "6,500", off: 38 },
                    { exam: "JEE", mode: "Offline", Icon: Atom, d: "1,10,000", o: "1,45,000", off: 24 },
                    { exam: "UPSC", mode: "Hybrid", Icon: Landmark, d: "49,999", o: "65,000", off: 23 },
                  ].map((r) => (
                    <div
                      key={r.exam}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2.5"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <r.Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                            {r.exam}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{r.mode}</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-sm font-semibold text-foreground">₹{r.d}</span>
                          <span className="text-[11px] text-muted-foreground line-through">₹{r.o}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        -{r.off}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* floating badges */}
              <div className="absolute -left-6 top-10 -rotate-6 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-xl">
                <p className="font-display text-lg font-semibold text-foreground">
                  Save up to 40%
                </p>
                <p className="text-[11px] text-muted-foreground">on verified batches</p>
              </div>
              <div className="absolute -right-4 -bottom-4 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 shadow-xl">
                <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="text-xs font-semibold text-foreground">Verified &amp; up to date</span>
              </div>
            </div>
          </div>
        </div>

        {/* trusted institutes marquee */}
        <div className="border-y border-border bg-background/60 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-[1160px] items-center gap-6 px-6 lg:px-[60px]">
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:block">
              Trusted institutes
            </span>
            <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="animate-marquee flex w-max items-center gap-8">
                {[...INSTITUTES, ...INSTITUTES].map((inst, i) => (
                  <span key={i} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
                    <span className="grid size-8 place-items-center overflow-hidden rounded-lg border border-border bg-white p-1">
                      <Image
                        src={inst.logo}
                        alt={inst.name}
                        width={28}
                        height={28}
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="font-display text-base font-semibold text-foreground/55">
                      {inst.name}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured batches ─────────────────────────────────────────────── */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-[1160px] px-6 py-20 lg:px-[60px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Trending now
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Fresh batches, freshly listed
              </h2>
            </div>
            <Link
              href="/batches"
              className="hidden shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:inline-flex"
            >
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BatchCard key={b.id} batch={b} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Popular exams ────────────────────────────────────────────────── */}
      <section id="exams" className="scroll-mt-24 border-t border-border bg-muted/40">
        <div className="mx-auto max-w-[1160px] px-6 py-20 lg:px-[60px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Popular exams
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick your goal, we&apos;ll find the batch
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {POPULAR_EXAMS.map((e) => (
              <Link
                key={e.name}
                href={`/batches?exam=${encodeURIComponent(e.name)}`}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <e.Icon className="size-6" />
                </span>
                <p className="font-display mt-4 text-lg font-semibold text-foreground">{e.name}</p>
                <p className="text-sm text-muted-foreground">{e.blurb}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="scroll-mt-24">
        <div className="mx-auto max-w-[1160px] px-6 py-20 lg:px-[60px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to the right batch
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="font-display text-5xl font-semibold text-primary/20">{s.n}</span>
                <h3 className="font-display mt-2 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why BatchKart ────────────────────────────────────────────────── */}
      <section id="why" className="scroll-mt-24 border-t border-border bg-muted/40">
        <div className="mx-auto max-w-[1160px] px-6 py-20 lg:px-[60px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Why BatchKart
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built to make the choice obvious
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <f.Icon className="size-6" />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-24 border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-[1160px] gap-10 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] lg:px-[60px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
            <p className="mt-4 text-muted-foreground">
              Still unsure?{" "}
              <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
                Contact us
              </Link>{" "}
              and we&apos;ll help you personally. Or see the{" "}
              <Link href="/faq" className="font-semibold text-primary underline underline-offset-4">
                full FAQ
              </Link>
              .
            </p>
          </div>
          <div className="divide-y divide-border rounded-3xl border border-border bg-card px-6">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                  {f.q}
                  <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    <Plus className="size-3.5" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#0b1220] bk-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(50% 60% at 20% 0%, rgba(16,185,129,0.25), transparent 60%), radial-gradient(45% 55% at 90% 100%, rgba(245,158,11,0.14), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-[1160px] px-6 py-24 lg:px-[60px]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="font-display max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Your best batch is one search away.
              </h2>
              <p className="mt-4 max-w-lg text-slate-400">
                Join thousands of aspirants who found the right coaching without the runaround.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  href="/batches"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Explore batches →
                </Link>
                <Link
                  href="/enquire"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Post a requirement
                </Link>
              </div>
            </div>

            {/* Quick contact form */}
            <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-2xl sm:p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Have a quick question?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drop us a message and we&apos;ll get back to you shortly.
              </p>
              <div className="mt-5">
                <EnquiryForm exams={examNames} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
