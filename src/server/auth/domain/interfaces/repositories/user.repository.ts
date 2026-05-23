import type { Role } from "@/server/shared/infrastructure/session-data";

export interface UserWithMemberships {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  orgId: string | null;
  projectMembershipIds: string[];
}

export interface UserRepository {
  findByEmailWithMemberships(email: string): Promise<UserWithMemberships | null>;
}
