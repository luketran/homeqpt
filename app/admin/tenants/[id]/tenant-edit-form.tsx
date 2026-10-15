"use client";

import { useActionState } from "react";

import { Field, SubmitButton } from "@/components/ui";
import type { Database } from "@/lib/database.types";

import { updateTenant } from "../actions";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

interface RoomOption {
  id: string;
  code: string;
}

export function TenantEditForm({
  tenant,
  rooms,
  currentEmail,
}: {
  tenant: Tenant;
  rooms: RoomOption[];
  currentEmail: string | null;
}) {
  const [state, formAction] = useActionState(updateTenant, null);
  const hasAccount = Boolean(tenant.profile_id);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={tenant.id} />

      <Field label="Họ tên" name="full_name" defaultValue={tenant.full_name} required />
      <Field label="SĐT" name="phone" defaultValue={tenant.phone ?? ""} />
      <Field label="CCCD" name="id_number" defaultValue={tenant.id_number ?? ""} />
      <Field
        label="Ngày vào ở"
        name="move_in_date"
        type="date"
        defaultValue={tenant.move_in_date ?? ""}
      />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Phòng</span>
        <select
          name="room_id"
          defaultValue={tenant.room_id ?? ""}
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

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">Tài khoản đăng nhập</p>
        <Field
          label="Email đăng nhập"
          name="email"
          type="email"
          defaultValue={currentEmail ?? ""}
        />
        <Field
          label={hasAccount ? "Mật khẩu mới" : "Mật khẩu"}
          name="password"
          type="password"
          placeholder={hasAccount ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"}
        />
        {!hasAccount && (
          <p className="text-xs text-slate-400">
            Người thuê chưa có tài khoản. Nhập email + mật khẩu để tạo mới.
          </p>
        )}
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state && "ok" in state && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Đã lưu thay đổi.
        </p>
      )}

      <div className="flex justify-end pt-2">
        <SubmitButton>Lưu</SubmitButton>
      </div>
    </form>
  );
}
