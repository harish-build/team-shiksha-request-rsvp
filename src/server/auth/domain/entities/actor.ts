import type { Role } from "@/server/shared/infrastructure/session-data";

export interface Actor {
  userId: string;
  email: string;
  role: Role;
  orgId: string | null;
  projectMembershipIds: string[];
}
