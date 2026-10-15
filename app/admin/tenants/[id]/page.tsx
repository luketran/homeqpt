import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, PageHeader } from "@/components/ui";

import { TenantEditForm } from "./tenant-edit-form";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tenant }, { data: rooms }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", id).single(),
    supabase.from("rooms").select("id, code").order("code"),
  ]);

  if (!tenant) notFound();

  // Email đăng nhập hiện tại (nếu có tài khoản) — đọc bằng service-role.
  let currentEmail: string | null = null;
  if (tenant.profile_id) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(tenant.profile_id);
    currentEmail = data.user?.email ?? null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết người thuê"
        action={
          <Link
            href="/admin/tenants"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Danh sách
          </Link>
        }
      />

      <Card>
        <TenantEditForm
          tenant={tenant}
          rooms={rooms ?? []}
          currentEmail={currentEmail}
        />
      </Card>
    </div>
  );
}
