import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export const metadata = { title: "My account" };

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  contacted: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  closed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: queries }, { data: batches }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("queries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("batches").select("id, name"),
  ]);

  const rows = queries ?? [];
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));
  const name = profile?.full_name ?? (user.user_metadata?.full_name as string) ?? user.email ?? "there";
  const initial = name.trim().charAt(0).toUpperCase();
  const counts = {
    total: rows.length,
    open: rows.filter((r) => r.status !== "closed").length,
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14 lg:px-[60px]">
      {/* Profile header */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center lg:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            {initial}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{name}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email ?? user.email}</p>
            {profile?.phone ? (
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            ) : null}
          </div>
        </div>
        <SignOutButton />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-3xl font-semibold">{counts.total}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total enquiries</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-3xl font-semibold">{counts.open}</p>
          <p className="mt-1 text-sm text-muted-foreground">In progress</p>
        </div>
      </div>

      {/* Enquiries */}
      <section id="enquiries" className="mt-12 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">My enquiries</h2>
          <Link href="/batches" className="text-sm font-semibold text-primary hover:underline">
            Browse batches →
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t sent any enquiries yet.</p>
            <Link
              href="/batches#enquiry"
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Send your first enquiry
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {q.batch_id ? (batchName.get(q.batch_id) ?? "General enquiry") : "General enquiry"}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[q.status] ?? STATUS_STYLE.new}`}
                    >
                      {q.status}
                    </span>
                  </div>
                  {q.message ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{q.message}</p>
                  ) : null}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{formatDate(q.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
