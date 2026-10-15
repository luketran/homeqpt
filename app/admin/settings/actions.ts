"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();

  const num = (k: string) => Math.max(0, Number(formData.get(k) ?? 0));

  await supabase
    .from("settings")
    .update({
      electricity_price: num("electricity_price"),
      water_price: num("water_price"),
      management_fee: num("management_fee"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  revalidatePath("/admin/settings");
}
