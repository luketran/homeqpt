import { createClient } from "@/lib/supabase/server";
import { ActionButton, Card, PageHeader } from "@/components/ui";

import { endTenancy } from "./actions";
import { TenantForm } from "./tenant-form";

export default async function TenantsPage() {
  const supabase = await createClient();

  const [{ data: tenants }, { data: rooms }] = await Promise.all([
    supabase
      .from("tenants")
      .select("*, rooms(code)")
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase.from("rooms").select("id, code").order("code"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Người thuê" />

      <Card>
        <TenantForm rooms={rooms ?? []} />
      </Card>

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Họ tên</th>
              <th className="px-5 py-3 font-medium">Phòng</th>
              <th className="px-5 py-3 font-medium">SĐT</th>
              <th className="px-5 py-3 font-medium">Vào ở</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {tenants?.length ? (
              tenants.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium">{t.full_name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {(t.rooms as unknown as { code: string } | null)?.code ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{t.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {t.move_in_date ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={endTenancy} className="inline">
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="room_id" value={t.room_id ?? ""} />
                      <ActionButton
                        className="text-red-500 hover:text-red-700"
                        pendingText="Đang xử lý…"
                      >
                        Kết thúc thuê
                      </ActionButton>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Chưa có người thuê.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
