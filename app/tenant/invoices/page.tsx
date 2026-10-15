import { createClient } from "@/lib/supabase/server";
import { getMyRoom } from "@/lib/tenant";
import { formatVND, formatPeriod } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function TenantInvoicesPage() {
  const my = await getMyRoom();
  if (!my) {
    return (
      <div>
        <PageHeader title="Hóa đơn" />
        <Card>
          <p className="text-slate-500">Tài khoản chưa được gán phòng.</p>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("room_id", my.roomId)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader title="Hóa đơn" />
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Kỳ</th>
              <th className="px-5 py-3 font-medium">Tổng tiền</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.length ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {formatPeriod(inv.period_month, inv.period_year)}
                  </td>
                  <td className="px-5 py-3">{formatVND(inv.total)}</td>
                  <td className="px-5 py-3">
                    <Badge status={inv.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  Chưa có hóa đơn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
