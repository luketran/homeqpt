import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getMyRoom } from "@/lib/tenant";
import { currentPeriod } from "@/lib/format";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { InvoiceView } from "@/components/invoice-view";

export default async function TenantHome() {
  const my = await getMyRoom();
  const { month, year } = currentPeriod();

  if (!my) {
    return (
      <div className="max-w-xl">
        <PageHeader title="Tổng quan" />
        <Card>
          <p className="text-slate-500">
            Tài khoản của bạn chưa được gán phòng. Vui lòng liên hệ quản lý.
          </p>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("room_id", my.roomId)
    .eq("period_year", year)
    .eq("period_month", month)
    .maybeSingle();

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="Tổng quan" />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Phòng" value={my.roomCode} />
        <StatCard label="Kỳ hiện tại" value={`${month}/${year}`} />
      </div>

      <Card>
        <p className="mb-4 text-sm font-medium text-slate-700">Hóa đơn kỳ này</p>
        {invoice ? (
          <InvoiceView invoice={invoice} roomCode={my.roomCode} />
        ) : (
          <div className="space-y-3 text-sm text-slate-500">
            <p>Chưa có hóa đơn cho kỳ này.</p>
            <Link
              href="/tenant/meters"
              className="inline-block rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
            >
              Nhập số điện nước
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
