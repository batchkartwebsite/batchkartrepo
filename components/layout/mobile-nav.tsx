"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    close();
    router.push("/");
    router.refresh();
  }

  const name = user ? ((user.user_metadata?.full_name as string) || user.email || "Account") : "";

  // Rendered via a portal to <body> so the fixed overlay is positioned against
  // the viewport (the header uses backdrop-blur, which would otherwise trap a
  // fixed descendant inside the header's box).
  const sheet = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background md:hidden">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link href="/" onClick={close} aria-label="BatchKart home">
          <Logo />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="-mr-1.5 grid size-10 place-items-center text-foreground transition-colors hover:text-primary"
        >
          <X className="size-6" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="divide-y divide-border">
          {siteConfig.mainNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={close}
                className="flex items-center justify-between py-4 text-lg font-medium text-foreground"
              >
                {link.label}
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href="/account"
                onClick={close}
                className="rounded-full border border-border py-2.5 text-center text-sm font-semibold text-foreground"
              >
                My account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full py-2.5 text-center text-sm font-semibold text-rose-600 dark:text-rose-400"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="space-y-3 border-t border-border px-6 py-5">
        {!user ? (
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={close}
              className="rounded-full border border-border py-3 text-center text-sm font-semibold text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={close}
              className="rounded-full bg-foreground py-3 text-center text-sm font-semibold text-background"
            >
              Sign up
            </Link>
          </div>
        ) : null}
        <Link
          href="/enquire"
          onClick={close}
          className="block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
        >
          Post a requirement
        </Link>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-mr-1.5 grid size-10 place-items-center text-foreground transition-colors hover:text-primary"
      >
        <Menu className="size-6" />
      </button>

      {mounted && open ? createPortal(sheet, document.body) : null}
    </div>
  );
}
