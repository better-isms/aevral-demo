// Tiny fake HTTP layer. `routes` maps a name to a handler; there is no real
// server here. It wires the endpoints the demo's pull requests touch.

import { db } from "./db.js";
import { audit } from "./audit.js";
import { isAdmin, isSignedIn, sameWorkspace, type Session } from "./auth.js";
import { refundInvoice } from "./billing.js";
import { renderInvoicePdf } from "./pdf.js";

export type Ctx = { session: Session | null; headers: Record<string, string | undefined> };

function deny(reason: string) {
  return { ok: false as const, reason };
}
function ok<T>(data: T) {
  return { ok: true as const, data };
}

export const routes = {
  // List the invoices of the caller's workspace.
  listInvoices: async (ctx: Ctx) => {
    if (!isSignedIn(ctx.session)) return deny("sign in required");
    return ok(await db.invoices.listByWorkspace(ctx.session.user.workspaceId));
  },

  // Read one invoice. It must belong to the caller's workspace.
  getInvoice: async (ctx: Ctx, invoiceId: string) => {
    if (!isSignedIn(ctx.session)) return deny("sign in required");
    const invoice = await db.invoices.get(invoiceId);
    if (!invoice || !sameWorkspace(ctx.session, invoice)) return deny("not found");
    return ok(invoice);
  },

  // Download an invoice as a PDF, for the new "Download" button.
  downloadInvoicePdf: async (ctx: Ctx, invoiceId: string) => {
    if (!isSignedIn(ctx.session)) return deny("sign in required");
    const invoice = await db.invoices.get(invoiceId);
    if (!invoice) return deny("not found");
    return ok({ filename: `invoice-${invoice.id}.pdf`, pdf: renderInvoicePdf(invoice) });
  },

  // Refund an invoice. Workspace admins only.
  refund: async (ctx: Ctx, invoiceId: string) => {
    if (!isSignedIn(ctx.session) || !isAdmin(ctx.session)) return deny("admin only");
    const invoice = await db.invoices.get(invoiceId);
    if (!invoice || !sameWorkspace(ctx.session, invoice)) return deny("not found");
    const updated = await refundInvoice(invoice);
    await audit.log("invoice.refund", { actor: ctx.session.user.id, invoiceId });
    return ok(updated);
  },

  // Export every user and invoice of the workspace. Workspace admins only.
  exportWorkspace: async (ctx: Ctx) => {
    if (!isSignedIn(ctx.session) || !isAdmin(ctx.session)) return deny("admin only");
    const workspaceId = ctx.session.user.workspaceId;
    const [users, invoices] = await Promise.all([
      db.users.listByWorkspace(workspaceId),
      db.invoices.listByWorkspace(workspaceId),
    ]);
    await audit.log("workspace.export", { actor: ctx.session.user.id, workspaceId });
    return ok({ users, invoices });
  },

  // List the documents of the caller's workspace.
  listDocs: async (ctx: Ctx) => {
    if (!isSignedIn(ctx.session)) return deny("sign in required");
    return ok(await db.docs.listByWorkspace(ctx.session.user.workspaceId));
  },

  // Edit a comment. Only its author can edit it.
  editComment: async (ctx: Ctx, commentId: string, text: string) => {
    if (!isSignedIn(ctx.session)) return deny("sign in required");
    const comment = await db.comments.get(commentId);
    if (!comment || !sameWorkspace(ctx.session, comment)) return deny("not found");
    if (comment.authorId !== ctx.session.user.id) return deny("only the author can edit");
    const updated = { ...comment, text };
    await db.comments.save(updated);
    return ok(updated);
  },
};
