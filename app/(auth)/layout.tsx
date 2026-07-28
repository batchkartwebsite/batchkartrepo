import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative isolate hidden overflow-hidden bg-[#0b1220] p-12 text-white lg:flex lg:flex-col lg:justify-between bk-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(55% 50% at 15% 10%, rgba(16,185,129,0.30), transparent 60%), radial-gradient(45% 45% at 95% 100%, rgba(245,158,11,0.16), transparent 60%)",
          }}
        />
        <Link href="/">
          <Logo className="text-white" />
        </Link>
        <div>
          <h2 className="font-display max-w-md text-4xl font-semibold leading-tight">
            Your prep journey, organised.
          </h2>
          <p className="mt-4 max-w-sm text-slate-400">
            Save batches, track every enquiry, and pick up right where you left off — all in one
            account.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li>✅ Track all your enquiries in one place</li>
            <li>✅ Verified institutes &amp; honest fees</li>
            <li>✅ Free, forever</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">© 2026 BatchKart · Made in India 🇮🇳</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
