"use client";

import { usePathname, useRouter } from "next/navigation";

import { MONTHS, yearRange } from "@/lib/period";

export function PeriodSelector({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(nextMonth: number, nextYear: number) {
    router.push(`${pathname}?month=${nextMonth}&year=${nextYear}`);
  }

  const cls =
    "rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Kỳ</span>
      <select
        value={month}
        onChange={(e) => go(Number(e.target.value), year)}
        className={cls}
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            Tháng {m}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => go(month, Number(e.target.value))}
        className={cls}
      >
        {yearRange().map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
