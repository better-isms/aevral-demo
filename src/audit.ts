// Minimal audit log. In a real system this would be a durable store; here it
// is an array so the demo runs with no dependencies.

type AuditEntry = { action: string; meta: Record<string, unknown>; at: number };

const entries: AuditEntry[] = [];

export const audit = {
  log: async (action: string, meta: Record<string, unknown>) => {
    entries.push({ action, meta, at: Date.now() });
  },
};

/** Number of audit entries recorded so far (G10 dev E2E scratch change, never merged). */
export function auditCount(): number {
  return entries.length;
}
