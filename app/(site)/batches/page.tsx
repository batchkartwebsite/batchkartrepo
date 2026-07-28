import { createClient } from "@/lib/supabase/server";
import { BatchCard } from "@/components/batches/batch-card";
import { EnquiryForm } from "./enquiry-form";

export const metadata = {
  title: "Explore batches",
  description: "Browse and compare coaching batches for NEET, JEE, UPSC and more.",
};

async function getPublishedBatches() {
  try {
    const supabase = await createClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const { data } = await supabase
      .from("batches")
      .select("*")
      .eq("moderation_status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .abortSignal(controller.signal);
    clearTimeout(timeout);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function BatchesPage() {
  const batches = await getPublishedBatches();
  const options = batches.map((b) => ({ id: b.id, name: b.name }));

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
          </p>
          <h1 className="font-display mt-2 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Explore coaching batches
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            NEET, JEE, UPSC and more. Found one you like? Send an enquiry and we&apos;ll connect you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1160px] px-6 py-14 lg:px-[60px]">
        {batches.length === 0 ? (
          <p className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
            No batches published yet. Check back soon.
          </p>
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
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Send an enquiry</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Leave your details and we&apos;ll get back to you with the best-fit batches for your
                exam and city.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li>✅ Free, no obligation</li>
                <li>✅ Verified institutes only</li>
                <li>✅ Quick response</li>
              </ul>
            </div>
            <div className="p-8 lg:p-10">
              <EnquiryForm batches={options} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
