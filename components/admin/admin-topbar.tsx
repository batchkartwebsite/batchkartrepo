"use client";

import { Menu } from "lucide-react";
import { signOutAdmin } from "@/features/admin-auth/sign-out";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface AdminTopbarProps {
  adminName: string;
  onMenu?: () => void;
}

export function AdminTopbar({ adminName, onMenu }: AdminTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 dark:bg-slate-950 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="grid size-9 place-items-center rounded-lg border border-border text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
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
