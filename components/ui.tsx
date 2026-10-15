import type { ReactNode } from "react";

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
      />
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-amber-50 text-amber-700",
  vacant: "bg-slate-100 text-slate-600",
  occupied: "bg-blue-50 text-blue-700",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
  vacant: "Trống",
  occupied: "Đang thuê",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
