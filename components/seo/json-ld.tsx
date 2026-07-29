import type { JsonLdNode } from "@/lib/seo/structured-data";

/**
 * Renders one or more JSON-LD blocks. `<` is escaped so a value can never break
 * out of the <script> element (XSS-safe even with untrusted data). This is a
 * `application/ld+json` data block — allowed under our CSP's `'unsafe-inline'`.
 */
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
