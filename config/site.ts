export type NavLink = { label: string; href: string };

export const siteConfig = {
  name: "BatchKart",
  url: "https://batchkart.com",
  description:
    "India's most trusted platform for finding and comparing coaching batches. We connect ambitious students with the best educators.",
  mainNav: [
    { label: "Explore Batches", href: "/batches" },
    { label: "Coaching", href: "/coaching" },
    { label: "Exams", href: "/exams" },
    { label: "Discounts", href: "/discounts" },
    { label: "Blog", href: "/blog" },
  ] satisfies NavLink[],
  footer: {
    quickLinks: [
      { label: "All Batches", href: "/batches" },
      { label: "About Us", href: "/about" },
      { label: "Contact Support", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ] satisfies NavLink[],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ] satisfies NavLink[],
  },
} as const;
