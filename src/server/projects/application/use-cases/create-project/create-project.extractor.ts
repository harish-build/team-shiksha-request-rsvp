import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { CreateProjectRequest } from "./create-project.types";

export function extractCreateProjectRequest(
  decoded: SessionData,
  request: NextHttpRequest
): CreateProjectRequest {
  const body = (request.body ?? {}) as { name?: string; orgId?: string };
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
    name: body.name ?? "",
    orgId: body.orgId ?? "",
  };
}
