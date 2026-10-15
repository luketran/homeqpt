"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]" />
  );
}

/**
 * Nút submit bên trong <form action={serverAction}> — tự hiện loading
 * khi form đang gửi (useFormStatus). Truyền className để đổi style.
 */
export function ActionButton({
  children,
  className = "",
  pendingText,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && <Spinner />}
      {pending ? (pendingText ?? children) : children}
    </button>
  );
}

/** Nút submit chính (style mặc định đậm). */
export function SubmitButton({
  children,
  pendingText = "Đang lưu…",
}: {
  children: ReactNode;
  pendingText?: ReactNode;
}) {
  return (
    <ActionButton
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      pendingText={pendingText}
    >
      {children}
    </ActionButton>
  );
}
