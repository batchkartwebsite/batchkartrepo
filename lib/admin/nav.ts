export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin" }] },
  {
    label: "Manage",
    items: [
      { label: "Batches", href: "/admin/batches" },
      { label: "Queries", href: "/admin/queries" },
    ],
  },
];
