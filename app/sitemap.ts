import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

// Canonical public routes. Batch detail pages (scope B) will extend this list.
const ROUTES: { path: string; changeFrequency: ChangeFreq; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/batches", changeFrequency: "daily", priority: 0.9 },
  { path: "/enquire", changeFrequency: "monthly", priority: 0.7 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: r.path === "/" ? siteConfig.url : `${siteConfig.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
