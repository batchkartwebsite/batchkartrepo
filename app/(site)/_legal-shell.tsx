import type { ReactNode } from "react";

/** Shared layout for the Privacy / Terms pages. */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[820px] px-6 py-16 lg:px-[60px]">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Legal</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
        This is a plain-language template for BatchKart and is not legal advice. Please have it
        reviewed by a qualified professional before you rely on it in production.
      </div>

      <div className="prose-legal mt-8 space-y-6">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-foreground">{heading}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
