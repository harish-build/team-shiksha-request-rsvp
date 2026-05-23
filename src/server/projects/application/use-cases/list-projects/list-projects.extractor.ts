import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { ListProjectsRequest } from "./list-projects.types";

export function extractListProjectsRequest(
  decoded: SessionData,
  _request: NextHttpRequest
): ListProjectsRequest {
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
    actorProjectIds: decoded.projectMembershipIds,
  };
}
