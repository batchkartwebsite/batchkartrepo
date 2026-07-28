"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Percent,
  Building2,
  GraduationCap,
  Inbox,
  MessageSquare,
  Users,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { adminNav } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/batches": BookOpen,
  "/admin/discounted": Percent,
  "/admin/coaching": Building2,
  "/admin/exams": GraduationCap,
  "/admin/enquiries": Inbox,
  "/admin/contact": MessageSquare,
  "/admin/users": Users,
};

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-background dark:bg-slate-950">
      {/* Brand */}
      <div className="flex h-14 items-center gap-1.5 border-b border-border px-4">
        <Link href="/admin" aria-label="BatchKart Admin">
          <Logo />
        </Link>
        <span className="rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-6">
          {adminNav.map((group) => (
            <li key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const Icon = ICONS[item.href];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {active ? (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600 dark:bg-emerald-400" />
                        ) : null}
                        {Icon ? (
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500",
                            )}
                          />
                        ) : null}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <ExternalLink className="size-4 shrink-0 text-slate-400" />
          View site
        </Link>
      </div>
    </aside>
  );
}
