export type Role = "SUPERADMIN" | "ADMIN" | "MEMBER";

export interface Actor {
  userId: string;
  email: string;
  role: Role;
  orgId: string | null;
  projectMembershipIds: string[];
}
