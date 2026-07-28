import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  contacted: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  closed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [
    totalBatches,
    publishedBatches,
    totalQueries,
    newQueries,
    recentQueries,
    recentBatches,
  ] = await Promise.all([
    supabase.from("batches").select("*", { count: "exact", head: true }),
    supabase.from("batches").select("*", { count: "exact", head: true }).eq("moderation_status", "published"),
    supabase.from("queries").select("*", { count: "exact", head: true }),
    supabase.from("queries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("queries")
      .select("id, name, phone, status, created_at, batch_id")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("batches")
      .select("id, name, exam, institute_name, moderation_status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of batches and student enquiries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/batches/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            + New batch
          </Link>
          <Link
            href="/admin/contact"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            View contacts
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            View site ↗
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total batches" value={totalBatches.count ?? 0} />
        <StatCard label="Published" value={publishedBatches.count ?? 0} hint="Live on site" />
        <StatCard label="Total contacts" value={totalQueries.count ?? 0} />
        <StatCard label="New contacts" value={newQueries.count ?? 0} hint="Awaiting reply" />
      </div>

      {/* Recent panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent enquiries */}
        <section className="rounded-xl border border-border bg-background dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent contacts
            </h2>
            <Link href="/admin/contact" className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              View all →
            </Link>
          </div>
          {(recentQueries.data ?? []).length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(recentQueries.data ?? []).map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{q.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{q.phone}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[q.status] ?? STATUS_STYLE.new}`}>
                      {q.status}
                    </span>
                    <time className="text-xs text-slate-400">{timeAgo(q.created_at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent batches */}
        <section className="rounded-xl border border-border bg-background dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent batches</h2>
            <Link href="/admin/batches" className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              View all →
            </Link>
          </div>
          {(recentBatches.data ?? []).length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No batches yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(recentBatches.data ?? []).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/batches/${b.id}/edit`}
                      className="truncate text-sm font-medium text-slate-800 hover:text-emerald-600 dark:text-slate-200"
                    >
                      {b.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {[b.exam, b.institute_name].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      b.moderation_status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {b.moderation_status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
