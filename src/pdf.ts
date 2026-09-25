// Fake PDF renderer. Returns a text stand-in so the demo has no dependencies.

import type { Invoice } from "./db.js";

export function renderInvoicePdf(invoice: Invoice): string {
  const amount = (invoice.amountCents / 100).toFixed(2);
  return `%PDF-demo\nInvoice ${invoice.id}\nAmount: ${amount}\nStatus: ${invoice.status}\n`;
}
