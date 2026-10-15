import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatVND } from "@/lib/format";
import { ActionButton, Card, PageHeader } from "@/components/ui";
import { InvoiceView } from "@/components/invoice-view";

import { addExtraCharge, removeExtraCharge, setPaid } from "../actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, rooms(code)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();
  const roomCode = (invoice.rooms as unknown as { code: string } | null)?.code;

  const input =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết hóa đơn"
        action={
          <Link href="/admin/invoices" className="text-sm text-slate-500 hover:text-slate-900">
            ← Danh sách
          </Link>
        }
      />

      <Card>
        <InvoiceView invoice={invoice} roomCode={roomCode} />
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-slate-700">Phí khác</p>
        {(invoice.extra_charges ?? []).length > 0 && (
          <ul className="mb-3 space-y-1">
            {invoice.extra_charges.map((c, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-slate-600"
              >
                <span>
                  {c.name} — {formatVND(c.amount)}
                </span>
                <form action={removeExtraCharge}>
                  <input type="hidden" name="id" value={invoice.id} />
                  <input type="hidden" name="index" value={i} />
                  <ActionButton
                    className="text-red-500 hover:text-red-700"
                    pendingText="…"
                  >
                    Xóa
                  </ActionButton>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={addExtraCharge} className="flex items-end gap-2">
          <input type="hidden" name="id" value={invoice.id} />
          <input name="name" placeholder="Tên phí (rác, xe…)" className={`${input} flex-1`} />
          <input name="amount" type="number" placeholder="Số tiền" className={`${input} w-32`} />
          <ActionButton
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            pendingText="Đang thêm…"
          >
            Thêm
          </ActionButton>
        </form>
      </Card>

      <form action={setPaid}>
        <input type="hidden" name="id" value={invoice.id} />
        <input type="hidden" name="paid" value={String(invoice.status !== "paid")} />
        <ActionButton
          className={`w-full justify-center rounded-lg py-2.5 text-sm font-medium text-white ${
            invoice.status === "paid"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
          pendingText="Đang cập nhật…"
        >
          {invoice.status === "paid" ? "Đánh dấu chưa thanh toán" : "Đánh dấu đã thanh toán"}
        </ActionButton>
      </form>
    </div>
  );
}
