import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { GetProjectByIdRequest } from "./get-project-by-id.types";

export function extractGetProjectByIdRequest(
  decoded: SessionData,
  request: NextHttpRequest
): GetProjectByIdRequest {
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
    actorProjectIds: decoded.projectMembershipIds,
    projectId: request.params.id ?? "",
  };
}
