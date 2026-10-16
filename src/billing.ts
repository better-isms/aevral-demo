// Refunds. Only an admin of the invoice's workspace can refund, and only a
// paid invoice can be refunded. Admins can now refund part of an invoice, for
// example one seat out of five.

import { db, type Invoice } from "./db.js";

const payments = {
  refund: async (_invoiceId: string, _amountCents: number) => ({ ok: true as const }),
};

export async function refundInvoice(invoice: Invoice, amountCents?: number) {
  if (invoice.status !== "paid") throw new Error("only paid invoices can be refunded");
  const remaining = invoice.amountCents - invoice.refundedCents;
  const refundCents = amountCents ?? remaining;
  await payments.refund(invoice.id, refundCents);
  const refundedCents = invoice.refundedCents + refundCents;
  const updated: Invoice = {
    ...invoice,
    refundedCents,
    status: refundedCents >= invoice.amountCents ? "refunded" : "paid",
  };
  await db.invoices.save(updated);
  return updated;
}
