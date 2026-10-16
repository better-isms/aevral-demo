// Synthetic in-memory data layer. Not a real database.
// Every record belongs to exactly one workspace (tenant). Handlers must scope
// every read and write to the caller's workspace.

export type Role = "member" | "admin";
export type User = { id: string; workspaceId: string; role: Role };
export type Invoice = {
  id: string;
  workspaceId: string;
  amountCents: number;
  refundedCents: number;
  status: "open" | "paid" | "refunded";
};
export type Doc = { id: string; workspaceId: string; title: string; body: string };
export type Comment = { id: string; workspaceId: string; docId: string; authorId: string; text: string };

const users = new Map<string, User>();
const invoices = new Map<string, Invoice>();
const docs = new Map<string, Doc>();
const comments = new Map<string, Comment>();

export const db = {
  users: {
    get: async (id: string) => users.get(id),
    listByWorkspace: async (workspaceId: string) =>
      [...users.values()].filter((u) => u.workspaceId === workspaceId),
  },
  invoices: {
    get: async (id: string) => invoices.get(id),
    listByWorkspace: async (workspaceId: string) =>
      [...invoices.values()].filter((i) => i.workspaceId === workspaceId),
    save: async (invoice: Invoice) => void invoices.set(invoice.id, invoice),
  },
  docs: {
    get: async (id: string) => docs.get(id),
    listByWorkspace: async (workspaceId: string) =>
      [...docs.values()].filter((d) => d.workspaceId === workspaceId),
    search: async (query: string) => {
      const q = query.toLowerCase();
      return [...docs.values()].filter(
        (d) => d.title.toLowerCase().includes(q) || d.body.toLowerCase().includes(q),
      );
    },
  },
  comments: {
    get: async (id: string) => comments.get(id),
    save: async (comment: Comment) => void comments.set(comment.id, comment),
  },
};
