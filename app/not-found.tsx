import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center px-6 py-20 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for may have moved or never existed. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Back home
        </Link>
        <Link
          href="/batches"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Browse batches
        </Link>
      </div>
    </div>
  );
}
