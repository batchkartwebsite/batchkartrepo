import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6 lg:px-[60px]">
        <Link href="/" aria-label="BatchKart home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-secondary-foreground md:flex">
          {siteConfig.mainNav.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" nativeButton={false} render={<Link href="/requirements/new" />} className="hidden sm:inline-flex">
            Post a Requirement
          </Button>
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />} className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/signup" />}>
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
}
