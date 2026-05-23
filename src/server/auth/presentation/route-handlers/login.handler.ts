import type { NextRequest, NextResponse } from "next/server";
import { SessionDecorator } from "@/server/shared/decorators/session.decorator";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { NextHttpRequest } from "@/server/shared/infrastructure/http/next-http-request";
import { resultToNextResponse } from "@/server/shared/infrastructure/http/result-to-next-response";
import type { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { Result } from "@/server/shared/domain/result";
import type { Actor } from "../../domain/entities/actor";
import { extractLoginSessionData } from "../../application/use-cases/login/login-session.extractor";
import type { LoginUseCaseFactory } from "../../application/use-cases/login/login.factory";
import type { LoginRequest } from "../../application/use-cases/login/login.types";

const SESSION_MAX_AGE_SECONDS = 60 * 60;

export function makeLoginHandler(
  loginFactory: LoginUseCaseFactory,
  sessionManager: JwtSessionManager<SessionData>
) {
  return async function loginHandler(req: NextRequest): Promise<NextResponse> {
    const httpRequest = await NextHttpRequest.fromNextRequest(req);
    const body = (httpRequest.body ?? {}) as Partial<LoginRequest>;

    const inner = loginFactory.create();
    const decorated = new SessionDecorator(inner, sessionManager, extractLoginSessionData);
    const result = await decorated.execute({
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if (result.isFailure) {
      return resultToNextResponse(Result.fail<Actor, Error>(result.error()));
    }

    const { data: actor, token } = result.getValue();
    return resultToNextResponse(Result.ok<{ actor: Actor }, Error>({ actor }), {
      setCookie: token
        ? { name: SESSION_COOKIE_NAME, value: token, maxAgeSeconds: SESSION_MAX_AGE_SECONDS }
        : undefined,
    });
  };
}
