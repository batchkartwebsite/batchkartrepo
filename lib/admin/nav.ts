export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin" }] },
  {
    label: "Catalog",
    items: [
      { label: "Batches", href: "/admin/batches" },
      { label: "Discounted", href: "/admin/discounted" },
      { label: "Coaching", href: "/admin/coaching" },
      { label: "Exams", href: "/admin/exams" },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "Enquiries", href: "/admin/enquiries" },
      { label: "Contact", href: "/admin/contact" },
    ],
  },
];
