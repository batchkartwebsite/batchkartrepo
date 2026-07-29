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

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[status] ?? STATUS_STYLE.new}`}>
      {status}
    </span>
  );
}

function asList(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: enquiries }, { data: messages }, { data: batches }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("enquiries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("queries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("batches").select("id, name"),
    ]);

  const enq = enquiries ?? [];
  const msgs = messages ?? [];
  const batchName = new Map((batches ?? []).map((b) => [b.id, b.name]));
  const name = profile?.full_name ?? (user.user_metadata?.full_name as string) ?? user.email ?? "there";
  const initial = name.trim().charAt(0).toUpperCase();

  const openCount =
    enq.filter((e) => e.status !== "closed").length + msgs.filter((m) => m.status !== "closed").length;

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
            {profile?.phone ? <p className="text-sm text-muted-foreground">{profile.phone}</p> : null}
          </div>
        </div>
        <SignOutButton />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-3xl font-semibold">{enq.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Enquiries</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-3xl font-semibold">{msgs.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Messages</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-3xl font-semibold">{openCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">In progress</p>
        </div>
      </div>

      {/* Enquiries */}
      <section id="enquiries" className="mt-12 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">My enquiries</h2>
          <Link href="/enquire" className="text-sm font-semibold text-primary hover:underline">
            New enquiry →
          </Link>
        </div>

        {enq.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t posted a requirement yet.</p>
            <Link
              href="/enquire"
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Post a requirement
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {enq.map((e) => {
              const batchIds = asList(e.batch_ids);
              const coaching = asList(e.coaching_choices);
              return (
                <li key={e.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {e.exam ? (
                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                          {e.exam}
                        </span>
                      ) : null}
                      <StatusPill status={e.status} />
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">{formatDate(e.created_at)}</time>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[
                      e.class_level,
                      coaching.length ? `${coaching.length} coaching` : null,
                      batchIds.length ? `${batchIds.length} batch${batchIds.length === 1 ? "" : "es"}` : null,
                      e.budget != null ? `₹${Number(e.budget).toLocaleString("en-IN")} budget` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Requirement submitted"}
                  </p>
                  {batchIds.length ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {batchIds.map((id) => batchName.get(id) ?? "—").join(", ")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Messages */}
      <section id="messages" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-xl font-semibold tracking-tight">My messages</h2>
        {msgs.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            No contact messages yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {msgs.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{m.exam ?? "General message"}</p>
                    <StatusPill status={m.status} />
                  </div>
                  {m.message ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.message}</p> : null}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{formatDate(m.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
