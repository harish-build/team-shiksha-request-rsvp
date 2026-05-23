import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { GetActorRequest } from "./get-actor.types";

export function extractGetActorRequest(decoded: SessionData): GetActorRequest {
  return {
    actor: {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      orgId: decoded.orgId,
      projectMembershipIds: decoded.projectMembershipIds,
    },
  };
}
