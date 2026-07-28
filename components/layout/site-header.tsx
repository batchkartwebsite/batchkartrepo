import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <>
      {/* Announcement bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex h-10 max-w-[1160px] items-center justify-center gap-2 px-6 text-center text-[13px] font-medium lg:px-[60px]">
          <span className="hidden sm:inline">🎉</span>
          <span className="truncate">
            10,000+ verified batches across NEET · JEE · UPSC —{" "}
            <Link href="/batches" className="underline decoration-primary decoration-2 underline-offset-2">
              explore now
            </Link>
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6 lg:px-[60px]">
          <Link href="/" aria-label="BatchKart home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {siteConfig.mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-secondary-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/batches#enquiry"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:shadow-md sm:inline-flex"
            >
              Send enquiry
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
