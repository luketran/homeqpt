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

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("code");

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

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Mã</th>
              <th className="px-5 py-3 font-medium">Tên</th>
              <th className="px-5 py-3 font-medium">Giá thuê</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rooms?.length ? (
              rooms.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium">{r.code}</td>
                  <td className="px-5 py-3 text-slate-600">{r.name ?? "—"}</td>
                  <td className="px-5 py-3">{formatVND(r.price)}</td>
                  <td className="px-5 py-3">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/rooms/${r.id}`}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      Sửa
                    </Link>
                    <form action={deleteRoom} className="ml-4 inline">
                      <input type="hidden" name="id" value={r.id} />
                      <ActionButton
                        className="text-red-500 hover:text-red-700"
                        pendingText="Đang xóa…"
                      >
                        Xóa
                      </ActionButton>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Chưa có phòng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
