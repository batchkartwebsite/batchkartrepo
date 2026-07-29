import Link from "next/link";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "How it works",
  description: "How BatchKart helps you discover, compare and enquire about coaching batches.",
  path: "/how-it-works",
});

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse verified coaching batches across NEET, JEE, UPSC and more. Filter by exam to see only what's relevant, and explore options across cities and study modes — online, offline or hybrid.",
    points: ["Filter by exam in one tap", "Online, offline & hybrid batches", "Verified institutes only"],
  },
  {
    n: "02",
    title: "Compare",
    body: "See fees, discounts, faculty, duration and location side by side. Discounted batches are highlighted so you can spot the best value instantly — no inflated claims, just the facts you need to decide.",
    points: ["Transparent fees & live discounts", "Faculty, duration & seats at a glance", "Scholarship-friendly batches flagged"],
  },
  {
    n: "03",
    title: "Enquire",
    body: "Found something you like? Post a requirement and we'll shortlist the best-fit batches and connect you with the institute. One enquiry, and your details carry through — no repeating yourself.",
    points: ["Pre-filled from the batch you picked", "Track every enquiry in your account", "No spam, no pressure"],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16 lg:px-[60px]">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          From confused to enrolled, in three steps
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          BatchKart brings every coaching batch into one place so you can choose with confidence —
          and we handle the outreach for you.
        </p>
      </header>

      {/* Steps */}
      <div className="mt-12 space-y-6">
        {STEPS.map((s) => (
          <div key={s.n} className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] lg:p-8">
            <span className="font-display text-5xl font-semibold text-primary/25">{s.n}</span>
            <div>
              <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Enquire vs contact */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Two ways to reach out</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">🎯 Post a requirement</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The detailed route. Tell us your exam, budget, preferred coaching and cities, and pick
              any batches you like. We shortlist the best matches and reach out. Best when you want
              guidance across multiple options.
            </p>
            <Link href="/enquire" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Start an enquiry →
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">💬 Quick contact</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Just have a question about a specific batch or the platform? Drop a short message and
              our team gets back to you. Best for a one-off query.
            </p>
            <Link href="/contact" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Contact us →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-3xl border border-border bg-[#0b1220] p-8 text-center text-white lg:p-12">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to find your batch?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          It&apos;s free, and you can track everything in your account.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/batches" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Explore batches
          </Link>
          <Link href="/enquire" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Post a requirement
          </Link>
        </div>
      </section>
    </div>
  );
}
