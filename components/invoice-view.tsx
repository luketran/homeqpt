import { formatVND, formatPeriod } from "@/lib/format";
import { Badge } from "@/components/ui";
import type { Database } from "@/lib/database.types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function InvoiceView({
  invoice,
  roomCode,
}: {
  invoice: Invoice;
  roomCode?: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Kỳ {formatPeriod(invoice.period_month, invoice.period_year)}
            {roomCode ? ` · Phòng ${roomCode}` : ""}
          </p>
        </div>
        <Badge status={invoice.status} />
      </div>

      <div className="divide-y divide-slate-100">
        <Line label="Tiền phòng" value={formatVND(invoice.room_price)} />
        <Line label="Tiền điện" value={formatVND(invoice.elec_amount)} />
        <Line label="Tiền nước" value={formatVND(invoice.water_amount)} />
        <Line label="Phí quản lý" value={formatVND(invoice.management_fee)} />
        {(invoice.extra_charges ?? []).map((c, i) => (
          <Line key={i} label={c.name} value={formatVND(c.amount)} />
        ))}
      </div>

      <div className="mt-3 flex justify-between border-t-2 border-slate-900 pt-3">
        <span className="font-semibold">Tổng cộng</span>
        <span className="text-lg font-semibold">{formatVND(invoice.total)}</span>
      </div>
    </div>
  );
}
