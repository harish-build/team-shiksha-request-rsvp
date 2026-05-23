import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { Result } from "@/server/shared/domain/result";
import { extractListOrganizationsRequest } from "../../application/use-cases/list-organizations/list-organizations.extractor";
import type { ListOrganizationsUseCaseFactory } from "../../application/use-cases/list-organizations/list-organizations.factory";
import type {
  ListOrganizationsRequest,
  ListOrganizationsResponseData,
} from "../../application/use-cases/list-organizations/list-organizations.types";

export function makeListOrganizationsHandler(
  factory: ListOrganizationsUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function listOrganizationsHandler(req: NextRequest): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req);

    const decorated = new AuthenticateDecorator<
      ListOrganizationsRequest,
      ListOrganizationsResponseData
    >(sessionManager, factory.create(), extractListOrganizationsRequest);
    const result = await decorated.execute(httpRequest);

    if (result.isFailure) {
      return resultToNextResponse(
        Result.fail<ListOrganizationsResponseData, Error>(result.error())
      );
    }
    return resultToNextResponse(
      Result.ok<ListOrganizationsResponseData, Error>(result.getValue())
    );
  };
}
