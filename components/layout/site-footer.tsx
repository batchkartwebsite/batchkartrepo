import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#0b1220] text-slate-400">
      <div className="mx-auto max-w-[1160px] px-6 py-14 lg:px-[60px]">
        <div className="grid gap-10 md:grid-cols-[2.2fr_1fr_1fr]">
          <div>
            <Logo className="text-white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{siteConfig.description}</p>
          </div>
          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h5>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-200">Legal</h5>
            <ul className="space-y-3 text-sm">
              {siteConfig.footer.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-slate-800 pt-5 text-xs">
          <span>© 2026 BatchKart. All rights reserved.</span>
          <span>Made in India 🇮🇳 · batchkart.com</span>
        </div>
      </div>
    </footer>
  );
}
