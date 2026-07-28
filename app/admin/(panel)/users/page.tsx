import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  coaching_admin: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  student: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function UsersPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: enquiries }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("enquiries").select("user_id"),
  ]);

  const rows = profiles ?? [];
  const enquiryCount = new Map<string, number>();
  for (const e of enquiries ?? []) {
    if (e.user_id) enquiryCount.set(e.user_id, (enquiryCount.get(e.user_id) ?? 0) + 1);
  }

  const students = rows.filter((r) => r.role === "student").length;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Users</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Registered accounts on BatchKart.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total users" value={rows.length} />
        <StatCard label="Students" value={students} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No users yet" description="Users who sign up will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["User", "Phone", "Role", "Enquiries", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-600/10 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {(u.full_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {u.full_name ?? "—"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">{u.phone ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ROLE_STYLE[u.role] ?? ROLE_STYLE.student}`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                    {enquiryCount.get(u.id) ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
