"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return <span aria-hidden className="h-8 w-16 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-px"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const name = (user.user_metadata?.full_name as string) || user.email || "Account";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 transition-colors hover:bg-muted">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:inline">
          {name.split(" ")[0]}
        </span>
        <span aria-hidden className="text-[10px] text-muted-foreground transition-transform group-open:rotate-180">
          ▼
        </span>
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Link href="/account" className="block px-4 py-2.5 text-sm hover:bg-muted">
          My account
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-muted dark:text-rose-400"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
