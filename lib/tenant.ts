import { createClient } from "@/lib/supabase/server";

export interface MyRoom {
  tenantId: string;
  roomId: string;
  roomCode: string;
  roomPrice: number;
}

/** Phòng mà người thuê đang đăng nhập đang ở (active). */
export async function getMyRoom(): Promise<MyRoom | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("tenants")
    .select("id, room_id, rooms(code, price)")
    .eq("profile_id", user.id)
    .eq("active", true)
    .not("room_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!data || !data.room_id) return null;
  const room = data.rooms as unknown as { code: string; price: number } | null;
  if (!room) return null;

  return {
    tenantId: data.id,
    roomId: data.room_id,
    roomCode: room.code,
    roomPrice: room.price,
  };
}
