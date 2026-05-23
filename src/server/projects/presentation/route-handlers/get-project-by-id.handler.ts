import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { Result } from "@/server/shared/domain/result";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { extractGetProjectByIdRequest } from "../../application/use-cases/get-project-by-id/get-project-by-id.extractor";
import type { GetProjectByIdUseCaseFactory } from "../../application/use-cases/get-project-by-id/get-project-by-id.factory";
import type {
  GetProjectByIdRequest,
  GetProjectByIdResponseData,
} from "../../application/use-cases/get-project-by-id/get-project-by-id.types";

export function makeGetProjectByIdHandler(
  factory: GetProjectByIdUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function getProjectByIdHandler(
    req: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req, params);

    const decorated = new AuthenticateDecorator<GetProjectByIdRequest, GetProjectByIdResponseData>(
      sessionManager,
      factory.create(),
      extractGetProjectByIdRequest
    );
    const result = await decorated.execute(httpRequest);

    if (result.isFailure) {
      return resultToNextResponse(
        Result.fail<GetProjectByIdResponseData, Error>(result.error())
      );
    }
    return resultToNextResponse(
      Result.ok<GetProjectByIdResponseData, Error>(result.getValue())
    );
  };
}
