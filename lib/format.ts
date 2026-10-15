export function formatVND(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("vi-VN") + " đ";
}

export function formatPeriod(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${year}`;
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
