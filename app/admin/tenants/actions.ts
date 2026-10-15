"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";

export async function createTenant(_prev: unknown, formData: FormData) {
  await requireRole("admin");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const roomId = (String(formData.get("room_id") ?? "") || null) as string | null;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName) return { error: "Vui lòng nhập tên người thuê." };

  const supabase = await createClient();
  let profileId: string | null = null;

  // Tạo tài khoản đăng nhập (tùy chọn) bằng service-role.
  if (email && password) {
    if (password.length < 6) return { error: "Mật khẩu tối thiểu 6 ký tự." };
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "tenant" },
    });
    if (error) return { error: `Không tạo được tài khoản: ${error.message}` };
    profileId = data.user.id;
  }

  const { error } = await supabase.from("tenants").insert({
    full_name: fullName,
    phone: (String(formData.get("phone") ?? "").trim() || null) as string | null,
    id_number: (String(formData.get("id_number") ?? "").trim() || null) as
      | string
      | null,
    room_id: roomId,
    profile_id: profileId,
    move_in_date: (String(formData.get("move_in_date") ?? "") || null) as
      | string
      | null,
  });
  if (error) return { error: error.message };

  // Đánh dấu phòng đang thuê.
  if (roomId) {
    await supabase.from("rooms").update({ status: "occupied" }).eq("id", roomId);
  }

  revalidatePath("/admin/tenants");
  return { ok: true };
}

export async function endTenancy(formData: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const roomId = (String(formData.get("room_id") ?? "") || null) as string | null;

  await supabase
    .from("tenants")
    .update({ active: false, move_out_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);

  if (roomId) {
    await supabase.from("rooms").update({ status: "vacant" }).eq("id", roomId);
  }
  revalidatePath("/admin/tenants");
}
