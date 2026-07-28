import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [{ count: batchCount }, { count: newQueryCount }] = await Promise.all([
    supabase.from("batches").select("*", { count: "exact", head: true }),
    supabase
      .from("queries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage batches and student queries.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total Batches" value={batchCount ?? 0} />
        <StatCard label="New Queries" value={newQueryCount ?? 0} hint="Awaiting reply" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/batches"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Manage batches
        </Link>
        <Link
          href="/admin/queries"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          View queries
        </Link>
      </div>
    </div>
  );
}
