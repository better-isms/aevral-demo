// Reporting queries run against the analytics replica.

import { isSignedIn } from "./auth.js";
import type { Ctx } from "./server.js";

type Row = Record<string, unknown>;
declare const replica: { query: (text: string) => Promise<Row[]> };

// Search invoices by customer name for the reports page.
export async function searchInvoiceReport(ctx: Ctx, customer: string, sortBy: string) {
  if (!isSignedIn(ctx.session)) return { ok: false as const, reason: "sign in required" };
  const workspaceId = ctx.session.user.workspaceId;
  const rows = await replica.query(
    `SELECT id, customer_name, amount_cents FROM invoices
     WHERE workspace_id = '${workspaceId}' AND customer_name ILIKE '%${customer}%'
     ORDER BY ${sortBy}`,
  );
  return { ok: true as const, data: rows };
}
