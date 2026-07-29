import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return <AdminShell admin={{ name: profile.full_name ?? profile.email ?? "Admin" }}>{children}</AdminShell>;
}
