import { siteConfig } from "@/config/site";

/** A JSON-LD node. Loosely typed — schema.org shapes are open-ended. */
export type JsonLdNode = Record<string, unknown>;

export function organizationSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/batches?exam={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqPageSchema(items: { q: string; a: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
