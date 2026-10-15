import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, SubmitButton } from "@/components/ui";
import { PeriodSelector } from "@/components/period-selector";
import { resolvePeriod, prevPeriod } from "@/lib/period";

import { upsertReading } from "./actions";

export default async function MetersPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const { month, year } = resolvePeriod(sp);
  const prev = prevPeriod(month, year);

  const supabase = await createClient();
  const [{ data: rooms }, { data: cur }, { data: last }] = await Promise.all([
    supabase.from("rooms").select("id, code").order("code"),
    supabase
      .from("meter_readings")
      .select("*")
      .eq("period_year", year)
      .eq("period_month", month),
    supabase
      .from("meter_readings")
      .select("room_id, elec_new, water_new")
      .eq("period_year", prev.year)
      .eq("period_month", prev.month),
  ]);

  const curByRoom = new Map((cur ?? []).map((r) => [r.room_id, r]));
  const lastByRoom = new Map((last ?? []).map((r) => [r.room_id, r]));

  const input =
    "w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900";

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Điện nước"
        action={<PeriodSelector month={month} year={year} />}
      />

      {rooms?.length ? (
        <div className="space-y-4">
          {rooms.map((room) => {
            const c = curByRoom.get(room.id);
            const l = lastByRoom.get(room.id);
            return (
              <Card key={room.id}>
                <form action={upsertReading} className="flex flex-wrap items-end gap-4">
                  <input type="hidden" name="room_id" value={room.id} />
                  <input type="hidden" name="year" value={year} />
                  <input type="hidden" name="month" value={month} />

                  <div className="w-16">
                    <p className="text-xs text-slate-400">Phòng</p>
                    <p className="font-semibold">{room.code}</p>
                  </div>

                  <label className="space-y-1">
                    <span className="block text-xs text-slate-500">Điện cũ</span>
                    <input
                      name="elec_old"
                      type="number"
                      step="0.1"
                      defaultValue={c?.elec_old ?? l?.elec_new ?? 0}
                      className={input}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-slate-500">Điện mới</span>
                    <input
                      name="elec_new"
                      type="number"
                      step="0.1"
                      defaultValue={c?.elec_new ?? ""}
                      className={input}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-slate-500">Nước cũ</span>
                    <input
                      name="water_old"
                      type="number"
                      step="0.1"
                      defaultValue={c?.water_old ?? l?.water_new ?? 0}
                      className={input}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs text-slate-500">Nước mới</span>
                    <input
                      name="water_new"
                      type="number"
                      step="0.1"
                      defaultValue={c?.water_new ?? ""}
                      className={input}
                    />
                  </label>

                  <SubmitButton>Lưu</SubmitButton>
                </form>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-center text-slate-400">Chưa có phòng nào.</p>
        </Card>
      )}
    </div>
  );
}
