import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

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
      <div className="relative mx-auto max-w-[1160px] px-6 py-16 lg:px-[60px]">
        {/* CTA strip */}
        <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:flex-row md:items-center">
          <div>
            <h3 className="font-display text-2xl font-semibold text-white md:text-3xl">
              Can&apos;t decide which batch?
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Tell us your exam and city — we&apos;ll shortlist the right batches and connect you.
            </p>
          </div>
          <Link
            href="/enquire"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Post a requirement →
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{siteConfig.description}</p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-4 inline-block text-sm text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white"
            >
              {siteConfig.contactEmail}
            </a>
          </div>
          <FooterCol title="Explore" links={siteConfig.footer.explore} />
          <FooterCol title="Company" links={siteConfig.footer.company} />
          <FooterCol title="Legal" links={siteConfig.footer.legal} />
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-6 text-xs">
          <span>© 2026 BatchKart. All rights reserved.</span>
          <span>Made in India 🇮🇳 · batchkart.com</span>
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
