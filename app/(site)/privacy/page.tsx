import Link from "next/link";
import { LegalShell, Section } from "../_legal-shell";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  description: "How BatchKart collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="29 July 2026">
      <Section heading="Overview">
        <p>
          BatchKart (&quot;we&quot;, &quot;us&quot;) helps students discover and compare coaching
          batches and connect with institutes. This policy explains what information we collect,
          why, and the choices you have.
        </p>
      </Section>

      <Section heading="Information we collect">
        <p>We collect only what we need to run the service:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Details you give us</strong> — your name, phone number and email when you sign
            up, post a requirement, or send us a message; and the preferences you share (exam,
            budget, preferred coaching, cities, and any scholarship notes or achievements).
          </li>
          <li>
            <strong>Account data</strong> — if you sign in with Google, we receive your basic
            profile (name and email) from Google.
          </li>
          <li>
            <strong>Usage data</strong> — basic technical information such as your device and pages
            visited, used to keep the service reliable and secure.
          </li>
        </ul>
      </Section>

      <Section heading="How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To show you relevant batches and respond to your enquiries and messages.</li>
          <li>To connect you with coaching institutes you express interest in.</li>
          <li>To create and manage your account and let you track your enquiries.</li>
          <li>To improve, secure and support the platform.</li>
        </ul>
      </Section>

      <Section heading="How we share it">
        <p>
          When you enquire about a batch, we may share the details you provided with the relevant
          coaching institute so they can respond. We use trusted service providers (for example, our
          database and authentication provider) to operate the platform. We do not sell your
          personal information.
        </p>
      </Section>

      <Section heading="Data retention">
        <p>
          We keep your information for as long as your account is active or as needed to provide the
          service and meet legal obligations. You can ask us to delete your account and associated
          data at any time.
        </p>
      </Section>

      <Section heading="Your choices & rights">
        <p>
          You can access or update your profile from your account, and request correction or
          deletion of your data by contacting us. You may opt out of non-essential communications at
          any time.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          We use industry-standard measures, including access controls and encryption in transit, to
          protect your information. No method of transmission or storage is completely secure, but we
          work to keep your data safe.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          Aspirants under 18 should use BatchKart with the involvement of a parent or guardian, who
          is responsible for the information shared.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          We may update this policy from time to time. We&apos;ll revise the &quot;last updated&quot;
          date above and, where appropriate, notify you.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about your privacy? Email us at{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-medium text-primary underline">
            {siteConfig.contactEmail}
          </a>{" "}
          or use our{" "}
          <Link href="/contact" className="font-medium text-primary underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </LegalShell>
  );
}
