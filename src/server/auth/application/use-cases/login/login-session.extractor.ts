import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Actor } from "../../../domain/entities/actor";

export function extractLoginSessionData(
  actor: Actor
): Omit<SessionData, "iat" | "exp"> {
  return {
    userId: actor.userId,
    email: actor.email,
    role: actor.role,
    orgId: actor.orgId,
    projectMembershipIds: actor.projectMembershipIds,
  };
}
