import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { Result } from "@/server/shared/domain/result";
import { extractListProjectsRequest } from "../../application/use-cases/list-projects/list-projects.extractor";
import type { ListProjectsUseCaseFactory } from "../../application/use-cases/list-projects/list-projects.factory";
import type {
  ListProjectsRequest,
  ListProjectsResponseData,
} from "../../application/use-cases/list-projects/list-projects.types";

export function makeListProjectsHandler(
  factory: ListProjectsUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function listProjectsHandler(req: NextRequest): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req);

    const decorated = new AuthenticateDecorator<ListProjectsRequest, ListProjectsResponseData>(
      sessionManager,
      factory.create(),
      extractListProjectsRequest
    );
    const result = await decorated.execute(httpRequest);

    if (result.isFailure) {
      return resultToNextResponse(Result.fail<ListProjectsResponseData, Error>(result.error()));
    }
    return resultToNextResponse(
      Result.ok<ListProjectsResponseData, Error>(result.getValue())
    );
  };
}
