"use client";

import { signOutAdmin } from "@/features/admin-auth/sign-out";

interface AdminTopbarProps {
  adminName: string;
}

export function AdminTopbar({ adminName }: AdminTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-background px-6 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {adminName}
        </span>
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
