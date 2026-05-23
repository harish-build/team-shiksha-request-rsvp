import { AuthenticationError } from "../domain/errors";
import { Result } from "../domain/result";
import type { UseCase } from "../domain/use-case";
import type { NextHttpRequest } from "../infrastructure/http/next-http-request";
import type { SessionManager } from "../domain/interfaces/session-manager.service";
import type { SessionData } from "../infrastructure/session-data";

export const SESSION_COOKIE_NAME = "session";

export class AuthenticateDecorator<TUseCaseInput, TResponse> implements UseCase {
  constructor(
    private readonly sessionManager: SessionManager<SessionData>,
    private readonly useCase: UseCase<TUseCaseInput, Result<TResponse, Error>>,
    private readonly extractor: (decoded: SessionData, request: NextHttpRequest) => TUseCaseInput
  ) {}

  async execute(request: NextHttpRequest): Promise<Result<TResponse, Error>> {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return Result.fail(new AuthenticationError("Session cookie missing"));
    }

    const decoded = await this.sessionManager.validateSession(token);
    if (!decoded || !decoded.userId || !decoded.role) {
      return Result.fail(new AuthenticationError("Invalid or expired session"));
    }

    const useCaseInput = this.extractor(decoded, request);
    return this.useCase.execute(useCaseInput);
  }
}
