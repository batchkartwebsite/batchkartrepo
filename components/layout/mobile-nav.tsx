"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-xl border border-border text-foreground"
      >
        <div className="flex flex-col items-center justify-center gap-[5px]">
          <span
            className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </div>
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[calc(2.5rem+4rem)] z-40 border-b border-border bg-background/95 px-6 pb-6 pt-2 backdrop-blur">
          <nav className="flex flex-col divide-y divide-border">
            {siteConfig.mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/batches#enquiry"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
          >
            Send an enquiry
          </Link>
        </div>
      ) : null}
    </div>
  );
}
