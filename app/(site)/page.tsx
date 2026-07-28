import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BatchCard } from "@/components/batches/batch-card";
import { INSTITUTES } from "@/lib/institutes";

const EXAMS = [
  { name: "NEET", emoji: "🩺", blurb: "Medical entrance" },
  { name: "JEE", emoji: "⚛️", blurb: "Engineering entrance" },
  { name: "UPSC", emoji: "🏛️", blurb: "Civil services" },
  { name: "CAT", emoji: "📊", blurb: "MBA entrance" },
  { name: "GATE", emoji: "🛠️", blurb: "PG & PSUs" },
  { name: "SSC", emoji: "🗂️", blurb: "Govt. jobs" },
  { name: "CLAT", emoji: "⚖️", blurb: "Law entrance" },
  { name: "Banking", emoji: "🏦", blurb: "IBPS / SBI" },
];

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse verified batches across every major exam, city and budget — all in one place.",
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
  { icon: "✅", title: "Verified institutes", body: "Every listing is checked — you only see real, active batches." },
  { icon: "💸", title: "Honest fees", body: "Transparent pricing with discounts surfaced up front." },
  { icon: "🧭", title: "Every exam", body: "NEET, JEE, UPSC, CAT, GATE, SSC and more — one platform." },
  { icon: "⚡", title: "One-tap enquiry", body: "Skip the phone-call maze. Enquire once, we do the rest." },
];

const REVIEWS = [
  {
    quote:
      "I compared four NEET batches in ten minutes and found one ₹15k cheaper with better faculty. BatchKart just gets it.",
    name: "Ananya R.",
    tag: "NEET aspirant · Kota",
  },
  {
    quote:
      "As a parent I had no idea where to start for JEE. The comparison made the decision obvious and stress-free.",
    name: "Suresh M.",
    tag: "Parent · Hyderabad",
  },
  {
    quote:
      "Found a Hindi-medium UPSC foundation batch that actually fit my budget. Enquiry got answered the same day.",
    name: "Pooja K.",
    tag: "UPSC aspirant · Delhi",
  },
];

const FAQS = [
  {
    q: "Is BatchKart free for students?",
    a: "Yes — browsing, comparing and enquiring are completely free. We never charge students.",
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
    a: "NEET, JEE, UPSC, CAT, GATE, SSC, CLAT, Banking and more — with new categories added regularly.",
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
      .limit(6)
      .abortSignal(controller.signal);
    clearTimeout(timeout);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedBatches();

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
        <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-[60px] lg:py-28">
          <div>
            <span className="bk-rise inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
              🎓 India&apos;s coaching batch marketplace
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
              Compare coaching batches for NEET, JEE, UPSC and more across India — verified
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
                href="/batches#enquiry"
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
                ["10k+", "Batches listed"],
                ["25+", "Exams covered"],
                ["120+", "Cities"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold text-foreground">{v}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* hero visual: floating stacked cards */}
          <div className="bk-rise relative hidden lg:block" style={{ animationDelay: "260ms" }}>
            <div className="animate-float relative mx-auto w-full max-w-sm">
              <div className="rotate-3 rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center overflow-hidden rounded-xl border border-border bg-white p-1.5">
                      <Image
                        src="/logos/allen.png"
                        alt="Allen"
                        width={28}
                        height={28}
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      NEET
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-primary">10% off</span>
                </div>
                <p className="mt-4 font-display text-lg font-semibold">NEET Classroom Program</p>
                <p className="text-sm text-muted-foreground">Allen Career Institute · Kota</p>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <span className="font-display text-2xl font-semibold">₹1,30,000</span>
                  <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
                    Enquire →
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-6 w-52 -rotate-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center overflow-hidden rounded-lg border border-border bg-white p-1">
                    <Image
                      src="/logos/vajiram.png"
                      alt="Vajiram & Ravi"
                      width={22}
                      height={22}
                      className="size-full object-contain"
                    />
                  </span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    UPSC
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">GS Foundation</p>
                <p className="text-xs text-muted-foreground">Vajiram &amp; Ravi · Delhi</p>
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
            {EXAMS.map((e) => (
              <Link
                key={e.name}
                href="/batches"
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-2xl">
                  {e.emoji}
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
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-display mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="scroll-mt-24">
        <div className="mx-auto max-w-[1160px] px-6 py-20 lg:px-[60px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Loved by aspirants</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Real students, real decisions
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-3xl border border-border bg-card p-6"
              >
                <span aria-hidden className="text-primary">
                  ★★★★★
                </span>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.tag}</p>
                </figcaption>
              </figure>
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
              <Link href="/batches#enquiry" className="font-semibold text-primary underline underline-offset-4">
                Send us an enquiry
              </Link>{" "}
              and we&apos;ll help you personally.
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
                    +
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
        <div className="mx-auto max-w-[1160px] px-6 py-24 text-center lg:px-[60px]">
          <h2 className="font-display mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Your best batch is one search away.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            Join thousands of aspirants who found the right coaching without the runaround.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/batches"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Explore batches →
            </Link>
            <Link
              href="/batches#enquiry"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Send an enquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
