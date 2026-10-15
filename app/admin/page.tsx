import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatVND, formatPeriod, currentPeriod } from "@/lib/format";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";

export default async function AdminDashboard() {
  const { month, year } = currentPeriod();
  const supabase = await createClient();

  const [{ data: rooms }, { data: invoices }] = await Promise.all([
    supabase.from("rooms").select("status"),
    supabase
      .from("invoices")
      .select("*, rooms(code)")
      .eq("period_year", year)
      .eq("period_month", month),
  ]);

  const totalRooms = rooms?.length ?? 0;
  const occupied = rooms?.filter((r) => r.status === "occupied").length ?? 0;
  const vacant = totalRooms - occupied;

  const revenue =
    invoices
      ?.filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.total, 0) ?? 0;
  const outstanding =
    invoices
      ?.filter((i) => i.status === "unpaid")
      .reduce((s, i) => s + i.total, 0) ?? 0;
  const unpaid = invoices?.filter((i) => i.status === "unpaid") ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={`Tổng quan · Kỳ ${formatPeriod(month, year)}`} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Tổng số phòng" value={totalRooms} />
        <StatCard
          label="Đang thuê / Trống"
          value={`${occupied} / ${vacant}`}
        />
        <StatCard
          label="Đã thu (kỳ này)"
          value={formatVND(revenue)}
        />
        <StatCard
          label="Còn phải thu"
          value={formatVND(outstanding)}
          hint={`${unpaid.length} hóa đơn chưa TT`}
        />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm font-medium text-slate-700">
            Hóa đơn chưa thanh toán
          </p>
          <Link
            href="/admin/invoices"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Xem tất cả →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Phòng</th>
              <th className="px-5 py-3 font-medium">Tổng tiền</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {unpaid.length ? (
              unpaid.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {(i.rooms as unknown as { code: string } | null)?.code ?? "—"}
                  </td>
                  <td className="px-5 py-3">{formatVND(i.total)}</td>
                  <td className="px-5 py-3">
                    <Badge status={i.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  Không có công nợ kỳ này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
