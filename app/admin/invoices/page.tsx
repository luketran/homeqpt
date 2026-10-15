import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatVND } from "@/lib/format";
import { ActionButton, Badge, Card, PageHeader } from "@/components/ui";
import { PeriodSelector } from "@/components/period-selector";
import { resolvePeriod } from "@/lib/period";

import { generateInvoice, setPaid } from "./actions";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const { month, year } = resolvePeriod(sp);

  const supabase = await createClient();
  const [{ data: rooms }, { data: invoices }, { data: readings }] =
    await Promise.all([
      supabase.from("rooms").select("id, code").order("code"),
      supabase
        .from("invoices")
        .select("*")
        .eq("period_year", year)
        .eq("period_month", month),
      supabase
        .from("meter_readings")
        .select("room_id")
        .eq("period_year", year)
        .eq("period_month", month),
    ]);

  const invByRoom = new Map((invoices ?? []).map((i) => [i.room_id, i]));
  const hasReading = new Set((readings ?? []).map((r) => r.room_id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hóa đơn"
        action={<PeriodSelector month={month} year={year} />}
      />

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Phòng</th>
              <th className="px-5 py-3 font-medium">Tổng tiền</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rooms?.map((room) => {
              const inv = invByRoom.get(room.id);
              return (
                <tr key={room.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium">{room.code}</td>
                  <td className="px-5 py-3">
                    {inv ? formatVND(inv.total) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {inv ? <Badge status={inv.status} /> : (
                      <span className="text-xs text-slate-400">Chưa tạo</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {inv ? (
                      <>
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          Chi tiết
                        </Link>
                        <form action={setPaid} className="ml-4 inline">
                          <input type="hidden" name="id" value={inv.id} />
                          <input
                            type="hidden"
                            name="paid"
                            value={String(inv.status !== "paid")}
                          />
                          <ActionButton
                            className="text-emerald-600 hover:text-emerald-800"
                            pendingText="…"
                          >
                            {inv.status === "paid" ? "Bỏ TT" : "Đã TT"}
                          </ActionButton>
                        </form>
                      </>
                    ) : hasReading.has(room.id) ? (
                      <form action={generateInvoice} className="inline">
                        <input type="hidden" name="room_id" value={room.id} />
                        <input type="hidden" name="year" value={year} />
                        <input type="hidden" name="month" value={month} />
                        <ActionButton
                          className="text-slate-900 hover:underline"
                          pendingText="Đang tạo…"
                        >
                          Tạo hóa đơn
                        </ActionButton>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-300">
                        Chưa nhập điện nước
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
