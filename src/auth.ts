// Session and authorization helpers.

import type { User } from "./db.js";

export type Session = { user: User };

export function isSignedIn(session: Session | null): session is Session {
  return session != null;
}

export function isAdmin(session: Session): boolean {
  return session.user.role === "admin";
}

// Tenant check: the record must belong to the caller's workspace.
export function sameWorkspace(session: Session, record: { workspaceId: string }): boolean {
  return record.workspaceId === session.user.workspaceId;
}
