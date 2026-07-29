import Link from "next/link";
import { BadgeCheck, Wallet, Zap, ArrowRight, MessageCircleQuestion } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

const TRUST = [
  { Icon: BadgeCheck, label: "Verified institutes" },
  { Icon: Wallet, label: "Honest, upfront fees" },
  { Icon: Zap, label: "Free for students" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-[#0b1220] text-slate-400">
      {/* atmospheric mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50% 60% at 12% 0%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(40% 50% at 95% 10%, rgba(245,158,11,0.10), transparent 60%)",
        }}
      />
      {/* oversized brand watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[7rem] font-bold leading-none tracking-tight text-white/[0.03] sm:text-[11rem] lg:text-[15rem]"
      >
        BatchKart
      </div>

      <div className="relative mx-auto max-w-[1160px] px-6 py-16 lg:px-[60px]">
        {/* CTA strip */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary sm:grid">
              <MessageCircleQuestion className="size-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold text-white md:text-3xl">
                Can&apos;t decide which batch?
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Tell us your exam and city, and we&apos;ll shortlist the right batches and connect you.
              </p>
            </div>
          </div>
          <Link
            href="/enquire"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Post a requirement
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* trust row */}
        <div className="mb-14 grid gap-3 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <t.Icon className="size-5" />
              </span>
              <span className="text-sm font-medium text-slate-200">{t.label}</span>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{siteConfig.description}</p>

          </div>
          <FooterCol title="Explore" links={siteConfig.footer.explore} />
          <FooterCol title="Company" links={siteConfig.footer.company} />
          <FooterCol title="Legal" links={siteConfig.footer.legal} />
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 {siteConfig.name}. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block size-2 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400" />
            Made in India · batchkart.com
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h5>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
