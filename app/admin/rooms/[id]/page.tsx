import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, Field, PageHeader, SubmitButton } from "@/components/ui";

import { updateRoom } from "../actions";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (!room) notFound();

  return (
    <div className="max-w-lg">
      <PageHeader
        title={`Sửa phòng ${room.code}`}
        action={
          <Link href="/admin/rooms" className="text-sm text-slate-500 hover:text-slate-900">
            ← Danh sách
          </Link>
        }
      />
      <Card>
        <form action={updateRoom} className="space-y-4">
          <input type="hidden" name="id" value={room.id} />
          <Field label="Mã phòng" name="code" defaultValue={room.code} required />
          <Field label="Tên" name="name" defaultValue={room.name ?? ""} />
          <Field label="Giá thuê (đ)" name="price" type="number" defaultValue={room.price} />
          <Field
            label="Diện tích (m²)"
            name="area"
            type="number"
            step="0.1"
            defaultValue={room.area ?? ""}
          />
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Trạng thái</span>
            <select
              name="status"
              defaultValue={room.status}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="vacant">Trống</option>
              <option value="occupied">Đang thuê</option>
            </select>
          </label>
          <Field label="Ghi chú" name="note" defaultValue={room.note ?? ""} />
          <SubmitButton>Lưu</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
