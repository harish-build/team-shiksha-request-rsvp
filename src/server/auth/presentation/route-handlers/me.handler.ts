import type { NextRequest, NextResponse } from "next/server";
import { AuthenticateDecorator } from "@/server/shared/decorators/authenticate.decorator";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { Result } from "@/server/shared/domain/result";
import type { Actor } from "../../domain/entities/actor";
import { extractGetActorRequest } from "../../application/use-cases/get-actor/get-actor.extractor";
import { GetActorUseCase } from "../../application/use-cases/get-actor/get-actor.use-case";

export function makeMeHandler(sessionManager: JwtSessionManager<SessionData>) {
  return async function meHandler(req: NextRequest): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req);
    const decorated = new AuthenticateDecorator<ReturnType<typeof extractGetActorRequest>, Actor>(
      sessionManager,
      new GetActorUseCase(),
      extractGetActorRequest
    );
    const result = await decorated.execute(httpRequest);
    if (result.isFailure) {
      return resultToNextResponse(Result.fail<{ actor: Actor }, Error>(result.error()));
    }
    return resultToNextResponse(Result.ok<{ actor: Actor }, Error>({ actor: result.getValue() }));
  };
}
