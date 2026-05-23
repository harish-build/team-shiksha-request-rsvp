import { prisma } from "@/server/shared/infrastructure/prisma.client";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type {
  UserRepository,
  UserWithMemberships,
} from "../../domain/interfaces/repositories/user.repository";

export class PrismaUserRepository implements UserRepository {
  async findByEmailWithMemberships(email: string): Promise<UserWithMemberships | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { select: { projectId: true } } },
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      orgId: user.orgId,
      projectMembershipIds: user.memberships.map((m) => m.projectId),
    };
  }
}
