"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { adminNav } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-background dark:bg-slate-950">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin" aria-label="BatchKart Admin">
          <Logo />
        </Link>
        <span className="ml-1.5 rounded-md bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-5">
          {adminNav.map((group) => (
            <li key={group.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        )}
                        aria-current={active ? "page" : undefined}
                      >
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
    </aside>
  );
}
