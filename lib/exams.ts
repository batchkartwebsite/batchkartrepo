/** Popular exam categories surfaced on the homepage + batches filter. */
export type PopularExam = { name: string; emoji: string; blurb: string };

export const POPULAR_EXAMS: PopularExam[] = [
  { name: "NEET", emoji: "🩺", blurb: "Medical entrance" },
  { name: "JEE", emoji: "⚛️", blurb: "Engineering entrance" },
  { name: "UPSC", emoji: "🏛️", blurb: "Civil services" },
  { name: "CAT", emoji: "📊", blurb: "MBA entrance" },
  { name: "GATE", emoji: "🛠️", blurb: "PG & PSUs" },
  { name: "SSC", emoji: "🗂️", blurb: "Govt. jobs" },
  { name: "CLAT", emoji: "⚖️", blurb: "Law entrance" },
  { name: "Banking", emoji: "🏦", blurb: "IBPS / SBI" },
];
