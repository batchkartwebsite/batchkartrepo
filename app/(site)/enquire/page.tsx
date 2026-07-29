import Link from "next/link";
import { Flame, TicketPercent, ArrowRight, PencilLine, ListChecks, Handshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCatalog, isBatchVisible } from "@/lib/server/catalog";
import { EnquireWizard, type BatchOption } from "./enquire-wizard";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Post a requirement",
  description: "Tell us your exam, budget and preferences — we'll match you to the right batches.",
  path: "/enquire",
});

function formatFee(fee: number | null): string {
  return fee != null ? `₹${fee.toLocaleString("en-IN")}` : "On request";
}

const ENQUIRE_STEPS = [
  {
    Icon: PencilLine,
    title: "Tell us what you need",
    body: "Share your exam, budget and preferred coaching or batches. It takes about a minute.",
  },
  {
    Icon: ListChecks,
    title: "We shortlist the best fit",
    body: "Our team matches you with verified batches for your goal, city and budget.",
  },
  {
    Icon: Handshake,
    title: "Get connected, free",
    body: "We introduce you to the institute. No charges, no spam, and you stay in control.",
  },
];

export default async function EnquirePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;
  const batchParam = Array.isArray(sp.batch) ? sp.batch[0] : sp.batch;
  const examParam = Array.isArray(sp.exam) ? sp.exam[0] : sp.exam;

  let userId: string | null = null;
  let prefill: { name: string; phone: string; email: string } | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", user.id)
        .single();
      prefill = {
        name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "",
        phone: profile?.phone ?? "",
        email: profile?.email ?? user.email ?? "",
      };
    }
  } catch {
    /* not logged in / transient — treat as guest */
  }

  const [{ data: exams }, { data: coachingRows }, { data: cityRows }, { data: batchRows }] =
    await Promise.all([
      supabase.from("exams").select("name").eq("is_active", true).order("sort_order").order("name"),
      supabase.from("coaching_centers").select("id, name").eq("is_active", true).order("sort_order").order("name"),
      supabase.from("coaching_cities").select("name, coaching_id"),
      supabase
        .from("batches")
        .select("id, name, exam, institute_name, city, fee, discounted_fee, moderation_status, deleted_at")
        .eq("moderation_status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const cat = await getActiveCatalog();

  const citiesByCoachingId = new Map<string, string[]>();
  for (const c of cityRows ?? []) {
    const list = citiesByCoachingId.get(c.coaching_id) ?? [];
    list.push(c.name);
    citiesByCoachingId.set(c.coaching_id, list);
  }
  const coaching = (coachingRows ?? []).map((c) => ({
    name: c.name,
    cities: citiesByCoachingId.get(c.id) ?? [],
  }));

  const visibleBatches = (batchRows ?? []).filter((b) => isBatchVisible(b, cat));
  const batchOptions: BatchOption[] = visibleBatches.map((b) => ({
    id: b.id,
    name: b.name,
    exam: b.exam,
    institute_name: b.institute_name,
    city: b.city,
    fee: b.fee,
    discounted_fee: b.discounted_fee,
  }));
  const discounted = batchOptions.filter(
    (b) => b.discounted_fee != null && b.fee != null && b.discounted_fee < b.fee,
  );

  // Prefill from ?batch= / ?exam= so arriving from a batch card carries context.
  const initialBatch = batchParam ? batchOptions.find((b) => b.id === batchParam) : undefined;
  const initialBatchId = initialBatch?.id;
  const initialExam = examParam || initialBatch?.exam || undefined;
  const initialCoaching = initialBatch?.institute_name ?? undefined;
  const initialCity = initialBatch?.city ?? undefined;

  return (
    <div className="mx-auto max-w-[1160px] px-6 py-12 lg:px-[60px]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Post a requirement</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Let&apos;s find your perfect batch
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Not sure which coaching or batch is right for you? Post a requirement and let us do the
          legwork. Tell us your exam, budget and preferences, and our team shortlists the best-fit
          batches across verified institutes, then connects you directly. It&apos;s completely free,
          with no spam and no pressure.
        </p>
      </header>

      {/* How enquiring works */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {ENQUIRE_STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.Icon className="size-5" />
              </span>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Step {i + 1}
              </span>
            </div>
            <h2 className="mt-3 font-display text-base font-semibold text-foreground">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <EnquireWizard
          key={`${initialBatchId ?? ""}|${initialExam ?? ""}`}
          exams={(exams ?? []).map((e) => e.name)}
          coaching={coaching}
          batches={batchOptions}
          prefill={prefill}
          isLoggedIn={Boolean(userId)}
          initialBatchId={initialBatchId}
          initialExam={initialExam}
          initialBatchName={initialBatch?.name}
          initialCoaching={initialCoaching}
          initialCity={initialCity}
        />

        {/* Discounted batches */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Flame className="size-4 text-amber-500" />
                <h2 className="font-display text-base font-semibold">Discounted batches</h2>
              </div>
              {discounted.length > 0 ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {discounted.length}
                </span>
              ) : null}
            </div>

            {discounted.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <TicketPercent className="size-6" />
                </span>
                <p className="mt-3 text-sm text-muted-foreground">No active discounts right now.</p>
              </div>
            ) : (
              <ul className="bk-scroll max-h-[400px] space-y-2.5 overflow-y-auto p-3 lg:max-h-[calc(100vh-13rem)]">
                {discounted.map((b) => {
                  const off = Math.round((1 - (b.discounted_fee as number) / (b.fee as number)) * 100);
                  return (
                    <li key={b.id}>
                      <Link
                        href={`/enquire?batch=${b.id}`}
                        className="group block rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 pr-1">
                            <p className="truncate text-sm font-semibold text-foreground">{b.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {b.institute_name ?? "—"}
                              {b.exam ? ` · ${b.exam}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                            -{off}%
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-lg font-semibold text-foreground">
                              {formatFee(b.discounted_fee)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">{formatFee(b.fee)}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                            Add
                            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
