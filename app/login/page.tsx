"use client";

import { useActionState } from "react";

import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-sm"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Quản lý phòng trọ</h1>
          <p className="text-sm text-slate-500">Đăng nhập để tiếp tục</p>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Mật khẩu</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
        </label>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
