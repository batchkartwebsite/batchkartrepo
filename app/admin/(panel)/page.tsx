import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { ModerationPill } from "@/components/admin/moderation-pill";
import {
  getKpis,
  getRecentDiscountRequests,
  getRecentAudit,
} from "@/features/admin-dashboard/queries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(iso);
}

function humaniseReason(reason: string): string {
  return reason
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type DiscountStatus = "pending" | "approved" | "rejected";

function DiscountStatusBadge({ status }: { status: DiscountStatus }) {
  const styles: Record<DiscountStatus, string> = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    approved:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    rejected:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const [kpis, discountRequests, auditLogs] = await Promise.all([
    getKpis(),
    getRecentDiscountRequests(5),
    getRecentAudit(10),
  ]);

  return (
    <div className="space-y-10 p-6 lg:p-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of BatchKart platform activity.
        </p>
      </div>

      {/* KPI stat cards */}
      <section aria-labelledby="kpi-heading">
        <h2
          id="kpi-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
        >
          At a glance
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Students" value={kpis.students} />
          <StatCard label="Coaching Institutes" value={kpis.coaching} />
          <StatCard label="Total Batches" value={kpis.batches} />
          <StatCard
            label="Pending Discount Requests"
            value={kpis.pendingDiscountRequests}
            hint="Awaiting review"
          />
          <StatCard
            label="Pending Moderation"
            value={kpis.pendingModeration}
            hint="Batches to review"
          />
        </div>
      </section>

      {/* Recent discount requests */}
      <section aria-labelledby="discount-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="discount-heading"
            className="text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
          >
            Recent discount requests
          </h2>
          <Link
            href="/admin/discount-requests"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View all &rarr;
          </Link>
        </div>

        {discountRequests.length === 0 ? (
          <EmptyState
            title="No discount requests yet"
            description="Discount requests submitted by students will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm dark:bg-slate-950">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {discountRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {humaniseReason(req.reason_type)}
                    </td>
                    <td className="px-4 py-3">
                      <DiscountStatusBadge
                        status={req.status as DiscountStatus}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(req.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border bg-slate-50 px-4 py-2.5 dark:bg-slate-900">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing latest {discountRequests.length} requests.{" "}
                <Link
                  href="/admin/discount-requests"
                  className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Go to full review page
                </Link>{" "}
                to approve or reject requests.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Recent activity feed */}
      <section aria-labelledby="audit-heading">
        <h2
          id="audit-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
        >
          Recent activity
        </h2>

        {auditLogs.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Admin actions and system events will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm dark:bg-slate-950">
            <ul className="divide-y divide-border" role="list">
              {auditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {log.action.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      <span className="font-semibold capitalize">
                        {log.action}
                      </span>{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        {log.entity_type}
                      </span>
                      {log.entity_id ? (
                        <span className="ml-1 font-mono text-xs text-slate-400 dark:text-slate-500">
                          #{log.entity_id.slice(0, 8)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <time
                    dateTime={log.created_at}
                    className="shrink-0 text-xs text-slate-400 dark:text-slate-500"
                  >
                    {formatRelativeDate(log.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
