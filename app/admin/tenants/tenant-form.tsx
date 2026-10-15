"use client";

import { useActionState, useEffect, useRef } from "react";

import { Field, SubmitButton } from "@/components/ui";

import { createTenant } from "./actions";

interface RoomOption {
  id: string;
  code: string;
}

export function TenantForm({ rooms }: { rooms: RoomOption[] }) {
  const [state, formAction] = useActionState(createTenant, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "ok" in state) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="grid grid-cols-2 items-end gap-4 md:grid-cols-3"
    >
      <Field label="Họ tên" name="full_name" required />
      <Field label="SĐT" name="phone" />
      <Field label="CCCD" name="id_number" />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Phòng</span>
        <select
          name="room_id"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        >
          <option value="">— Chưa gán —</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.code}
            </option>
          ))}
        </select>
      </label>
      <Field label="Ngày vào ở" name="move_in_date" type="date" />
      <div />

      <div className="col-span-2 md:col-span-3">
        <p className="mb-2 text-xs text-slate-400">
          Tài khoản đăng nhập cho người thuê (để trống nếu chưa cần)
        </p>
      </div>
      <Field label="Email đăng nhập" name="email" type="email" />
      <Field label="Mật khẩu" name="password" type="password" />
      <div className="flex items-end">
        <SubmitButton>Thêm người thuê</SubmitButton>
      </div>

      {state && "error" in state && (
        <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 md:col-span-3">
          {state.error}
        </p>
      )}
    </form>
  );
}
