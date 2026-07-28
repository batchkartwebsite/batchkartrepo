export type NavLink = { label: string; href: string };

export const siteConfig = {
  name: "BatchKart",
  url: "https://batchkart.com",
  description:
    "India's most trusted way to discover, compare and enquire about coaching batches for NEET, JEE, UPSC and more — verified institutes, honest fees, zero guesswork.",
  contactEmail: "hello@batchkart.com",
  // Header nav — all targets resolve (page routes or on-page anchors).
  mainNav: [
    { label: "Batches", href: "/batches" },
    { label: "Exams", href: "/#exams" },
    { label: "How it works", href: "/#how" },
    { label: "Reviews", href: "/#reviews" },
    { label: "FAQ", href: "/#faq" },
  ] satisfies NavLink[],
  footer: {
    explore: [
      { label: "Browse batches", href: "/batches" },
      { label: "Popular exams", href: "/#exams" },
      { label: "How it works", href: "/#how" },
      { label: "Reviews", href: "/#reviews" },
    ] satisfies NavLink[],
    company: [
      { label: "Why BatchKart", href: "/#why" },
      { label: "FAQ", href: "/#faq" },
      { label: "Send an enquiry", href: "/batches#enquiry" },
    ] satisfies NavLink[],
  },
} as const;
