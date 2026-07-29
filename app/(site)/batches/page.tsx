import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCatalog, isBatchVisible, getActiveExamNames } from "@/lib/server/catalog";
import { BatchCard } from "@/components/batches/batch-card";
import { POPULAR_EXAMS } from "@/lib/exams";
import { EnquiryForm } from "./enquiry-form";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Explore batches",
  description: "Browse and compare coaching batches for NEET, JEE, UPSC and more.",
  path: "/batches",
});

async function getPublishedBatches(exam?: string) {
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let query = supabase
      .from("batches")
      .select("*")
      .eq("moderation_status", "published")
      .is("deleted_at", null);
    if (exam) query = query.ilike("exam", `%${exam}%`);
    const { data } = await query
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);
    clearTimeout(timeout);
    // Hide batches whose coaching/exam has been turned off.
    const cat = await getActiveCatalog();
    return (data ?? []).filter((b) => isBatchVisible(b, cat));
  } catch {
    return [];
  }
}

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const examRaw = Array.isArray(sp.exam) ? sp.exam[0] : sp.exam;
  const activeExam = examRaw?.trim() || undefined;

  const batches = await getPublishedBatches(activeExam);
  const examNames = await getActiveExamNames();

  return (
    <div className="overflow-x-hidden">
      {/* Header band */}
      <section className="relative isolate border-b border-border bk-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(50% 60% at 10% 0%, rgba(16,185,129,0.16), transparent 60%), radial-gradient(40% 50% at 95% 10%, rgba(245,158,11,0.10), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-[1160px] px-6 py-16 lg:px-[60px]">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {batches.length} live {batches.length === 1 ? "batch" : "batches"}
            {activeExam ? ` · ${activeExam}` : ""}
          </p>
          <h1 className="font-display mt-2 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {activeExam ? `${activeExam} coaching batches` : "Explore coaching batches"}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            NEET, JEE, UPSC and more. Found one you like? Send an enquiry and we&apos;ll connect you.
          </p>

          {/* Exam filter chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/batches"
              className={[
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                !activeExam
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground hover:bg-muted",
              ].join(" ")}
            >
              All
            </Link>
            {POPULAR_EXAMS.map((e) => {
              const active = activeExam?.toLowerCase() === e.name.toLowerCase();
              return (
                <Link
                  key={e.name}
                  href={`/batches?exam=${encodeURIComponent(e.name)}`}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  <e.Icon className="size-3.5" />
                  {e.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1160px] px-6 py-14 lg:px-[60px]">
        {batches.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {activeExam ? `No ${activeExam} batches yet.` : "No batches published yet. Check back soon."}
            </p>
            {activeExam ? (
              <Link href="/batches" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                Browse all batches →
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((b) => (
              <BatchCard key={b.id} batch={b} />
            ))}
          </div>
        )}

        {/* Enquiry */}
        <section
          id="enquiry"
          className="mt-16 scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="grid md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative isolate bg-[#0b1220] p-8 text-white lg:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  backgroundImage:
                    "radial-gradient(60% 60% at 20% 10%, rgba(16,185,129,0.25), transparent 60%)",
                }}
              />
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Have a quick question?</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Drop us a message and we&apos;ll get back to you. Looking for a full match?{" "}
                <a href="/enquire" className="font-semibold text-emerald-400 underline">
                  Post a requirement
                </a>
                .
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li>✅ Free, no obligation</li>
                <li>✅ Verified institutes only</li>
                <li>✅ Quick response</li>
              </ul>
            </div>
            <div className="p-8 lg:p-10">
              <EnquiryForm exams={examNames} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
