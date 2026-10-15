"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getMyRoom } from "@/lib/tenant";

export async function submitReading(formData: FormData) {
  const my = await getMyRoom();
  if (!my) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const num = (k: string) => Math.max(0, Number(formData.get(k) ?? 0));

  await supabase.from("meter_readings").upsert(
    {
      room_id: my.roomId,
      period_year: year,
      period_month: month,
      elec_old: num("elec_old"),
      elec_new: num("elec_new"),
      water_old: num("water_old"),
      water_new: num("water_new"),
      recorded_by: user?.id ?? null,
    },
    { onConflict: "room_id,period_year,period_month" },
  );

  revalidatePath("/tenant/meters");
  revalidatePath("/tenant");
}
