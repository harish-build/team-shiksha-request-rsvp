import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { UpdateProjectRequest } from "./update-project.types";

export function extractUpdateProjectRequest(
  decoded: SessionData,
  request: NextHttpRequest
): UpdateProjectRequest {
  const body = (request.body ?? {}) as { name?: string };
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
    projectId: request.params.id ?? "",
    name: body.name ?? "",
  };
}
