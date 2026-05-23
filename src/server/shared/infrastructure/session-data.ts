import type { BaseSessionPayload } from "../domain/interfaces/session-manager.service";

export type Role = "SUPERADMIN" | "ADMIN" | "MEMBER";

export interface SessionData extends BaseSessionPayload {
  userId: string;
  email: string;
  role: Role;
  orgId: string | null;
  projectMembershipIds: string[];
}
