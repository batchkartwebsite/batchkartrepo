import Link from "next/link";
import { LegalShell, Section } from "../_legal-shell";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of BatchKart.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="29 July 2026">
      <Section heading="Acceptance">
        <p>
          By using BatchKart you agree to these terms. If you don&apos;t agree, please don&apos;t use
          the service.
        </p>
      </Section>

      <Section heading="What BatchKart is">
        <p>
          BatchKart is an information and discovery platform that lists coaching batches and helps
          you connect with institutes. We are not a coaching institute, and unless clearly stated we
          are not affiliated with the institutes listed. Listings are provided for your convenience
          and don&apos;t constitute an offer, endorsement, or guarantee.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          You&apos;re responsible for the accuracy of the information you provide and for keeping your
          login secure. Let us know promptly if you suspect unauthorised use of your account.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <ul className="list-disc space-y-1 pl-5">
          <li>Don&apos;t submit false, misleading, or spam enquiries.</li>
          <li>Don&apos;t attempt to disrupt, scrape, or misuse the platform.</li>
          <li>Don&apos;t use BatchKart for any unlawful purpose.</li>
        </ul>
      </Section>

      <Section heading="Listings, fees & third-party information">
        <p>
          Batch details, fees and discounts are provided by institutes or compiled for your
          reference and may change. Final fees, seats, schedules and admission decisions are
          determined solely by the institute. Always confirm details directly before making any
          payment.
        </p>
      </Section>

      <Section heading="Enquiries">
        <p>
          When you submit an enquiry, you consent to us sharing your provided details with relevant
          institutes so they can respond. We don&apos;t guarantee a response, admission, a particular
          fee, or any outcome.
        </p>
      </Section>

      <Section heading="Intellectual property">
        <p>
          The BatchKart name, design and original content are our property. Institute names and logos
          belong to their respective owners and are used for identification only.
        </p>
      </Section>

      <Section heading="Disclaimers & limitation of liability">
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. To the extent
          permitted by law, BatchKart is not liable for decisions you make based on listings, or for
          any dealings between you and an institute.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update these terms from time to time. Continued use after changes means you accept
          the updated terms.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>These terms are governed by the laws of India.</p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-medium text-primary underline">
            {siteConfig.contactEmail}
          </a>{" "}
          or visit our{" "}
          <Link href="/contact" className="font-medium text-primary underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </LegalShell>
  );
}
