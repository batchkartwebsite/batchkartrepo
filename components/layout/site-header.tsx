import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthNav } from "@/components/layout/auth-nav";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
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
            <div className="hidden md:block">
              <AuthNav />
            </div>
            <MobileNav />
          </div>
        </div>
      </header>
  );
}
