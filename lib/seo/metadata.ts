import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const OG_ALT = `${siteConfig.name} — discover & compare coaching batches`;

/**
 * Social images live at these stable routes (`app/opengraph-image.tsx` /
 * `app/twitter-image.tsx`). We reference them explicitly because the file
 * convention's automatic injection does not merge when pages also set their own
 * `openGraph` object. `metadataBase` resolves these to absolute URLs.
 */
export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: OG_ALT };
export const TWITTER_IMAGE = { url: "/twitter-image", width: 1200, height: 630, alt: OG_ALT };

type PageMetaInput = {
  /** Page title. Templated as "%s · BatchKart" unless `absoluteTitle` is set. */
  title: string;
  description: string;
  /** Absolute path from the site root, e.g. "/faq" or "/". Drives the canonical + OG url. */
  path: string;
  /** Use the title verbatim as the document title (ignores the parent template). */
  absoluteTitle?: boolean;
  /** Keep the page out of search indexes (private / thin pages). */
  noindex?: boolean;
};

/**
 * Build a consistent per-page `Metadata` object: canonical URL, Open Graph, and
 * Twitter card, all derived from one source. The social image is supplied
 * site-wide by `app/opengraph-image.tsx` / `app/twitter-image.tsx`, so it is
 * intentionally not set here.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  noindex,
}: PageMetaInput): Metadata {
  const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_IN",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [TWITTER_IMAGE],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
