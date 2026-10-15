import { createClient } from "@/lib/supabase/server";
import { getMyRoom } from "@/lib/tenant";
import { calcInvoice } from "@/lib/calc";
import { formatVND } from "@/lib/format";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { PeriodSelector } from "@/components/period-selector";
import { resolvePeriod, prevPeriod } from "@/lib/period";

import { submitReading } from "./actions";

export default async function TenantMetersPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const my = await getMyRoom();
  if (!my) {
    return (
      <div className="max-w-xl">
        <PageHeader title="Nhập điện nước" />
        <Card>
          <p className="text-slate-500">
            Tài khoản chưa được gán phòng. Vui lòng liên hệ quản lý.
          </p>
        </Card>
      </div>
    );
  }

  const sp = await searchParams;
  const { month, year } = resolvePeriod(sp);
  const prev = prevPeriod(month, year);

  const supabase = await createClient();
  const [{ data: cur }, { data: last }, { data: settings }] = await Promise.all([
    supabase
      .from("meter_readings")
      .select("*")
      .eq("room_id", my.roomId)
      .eq("period_year", year)
      .eq("period_month", month)
      .maybeSingle(),
    supabase
      .from("meter_readings")
      .select("elec_new, water_new")
      .eq("room_id", my.roomId)
      .eq("period_year", prev.year)
      .eq("period_month", prev.month)
      .maybeSingle(),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);

  const estimate =
    cur && settings
      ? calcInvoice({
          roomPrice: my.roomPrice,
          elecOld: cur.elec_old,
          elecNew: cur.elec_new,
          waterOld: cur.water_old,
          waterNew: cur.water_new,
          electricityPrice: settings.electricity_price,
          waterPrice: settings.water_price,
          managementFee: settings.management_fee,
        })
      : null;

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title={`Nhập điện nước · Phòng ${my.roomCode}`}
        action={<PeriodSelector month={month} year={year} />}
      />

      <Card>
        <form action={submitReading} className="space-y-4">
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="block text-xs text-slate-500">Điện — chỉ số cũ</span>
              <input
                name="elec_old"
                type="number"
                step="0.1"
                defaultValue={cur?.elec_old ?? last?.elec_new ?? 0}
                className={input}
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-slate-500">Điện — chỉ số mới</span>
              <input
                name="elec_new"
                type="number"
                step="0.1"
                defaultValue={cur?.elec_new ?? ""}
                className={input}
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-slate-500">Nước — chỉ số cũ</span>
              <input
                name="water_old"
                type="number"
                step="0.1"
                defaultValue={cur?.water_old ?? last?.water_new ?? 0}
                className={input}
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-slate-500">Nước — chỉ số mới</span>
              <input
                name="water_new"
                type="number"
                step="0.1"
                defaultValue={cur?.water_new ?? ""}
                className={input}
              />
            </label>
          </div>

          <SubmitButton>Lưu & tính tiền</SubmitButton>
        </form>
      </Card>

      {estimate && (
        <Card>
          <p className="mb-3 text-sm font-medium text-slate-700">Tạm tính kỳ này</p>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Điện: {estimate.elecUsage} kWh → {formatVND(estimate.elecAmount)}
            </p>
            <p>
              Nước: {estimate.waterUsage} m³ → {formatVND(estimate.waterAmount)}
            </p>
            <p>Tiền phòng: {formatVND(estimate.roomPrice)}</p>
            <p>Phí quản lý: {formatVND(estimate.managementFee)}</p>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold">Dự kiến phải trả</span>
            <span className="text-lg font-semibold">{formatVND(estimate.total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Số cuối cùng do quản lý chốt (có thể cộng thêm phí khác).
          </p>
        </Card>
      )}
    </div>
  );
}
