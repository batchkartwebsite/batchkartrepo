/**
 * Known coaching institutes + their logos (saved under `public/logos/`).
 *
 * NOTE: these are third-party brand marks fetched for identification of the
 * institutes whose batches are listed (nominative use). For production, confirm
 * usage rights / prefer official brand assets where required.
 */
export type Institute = { name: string; slug: string; domain: string; logo: string };

export const INSTITUTES: Institute[] = [
  { name: "Allen Career Institute", slug: "allen", domain: "allen.ac.in", logo: "/logos/allen.png" },
  { name: "Aakash Institute", slug: "aakash", domain: "aakash.ac.in", logo: "/logos/aakash.png" },
  { name: "Physics Wallah", slug: "pw", domain: "pw.live", logo: "/logos/pw.png" },
  { name: "FIITJEE", slug: "fiitjee", domain: "fiitjee.com", logo: "/logos/fiitjee.png" },
  { name: "Vajiram & Ravi", slug: "vajiram", domain: "vajiramandravi.com", logo: "/logos/vajiram.png" },
  { name: "Drishti IAS", slug: "drishti", domain: "drishtiias.com", logo: "/logos/drishti.png" },
  { name: "Unacademy", slug: "unacademy", domain: "unacademy.com", logo: "/logos/unacademy.png" },
  { name: "Made Easy", slug: "madeeasy", domain: "madeeasy.in", logo: "/logos/madeeasy.png" },
  { name: "Resonance", slug: "resonance", domain: "resonance.ac.in", logo: "/logos/resonance.png" },
  { name: "BYJU'S", slug: "byjus", domain: "byjus.com", logo: "/logos/byjus.png" },
];

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Substring aliases → slug, so free-text institute names on batches still match.
const ALIASES: [string, string][] = [
  ["physicswallah", "pw"],
  ["pw", "pw"],
  ["allen", "allen"],
  ["aakash", "aakash"],
  ["akash", "aakash"],
  ["fiitjee", "fiitjee"],
  ["vajiram", "vajiram"],
  ["drishti", "drishti"],
  ["unacademy", "unacademy"],
  ["madeeasy", "madeeasy"],
  ["resonance", "resonance"],
  ["byjus", "byjus"],
];

const BY_SLUG = new Map(INSTITUTES.map((i) => [i.slug, i]));

/** Resolve a (possibly free-text) institute name to a saved logo path, or null. */
export function logoForInstitute(name: string | null | undefined): string | null {
  if (!name) return null;
  const n = norm(name);
  for (const inst of INSTITUTES) {
    if (norm(inst.name) === n) return inst.logo;
  }
  for (const [key, slug] of ALIASES) {
    if (n.includes(key)) return BY_SLUG.get(slug)?.logo ?? null;
  }
  return null;
}
