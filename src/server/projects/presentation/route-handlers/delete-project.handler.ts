import { NextResponse, type NextRequest } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { Result } from "@/server/shared/domain/result";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { extractDeleteProjectRequest } from "../../application/use-cases/delete-project/delete-project.extractor";
import type { DeleteProjectUseCaseFactory } from "../../application/use-cases/delete-project/delete-project.factory";
import type {
  DeleteProjectRequest,
  DeleteProjectResponseData,
} from "../../application/use-cases/delete-project/delete-project.types";

export function makeDeleteProjectHandler(
  factory: DeleteProjectUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function deleteProjectHandler(
    req: NextRequest,
    params: { id: string }
  ): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req, params);

    const decorated = new AuthenticateDecorator<DeleteProjectRequest, DeleteProjectResponseData>(
      sessionManager,
      factory.create(),
      extractDeleteProjectRequest
    );
    const result = await decorated.execute(httpRequest);

    if (result.isSuccess) {
      return new NextResponse(null, { status: 204 });
    }
    return resultToNextResponse(
      Result.fail<DeleteProjectResponseData, Error>(result.error())
    );
  };
}
