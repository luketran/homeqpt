import type { ExtraCharge } from "@/lib/database.types";

export interface InvoiceInput {
  roomPrice: number;
  elecOld: number;
  elecNew: number;
  waterOld: number;
  waterNew: number;
  electricityPrice: number; // đ/kWh
  waterPrice: number; // đ/m3
  managementFee: number;
  extraCharges?: ExtraCharge[];
}

export interface InvoiceBreakdown {
  roomPrice: number;
  elecUsage: number;
  elecAmount: number;
  waterUsage: number;
  waterAmount: number;
  managementFee: number;
  extraTotal: number;
  total: number;
}

/**
 * Tổng = tiền phòng
 *      + (điện mới − cũ) × giá điện
 *      + (nước mới − cũ) × giá nước
 *      + phí quản lý
 *      + tổng các phí khác (nếu có)
 */
export function calcInvoice(input: InvoiceInput): InvoiceBreakdown {
  const elecUsage = Math.max(0, input.elecNew - input.elecOld);
  const waterUsage = Math.max(0, input.waterNew - input.waterOld);

  const elecAmount = Math.round(elecUsage * input.electricityPrice);
  const waterAmount = Math.round(waterUsage * input.waterPrice);
  const extraTotal = (input.extraCharges ?? []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  const total =
    input.roomPrice +
    elecAmount +
    waterAmount +
    input.managementFee +
    extraTotal;

  return {
    roomPrice: input.roomPrice,
    elecUsage,
    elecAmount,
    waterUsage,
    waterAmount,
    managementFee: input.managementFee,
    extraTotal,
    total,
  };
}
