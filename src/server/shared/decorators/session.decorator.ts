import { Result } from "../domain/result";
import type { UseCase } from "../domain/use-case";
import type { SessionManager } from "../domain/interfaces/session-manager.service";
import type { SessionData } from "../infrastructure/session-data";

export interface SessionEnrichedResponse<T> {
  data: T;
  token?: string;
}

export class SessionDecorator<TRequest, TResponse> implements UseCase {
  constructor(
    private readonly useCase: UseCase<TRequest, Result<TResponse, Error>>,
    private readonly sessionManager: SessionManager<SessionData>,
    private readonly sessionDataExtractor: (
      response: TResponse
    ) => Omit<SessionData, "iat" | "exp"> | null
  ) {}

  async execute(request: TRequest): Promise<Result<SessionEnrichedResponse<TResponse>, Error>> {
    const result = await this.useCase.execute(request);
    if (result.isFailure) {
      return Result.fail(result.error());
    }

    const responseData = result.getValue();
    const sessionData = this.sessionDataExtractor(responseData);
    if (!sessionData) {
      return Result.ok({ data: responseData });
    }

    const token = await this.sessionManager.createSession(sessionData);
    return Result.ok({ data: responseData, token });
  }
}
