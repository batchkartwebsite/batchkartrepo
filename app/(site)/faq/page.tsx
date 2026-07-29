import Link from "next/link";
import { Plus } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageSchema } from "@/lib/seo/structured-data";

export const metadata = pageMetadata({
  title: "FAQ",
  description: "Answers to common questions about BatchKart, enquiries, accounts and more.",
  path: "/faq",
});

const SECTIONS: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "General",
    items: [
      { q: "What is BatchKart?", a: "BatchKart is a marketplace to discover and compare coaching batches for exams like NEET, JEE, UPSC, GATE and more. We bring listings from many institutes into one place so you can choose the right batch and enquire without the runaround." },
      { q: "Is BatchKart free for students?", a: "Yes — browsing, comparing, and sending enquiries are completely free. We never charge students." },
      { q: "Which exams and cities are covered?", a: "We cover major entrance and government exams, with batches across many cities as well as online options. New exams and institutes are added regularly." },
      { q: "Are the batches and institutes verified?", a: "Every batch is reviewed before it goes live, and we keep listings current so you don't chase offers that no longer exist. If an institute is turned off, its batches stop showing." },
    ],
  },
  {
    heading: "Enquiries & contact",
    items: [
      { q: "What's the difference between an enquiry and a contact message?", a: "An enquiry (\"Post a requirement\") is the detailed route — you share your exam, budget, preferred coaching and batches, and we shortlist and connect you. A contact message is a quick one-off question. Both reach our team." },
      { q: "What happens after I enquire?", a: "Your details reach our team, we shortlist the best-fit batches for your exam, city and budget, and connect you with the institute. There's no spam, and you stay in control." },
      { q: "Do I have to fill everything again for each batch?", a: "No. When you click Enquire on a batch, that batch and its exam are pre-filled for you. If you're logged in, your name, phone and email are filled in too." },
      { q: "How soon will I hear back?", a: "Our team typically responds within a business day. You can track the status of every enquiry from your account." },
    ],
  },
  {
    heading: "Accounts",
    items: [
      { q: "Do I need an account to enquire?", a: "No — you can enquire as a guest. But creating a free account lets you track all your enquiries and messages in one place." },
      { q: "How do I sign up?", a: "Use email and password, or continue with Google. Signing up takes a few seconds, and your phone number is optional." },
      { q: "I forgot my password — what do I do?", a: "On the login page, click \"Forgot password?\" and we'll email you a secure reset link." },
      { q: "Can I see my past enquiries?", a: "Yes. Everything you submit while logged in shows up under \"My enquiries\" and \"My messages\" in your account." },
    ],
  },
  {
    heading: "Fees, discounts & scholarships",
    items: [
      { q: "Are the fees shown final?", a: "We show the fees institutes provide, including any current discounts. Final fees and terms are confirmed by the institute — always verify before paying." },
      { q: "How do discounts work?", a: "Batches with an active discount show the discounted price alongside the original, with the percentage off. Discounts are time-limited and set by the institute." },
      { q: "Can I ask about a scholarship?", a: "Yes. When you post a requirement, there's a field to tell us why you need a scholarship and to share any achievements — we pass this along when connecting you." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[860px] px-6 py-16 lg:px-[60px]">
      <JsonLd data={faqPageSchema(SECTIONS.flatMap((s) => s.items))} />
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Questions, answered
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
            Contact us
          </Link>{" "}
          and we&apos;ll help.
        </p>
      </header>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-semibold text-foreground">{section.heading}</h2>
            <div className="mt-3 divide-y divide-border rounded-3xl border border-border bg-card px-6">
              {section.items.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      <Plus className="size-3.5" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
