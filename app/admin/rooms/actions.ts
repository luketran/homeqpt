"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { RoomStatus } from "@/lib/database.types";

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("rooms").insert({
    code: String(formData.get("code") ?? "").trim(),
    name: (String(formData.get("name") ?? "").trim() || null) as string | null,
    price: Math.max(0, Number(formData.get("price") ?? 0)),
    area: formData.get("area") ? Number(formData.get("area")) : null,
    note: (String(formData.get("note") ?? "").trim() || null) as string | null,
  });
  revalidatePath("/admin/rooms");
}

export async function updateRoom(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase
    .from("rooms")
    .update({
      code: String(formData.get("code") ?? "").trim(),
      name: (String(formData.get("name") ?? "").trim() || null) as string | null,
      price: Math.max(0, Number(formData.get("price") ?? 0)),
      area: formData.get("area") ? Number(formData.get("area")) : null,
      status: String(formData.get("status") ?? "vacant") as RoomStatus,
      note: (String(formData.get("note") ?? "").trim() || null) as string | null,
    })
    .eq("id", id);
  revalidatePath("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/rooms");
}
