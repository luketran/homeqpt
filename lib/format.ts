export function formatVND(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("vi-VN") + " đ";
}

export function formatPeriod(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${year}`;
}

/** Định dạng ngày về dd-mm-yyyy (nhận chuỗi ISO yyyy-mm-dd hoặc timestamp). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-"); // [yyyy, mm, dd]
  if (parts.length !== 3) return value;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function currentPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
