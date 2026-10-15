import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/tenant", label: "Tổng quan" },
  { href: "/tenant/meters", label: "Nhập điện nước" },
  { href: "/tenant/invoices", label: "Hóa đơn" },
];

export default async function TenantLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("tenant");
  return (
    <AppShell
      title="Phòng trọ"
      links={links}
      userName={profile.full_name ?? "Người thuê"}
    >
      {children}
    </AppShell>
  );
}
