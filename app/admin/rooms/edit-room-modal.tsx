"use client";

import { useEffect, useState } from "react";

import { Field, SubmitButton } from "@/components/ui";
import type { Database } from "@/lib/database.types";

import { updateRoom } from "./actions";

type Room = Database["public"]["Tables"]["rooms"]["Row"];

export function EditRoomModal({ room }: { room: Room }) {
  const [open, setOpen] = useState(false);

  // Đóng modal bằng phím Esc + khoá cuộn nền khi mở.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-slate-500 hover:text-slate-900"
      >
        Sửa
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Sửa phòng {room.code}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateRoom(formData);
                setOpen(false);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={room.id} />
              <Field label="Mã phòng" name="code" defaultValue={room.code} required />
              <Field label="Tên" name="name" defaultValue={room.name ?? ""} />
              <Field
                label="Giá thuê (đ)"
                name="price"
                type="number"
                defaultValue={room.price}
              />
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Huỷ
                </button>
                <SubmitButton>Lưu</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
