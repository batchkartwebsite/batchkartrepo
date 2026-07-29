import type { LucideIcon } from "lucide-react";
import { Stethoscope, Atom, Landmark, BarChart3, Wrench, FolderOpen, Scale, Banknote } from "lucide-react";

/** Popular exam categories surfaced on the homepage + batches filter. */
export type PopularExam = { name: string; blurb: string; Icon: LucideIcon };

export const POPULAR_EXAMS: PopularExam[] = [
  { name: "NEET", blurb: "Medical entrance", Icon: Stethoscope },
  { name: "JEE", blurb: "Engineering entrance", Icon: Atom },
  { name: "UPSC", blurb: "Civil services", Icon: Landmark },
  { name: "CAT", blurb: "MBA entrance", Icon: BarChart3 },
  { name: "GATE", blurb: "PG & PSUs", Icon: Wrench },
  { name: "SSC", blurb: "Govt. jobs", Icon: FolderOpen },
  { name: "CLAT", blurb: "Law entrance", Icon: Scale },
  { name: "Banking", blurb: "IBPS / SBI", Icon: Banknote },
];
