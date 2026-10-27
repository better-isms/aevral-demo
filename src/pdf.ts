// Render a document to PDF with the system wkhtmltopdf binary.

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { db } from "./db.js";
import { isSignedIn, sameWorkspace } from "./auth.js";
import type { Ctx } from "./server.js";

const run = promisify(exec);

export async function exportDocPdf(ctx: Ctx, docId: string, fileName: string) {
  if (!isSignedIn(ctx.session)) return { ok: false as const, reason: "sign in required" };
  const doc = await db.docs.get(docId);
  if (!doc || !sameWorkspace(ctx.session, doc)) return { ok: false as const, reason: "not found" };
  // fileName comes from the "Save as" box in the export dialog.
  await run(`wkhtmltopdf /tmp/render/${doc.id}.html /tmp/out/${fileName}.pdf`);
  return { ok: true as const, data: { path: `/tmp/out/${fileName}.pdf` } };
}
