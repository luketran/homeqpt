import { currentPeriod } from "@/lib/format";

/** Đọc month/year từ query, mặc định kỳ hiện tại. */
export function resolvePeriod(sp: {
  month?: string;
  year?: string;
}): { month: number; year: number } {
  const cur = currentPeriod();
  const month = Number(sp.month) || cur.month;
  const year = Number(sp.year) || cur.year;
  return { month, year };
}

export function prevPeriod(month: number, year: number) {
  return month === 1
    ? { month: 12, year: year - 1 }
    : { month: month - 1, year };
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function yearRange(): number[] {
  const y = new Date().getFullYear();
  return [y - 2, y - 1, y, y + 1];
}
