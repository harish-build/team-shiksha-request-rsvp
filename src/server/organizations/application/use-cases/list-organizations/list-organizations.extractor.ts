import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import type { ListOrganizationsRequest } from "./list-organizations.types";

export function extractListOrganizationsRequest(
  decoded: SessionData,
  _request: NextHttpRequest
): ListOrganizationsRequest {
  return {
    actorRole: decoded.role,
    actorOrgId: decoded.orgId,
  };
}
