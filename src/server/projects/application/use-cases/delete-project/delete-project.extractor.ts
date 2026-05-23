import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { DeleteProjectRequest } from "./delete-project.types";

export function extractDeleteProjectRequest(
  decoded: SessionData,
  request: NextHttpRequest
): DeleteProjectRequest {
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
    projectId: request.params.id ?? "",
  };
}
