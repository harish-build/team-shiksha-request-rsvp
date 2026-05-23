import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { Result } from "@/server/shared/domain/result";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { extractCreateProjectRequest } from "../../application/use-cases/create-project/create-project.extractor";
import type { CreateProjectUseCaseFactory } from "../../application/use-cases/create-project/create-project.factory";
import type {
  CreateProjectRequest,
  CreateProjectResponseData,
} from "../../application/use-cases/create-project/create-project.types";

export function makeCreateProjectHandler(
  factory: CreateProjectUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function createProjectHandler(req: NextRequest): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req);

    const decorated = new AuthenticateDecorator<CreateProjectRequest, CreateProjectResponseData>(
      sessionManager,
      factory.create(),
      extractCreateProjectRequest
    );
    const result = await decorated.execute(httpRequest);

    if (result.isFailure) {
      return resultToNextResponse(
        Result.fail<CreateProjectResponseData, Error>(result.error())
      );
    }
    return resultToNextResponse(
      Result.ok<CreateProjectResponseData, Error>(result.getValue()),
      { successStatus: 201 }
    );
  };
}
