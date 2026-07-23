export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin" }] },
  { label: "Catalog", items: [
    { label: "Coaching", href: "/admin/coaching" },
    { label: "Batches", href: "/admin/batches" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Cities & States", href: "/admin/cities" },
  ]},
  { label: "Community", items: [
    { label: "Students", href: "/admin/students" },
    { label: "Requirement Posts", href: "/admin/requirements" },
    { label: "Discount Requests", href: "/admin/discount-requests" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
  ]},
  { label: "Content", items: [
    { label: "Blog", href: "/admin/blogs" },
    { label: "Testimonials", href: "/admin/testimonials" },
    { label: "Media Library", href: "/admin/media" },
  ]},
  { label: "System", items: [
    { label: "Moderation", href: "/admin/moderation" },
    { label: "SEO", href: "/admin/seo" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Settings", href: "/admin/settings" },
    { label: "Audit Logs", href: "/admin/audit-logs" },
    { label: "Users", href: "/admin/users" },
  ]},
];
