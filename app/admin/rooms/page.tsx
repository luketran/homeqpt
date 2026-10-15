import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatVND } from "@/lib/format";
import {
  ActionButton,
  Badge,
  Card,
  Field,
  PageHeader,
  SubmitButton,
} from "@/components/ui";

import { createRoom, deleteRoom } from "./actions";
import { EditRoomModal } from "./edit-room-modal";

export default async function RoomsPage() {
  const supabase = await createClient();
  const [{ data: rooms }, { data: tenants }] = await Promise.all([
    supabase.from("rooms").select("*").order("code"),
    supabase
      .from("tenants")
      .select("id, full_name, room_id")
      .eq("active", true),
  ]);

  const tenantByRoom = new Map(
    (tenants ?? [])
      .filter((t) => t.room_id)
      .map((t) => [t.room_id as string, t]),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Phòng" />

      <Card>
        <form
          action={createRoom}
          className="grid grid-cols-2 items-end gap-4 md:grid-cols-4"
        >
          <Field label="Mã phòng" name="code" required placeholder="101" />
          <Field label="Tên" name="name" placeholder="Tầng 1" />
          <Field label="Giá thuê (đ)" name="price" type="number" />
          <Field label="Diện tích (m²)" name="area" type="number" step="0.1" />
          <div className="col-span-2 md:col-span-4">
            <SubmitButton>Thêm phòng</SubmitButton>
          </div>
        </form>
      </Card>

      {rooms?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((r) => {
            const tenant = tenantByRoom.get(r.id);
            return (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Phòng {r.code}
                  </p>
                  {r.name && (
                    <p className="text-sm text-slate-500">{r.name}</p>
                  )}
                </div>
                <Badge status={r.status} />
              </div>

              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá thuê</span>
                  <span className="font-medium text-slate-900">
                    {formatVND(r.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diện tích</span>
                  <span className="font-medium text-slate-900">
                    {r.area ? `${r.area} m²` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người thuê</span>
                  {tenant ? (
                    <Link
                      href={`/admin/tenants/${tenant.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {tenant.full_name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 border-t border-slate-100 pt-3 text-sm">
                <EditRoomModal room={r} />
                <form action={deleteRoom} className="inline">
                  <input type="hidden" name="id" value={r.id} />
                  <ActionButton
                    className="text-red-500 hover:text-red-700"
                    pendingText="Đang xóa…"
                  >
                    Xóa
                  </ActionButton>
                </form>
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="py-8 text-center text-slate-400">Chưa có phòng nào.</p>
        </Card>
      )}
    </div>
  );
}
