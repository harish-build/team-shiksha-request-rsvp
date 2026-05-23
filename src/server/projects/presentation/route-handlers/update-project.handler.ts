import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { Result } from "@/server/shared/domain/result";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { extractUpdateProjectRequest } from "../../application/use-cases/update-project/update-project.extractor";
import type { UpdateProjectUseCaseFactory } from "../../application/use-cases/update-project/update-project.factory";
import type {
  UpdateProjectRequest,
  UpdateProjectResponseData,
} from "../../application/use-cases/update-project/update-project.types";

export function makeUpdateProjectHandler(
  factory: UpdateProjectUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function updateProjectHandler(
    req: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req, params);

    const decorated = new AuthenticateDecorator<UpdateProjectRequest, UpdateProjectResponseData>(
      sessionManager,
      factory.create(),
      extractUpdateProjectRequest
    );
    const result = await decorated.execute(httpRequest);

    if (result.isFailure) {
      return resultToNextResponse(
        Result.fail<UpdateProjectResponseData, Error>(result.error())
      );
    }
    return resultToNextResponse(
      Result.ok<UpdateProjectResponseData, Error>(result.getValue())
    );
  };
}
