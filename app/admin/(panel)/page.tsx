import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCatalog, isBatchVisible } from "@/lib/server/catalog";
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

function count(res: { count: number | null }): number {
  return res.count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [
    totalBatches,
    publishedRows,
    totalEnquiries,
    newEnquiries,
    totalContacts,
    newContacts,
    totalUsers,
    recentEnquiries,
    recentContacts,
    cat,
  ] = await Promise.all([
    supabase.from("batches").select("*", head),
    supabase.from("batches").select("institute_name, exam").eq("moderation_status", "published").is("deleted_at", null),
    supabase.from("enquiries").select("*", head),
    supabase.from("enquiries").select("*", head).eq("status", "new"),
    supabase.from("queries").select("*", head),
    supabase.from("queries").select("*", head).eq("status", "new"),
    supabase.from("profiles").select("*", head),
    supabase
      .from("enquiries")
      .select("id, name, exam, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("queries")
      .select("id, name, phone, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    getActiveCatalog(),
  ]);

  // "Live" = published AND not hidden by a turned-off coaching/exam (what the public sees).
  const liveCount = (publishedRows.data ?? []).filter((b) => isBatchVisible(b, cat)).length;

  const kpis = [
    { label: "Batches", value: count(totalBatches), hint: `${liveCount} live on site`, href: "/admin/batches" },
    { label: "Enquiries", value: count(totalEnquiries), hint: `${count(newEnquiries)} new`, href: "/admin/enquiries" },
    { label: "Contacts", value: count(totalContacts), hint: `${count(newContacts)} new`, href: "/admin/contact" },
    { label: "Users", value: count(totalUsers), hint: "registered", href: "/admin/users" },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header + quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Everything happening across BatchKart.
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
            href="/admin/enquiries"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            View enquiries
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

      {/* KPI cards (clickable) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-xl transition-transform hover:-translate-y-0.5"
          >
            <StatCard label={k.label} value={k.value} hint={k.hint} />
          </Link>
        ))}
      </div>

      {/* Recent panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPanel
          title="Recent enquiries"
          href="/admin/enquiries"
          empty="No enquiries yet."
          items={recentEnquiries.data ?? []}
          render={(e) => (
            <>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{e.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{e.exam ?? "General"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[e.status] ?? STATUS_STYLE.new}`}>
                  {e.status}
                </span>
                <time className="text-xs text-slate-400">{timeAgo(e.created_at)}</time>
              </div>
            </>
          )}
        />
        <RecentPanel
          title="Recent contacts"
          href="/admin/contact"
          empty="No contact messages yet."
          items={recentContacts.data ?? []}
          render={(q) => (
            <>
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
            </>
          )}
        />
      </div>
    </div>
  );
}

function RecentPanel<T extends { id: string }>({
  title,
  href,
  empty,
  items,
  render,
}: {
  title: string;
  href: string;
  empty: string;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-background dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <Link href={href} className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
          View all →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
