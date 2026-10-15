"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { calcInvoice } from "@/lib/calc";
import type { ExtraCharge } from "@/lib/database.types";

/** Tạo (hoặc tạo lại) hóa đơn cho 1 phòng theo kỳ từ chỉ số + cài đặt giá. */
export async function generateInvoice(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();

  const roomId = String(formData.get("room_id"));
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  const [{ data: room }, { data: reading }, { data: settings }] =
    await Promise.all([
      supabase.from("rooms").select("price").eq("id", roomId).single(),
      supabase
        .from("meter_readings")
        .select("*")
        .eq("room_id", roomId)
        .eq("period_year", year)
        .eq("period_month", month)
        .single(),
      supabase.from("settings").select("*").eq("id", 1).single(),
    ]);

  if (!room || !reading || !settings) return;

  const b = calcInvoice({
    roomPrice: room.price,
    elecOld: reading.elec_old,
    elecNew: reading.elec_new,
    waterOld: reading.water_old,
    waterNew: reading.water_new,
    electricityPrice: settings.electricity_price,
    waterPrice: settings.water_price,
    managementFee: settings.management_fee,
  });

  await supabase.from("invoices").upsert(
    {
      room_id: roomId,
      period_year: year,
      period_month: month,
      room_price: b.roomPrice,
      elec_amount: b.elecAmount,
      water_amount: b.waterAmount,
      management_fee: b.managementFee,
      extra_charges: [],
      total: b.total,
      status: "unpaid",
    },
    { onConflict: "room_id,period_year,period_month" },
  );

  revalidatePath("/admin/invoices");
}

function sumTotal(row: {
  room_price: number;
  elec_amount: number;
  water_amount: number;
  management_fee: number;
  extra_charges: ExtraCharge[];
}): number {
  const extra = (row.extra_charges ?? []).reduce(
    (s, c) => s + (Number(c.amount) || 0),
    0,
  );
  return (
    row.room_price + row.elec_amount + row.water_amount + row.management_fee + extra
  );
}

export async function addExtraCharge(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  if (!name || !amount) return;

  const { data: inv } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();
  if (!inv) return;

  const extra = [...(inv.extra_charges ?? []), { name, amount }];
  await supabase
    .from("invoices")
    .update({ extra_charges: extra, total: sumTotal({ ...inv, extra_charges: extra }) })
    .eq("id", id);

  revalidatePath(`/admin/invoices/${id}`);
}

export async function removeExtraCharge(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const index = Number(formData.get("index"));

  const { data: inv } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();
  if (!inv) return;

  const extra = (inv.extra_charges ?? []).filter((_, i) => i !== index);
  await supabase
    .from("invoices")
    .update({ extra_charges: extra, total: sumTotal({ ...inv, extra_charges: extra }) })
    .eq("id", id);

  revalidatePath(`/admin/invoices/${id}`);
}

export async function setPaid(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const paid = String(formData.get("paid")) === "true";
  await supabase
    .from("invoices")
    .update({
      status: paid ? "paid" : "unpaid",
      paid_at: paid ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
}
