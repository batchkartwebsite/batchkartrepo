import Link from "next/link";
import { getActiveExamNames } from "@/lib/server/catalog";
import { siteConfig } from "@/config/site";
import { EnquiryForm } from "../batches/enquiry-form";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch with the BatchKart team.",
  path: "/contact",
});

export default async function ContactPage() {
  const examNames = await getActiveExamNames();

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16 lg:px-[60px]">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contact</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Talk to us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a quick question? Send a message and our team will get back to you.
        </p>
      </header>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Email us</h2>
            <a href={`mailto:${siteConfig.contactEmail}`} className="mt-1 block text-sm font-medium text-primary hover:underline">
              {siteConfig.contactEmail}
            </a>
            <p className="mt-3 text-sm text-muted-foreground">We usually reply within one business day.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Looking for a batch?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Post a requirement and we&apos;ll shortlist the best-fit batches for you.
            </p>
            <Link href="/enquire" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Post a requirement →
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-border bg-card p-6 lg:p-8">
          <EnquiryForm exams={examNames} />
        </div>
      </div>
    </div>
  );
}
