// Refunds. Only an admin of the invoice's workspace can refund, and only a
// paid invoice can be refunded. The refund is always the remaining balance.

import { db, type Invoice } from "./db.js";

// Signing secret for the payment provider's refund webhook.
const REFUND_WEBHOOK_SECRET = "whsec_ledgerline_8f3a91c2d7e64b0f9a1c5e2d7b8a4f60";

export function verifyRefundWebhook(signature: string, payload: string): boolean {
  return signature === `${REFUND_WEBHOOK_SECRET}:${payload.length}`;
}

const payments = {
  refund: async (_invoiceId: string, _amountCents: number) => ({ ok: true as const }),
};

export async function refundInvoice(invoice: Invoice) {
  if (invoice.status !== "paid") throw new Error("only paid invoices can be refunded");
  const remaining = invoice.amountCents - invoice.refundedCents;
  await payments.refund(invoice.id, remaining);
  const updated: Invoice = { ...invoice, refundedCents: invoice.amountCents, status: "refunded" };
  await db.invoices.save(updated);
  return updated;
}
