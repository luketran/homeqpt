import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/rooms", label: "Phòng" },
  { href: "/admin/tenants", label: "Người thuê" },
  { href: "/admin/meters", label: "Điện nước" },
  { href: "/admin/invoices", label: "Hóa đơn" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("admin");
  return (
    <AppShell
      title="Phòng trọ · Admin"
      links={links}
      userName={profile.full_name ?? "Quản trị"}
    >
      {children}
    </AppShell>
  );
}
